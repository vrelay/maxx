const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("./config");

admin.initializeApp();

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const bucket = admin.storage().bucket();

// System Prompt for Analysis (Gemini 2.5 Pro)
const ANALYSIS_SYSTEM_PROMPT = `ROLE: You are a professional looksmaxxing consultant and photo art director.
GOAL: Evaluate the user's three photos (front, side, full body). Produce safe, respectful, highly actionable advice that improves perceived attractiveness while preserving identity and realism.
CONTEXT: The next step will feed your "edit_brief_front" into an image editing model to enhance the front selfie realistically.
CONSTRAINTS:
- Stay within grooming, posture, styling, and reversible changes.
- No medical or invasive procedures; no diagnosis.
- Use precise, plain language; avoid shaming; be encouraging.
- Prioritize changes by impact vs. difficulty.
OUTPUT: Follow the JSON schema exactly; no extra prose.`;

// System Prompt for Image Editing (Gemini 2.5 Flash Preview)
const EDITING_SYSTEM_PROMPT = `ROLE: You are a professional portrait retoucher.
GOAL: Apply the incoming edit brief to the provided front selfie while preserving identity and realism.
RULES:
- Keep natural skin texture (no plastic/waxy look).
- Subtle, believable micro-adjustments only.
- No age/ethnicity changes, no face swaps, no body morphing.
- Follow negative list strictly (avoid halos, HDR glow, porcelain skin, over-whitened teeth).
OUTPUT: 4:5 or 3:4 portrait, high-res. Crop minimally.`;

// Transform prompt templates
const TRANSFORM_PROMPT_TEMPLATE = `REFERENCE_IMAGE: <lm_front>
TASK: Recompose the same person into a new view while preserving identity and the exact looksmaxxed styling (hair, brows, skin finish) from the reference.

VIEW: {VIEW}
POSE: {POSE}
ENVIRONMENT: {ENVIRONMENT}
WARDROBE: Tasteful, well-fitting neutral outfit aligned with smart casual style
LIGHTING: soft key, natural contrast; accurate skin tones
NEGATIVE: over-smoothed/waxy skin, porcelain/fake texture, cartoon/anime/CGI, extreme symmetry, warped anatomy, altered eye color, heavy makeup, fake catchlights, over-whitened teeth, overly sharp beard edges, lens warping, unreal bokeh, beauty-filter look, HDR glow, vignettes

OUTPUT: high-res, {OUTPUT_FORMAT}

Maintain photorealism and identity. Avoid artifacts (waxy skin, HDR halos, CG look).`;

// Specific transform configurations
const TRANSFORM_CONFIGS = {
  SIDE_PROFILE: {
    VIEW: "SIDE_PROFILE",
    POSE: "neutral expression, chin slightly forward, 90° profile",
    ENVIRONMENT: "clean studio backdrop with soft gradient",
    OUTPUT_FORMAT: "4:5 portrait format",
  },
  FULL_BODY: {
    VIEW: "FULL_BODY",
    POSE: "relaxed, shoulders back, balanced stance, hands relaxed",
    ENVIRONMENT: "minimal interior or studio cyclorama",
    OUTPUT_FORMAT: "3:4 or 9:16 full-body format",
  },
  ACTION_FULL_BODY: {
    VIEW: "ACTION_FULL_BODY",
    POSE: "walking in mid-step, natural arm swing",
    ENVIRONMENT:
      "urban street at golden hour; shallow depth of field; slight background motion blur; subtle rim light on hair",
    OUTPUT_FORMAT: "3:4 or 9:16 full-body format",
  },
};

// Helper function to generate transform prompts
function generateTransformPrompt(transformType) {
  const config = TRANSFORM_CONFIGS[transformType];
  return TRANSFORM_PROMPT_TEMPLATE.replace("{VIEW}", config.VIEW)
    .replace("{POSE}", config.POSE)
    .replace("{ENVIRONMENT}", config.ENVIRONMENT)
    .replace("{OUTPUT_FORMAT}", config.OUTPUT_FORMAT);
}

async function imageToBase64(imageUrl) {
  try {
    if (imageUrl.startsWith("data:")) {
      const base64Data = imageUrl.split(",")[1];
      return base64Data;
    }

    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return base64;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
}

async function uploadImageToFirebase(generatedImageData, fileName, userId) {
  try {
    let base64Data;
    if (generatedImageData.startsWith("data:")) {
      base64Data = generatedImageData.split(",")[1];
    } else {
      base64Data = generatedImageData;
    }

    const buffer = Buffer.from(base64Data, "base64");
    const filePath = `generated-images/${userId}/${fileName}`;
    const file = bucket.file(filePath);

    await file.save(buffer, {
      metadata: {
        contentType: "image/jpeg",
        cacheControl: "public,max-age=86400",
        customMetadata: {
          uploadedBy: userId,
          accessLevel: "private",
        },
      },
    });

    console.log("File uploaded successfully:", filePath);
    return filePath;
  } catch (error) {
    console.error("Error uploading image to Firebase:", error);
    throw error;
  }
}

exports.analyzeLooksmaxxing = functions.https.onCall(
  {
    timeoutSeconds: 120,
    memory: "1GB",
  },
  async (request, context) => {
    try {
      const userId = request.auth.uid;
      if (!userId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "User ID is required"
        );
      }

      const {
        frontImageUrl,
        sideImageUrl,
        fullBodyImageUrl,
        user_style_prefs = "none",
        target_intensity = "S2",
      } = request.data;

      if (!frontImageUrl || !sideImageUrl) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Front and side images are required"
        );
      }

      const model = genAI.getGenerativeModel({
        model: config.gemini.model.pro,
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
      });

      const frontBase64 = await imageToBase64(frontImageUrl);
      const sideBase64 = await imageToBase64(sideImageUrl);
      const fullBodyBase64 = fullBodyImageUrl
        ? await imageToBase64(fullBodyImageUrl)
        : null;

      const imageParts = [
        {
          inlineData: {
            data: frontBase64,
            mimeType: "image/jpeg",
          },
        },
        {
          inlineData: {
            data: sideBase64,
            mimeType: "image/jpeg",
          },
        },
      ];

      if (fullBodyBase64) {
        imageParts.push({
          inlineData: {
            data: fullBodyBase64,
            mimeType: "image/jpeg",
          },
        });
      }

      const userPrompt = `Analyze these images as numbered inputs:
1) Front selfie → <image_front>
2) Side profile → <image_side>
3) Full body → <image_fullbody>

User style preference: ${user_style_prefs}
Target intensity: ${target_intensity}

Return prioritized, practical improvements and an "edit_brief_front" tailored to the front selfie so an editor can implement them realistically.

Respond with ONLY valid JSON following this exact schema:
{
  "score": {"overall": 0-100, "confidence": "low|med|high"},
  "priorities": [
    {"area": "jawline|skin|hair|brows|facial_hair|eyes|teeth|posture|physique|style|grooming|accessories",
     "why": "string",
     "improvement_habits": "string/*only four five words long ex-Mewing and chewing exercises daily */",
     "score": 0-100/*represents current state of the area*/,
     "impact": "low|med|high",
     "difficulty": "low|med|high",
     "time_horizon": "now|2-4w|1-3m"}
  ],
  "recommendations": {
    "skin": ["actionable tip 1", "actionable tip 2"],
    "hair": ["..."],
    "facial_hair": ["..."],
    "brows": ["..."],
    "eyes": ["..."],
    "teeth": ["..."],
    "jawline": ["..."],
    "posture": ["..."],
    "physique": ["..."],
    "style": ["..."],
    "grooming": ["..."],
    "accessories": ["..."]
  },
  "edit_brief_front": [
    {"edit": "micro action for the **front selfie** only", "intensity": "S1|S2|S3"}
  ],
  "tone": "natural|editorial|studio",
  "lighting": "soft key / natural contrast",
  "negative": ["list of artifacts to avoid"],
  "notes": "edge cases / uncertainties"
}`;

      const analysisResult = await model.generateContent([
        userPrompt,
        ...imageParts,
      ]);

      const responseText = analysisResult.response.text();

      let adviceJson;
      try {
        const cleanedResponse = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        adviceJson = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", responseText);
        throw new functions.https.HttpsError(
          "internal",
          "Invalid JSON response from analysis",
          parseError.message
        );
      }

      return {
        success: true,
        advice_json: adviceJson,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in analyzeLooksmaxxing:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to analyze images",
        error.message
      );
    }
  }
);

exports.generateEnhancedFront = functions.https.onCall(
  {
    timeoutSeconds: 300,
    memory: "2GB",
  },
  async (request, context) => {
    try {
      const {
        frontImageUrl,
        sideImageUrl,
        fullBodyImageUrl,
        advice,
        target_intensity = "S2",
      } = request.data;
      const userId = request.auth.uid;

      if (!userId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "User ID is required"
        );
      }
      if (!frontImageUrl || !sideImageUrl || !advice) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Front image URL, side image URL, and advice are required"
        );
      }

      console.log("Generating enhanced front image using AI...");

      const model = genAI.getGenerativeModel({
        model: config.gemini.model.flash, // Now using gemini-2.5-flash-preview
        systemInstruction: EDITING_SYSTEM_PROMPT,
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      });

      const frontBase64 = await imageToBase64(frontImageUrl);

      const adviceJson = JSON.parse(advice);
      const editingPrompt = `SOURCE_IMAGE: <image_front>
EDIT_BRIEF (apply in order, keep identity): ${JSON.stringify(
        adviceJson.edit_brief_front
      )}
NEGATIVE (avoid): ${
        adviceJson.negative
          ? adviceJson.negative.join(", ")
          : "over-smoothed skin, waxy texture, CGI look"
      }
INTENSITY: ${target_intensity}
STYLE: tone=${adviceJson.tone || "natural"}, lighting=${
        adviceJson.lighting || "soft key / natural contrast"
      }

REQUIREMENTS: natural skin texture, realistic hair strands, subtle symmetry only, tidy brows/facial hair, slight teeth brightening (no overwhite), jawline definition without distortions. No CGI/illustration look.

OUTPUT: High-res portrait (4:5 or 3:4). Minimal crop; keep original framing if possible.`;

      const result = await model.generateContent([
        editingPrompt,
        {
          inlineData: {
            data: frontBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      console.log("Image enhancement processing completed");

      // Extract the generated image from the response
      let generatedImageBase64 = null;

      if (result.response.candidates && result.response.candidates.length > 0) {
        const candidate = result.response.candidates[0];

        for (const part of candidate.content.parts) {
          console.log("part....................", part.mimeType);
          if (part.inlineData) {
            generatedImageBase64 = part.inlineData.data;
            console.log("Generated image data received");
          }
        }
      }

      const fileName = `lm_front-${Date.now()}.jpg`;
      const enhancedImagePath = await uploadImageToFirebase(
        generatedImageBase64,
        fileName,
        userId
      );

      console.log("Enhanced image uploaded to storage:", enhancedImagePath);

      return {
        success: true,
        imagePath: enhancedImagePath,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in generateEnhancedFront:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate enhanced front image",
        error.message
      );
    }
  }
);

exports.generateSideProfile = functions.https.onCall(
  {
    timeoutSeconds: 300,
    memory: "2GB",
  },
  async (request, context) => {
    try {
      const { enhancedFrontImagePath, advice } = request.data;
      const userId = request.auth.uid;

      if (!userId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "User ID is required"
        );
      }
      if (!enhancedFrontImagePath || !advice) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Enhanced front image path and advice are required"
        );
      }

      console.log("Generating side profile image using AI...");

      const model = genAI.getGenerativeModel({
        model: config.gemini.model.flash, // Now using gemini-2.5-flash-preview
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      });

      // Get the enhanced front image from Firebase Storage
      const file = bucket.file(enhancedFrontImagePath);
      const [buffer] = await file.download();
      const enhancedFrontBase64 = buffer.toString("base64");

      const transformPrompt = generateTransformPrompt("SIDE_PROFILE");

      console.log(
        "image loaded successfully,enhancedFrontBase64",
        enhancedFrontBase64.length
      );

      // Generate the side profile image
      const result = await model.generateContent([
        transformPrompt,
        {
          inlineData: {
            data: enhancedFrontBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      console.log("Side profile processing completed");

      // Extract the generated image from the response
      let generatedImageBase64 = null;

      if (result.response.candidates && result.response.candidates.length > 0) {
        const candidate = result.response.candidates[0];

        for (const part of candidate.content.parts) {
          console.log("part....................", part);
          if (part.inlineData) {
            generatedImageBase64 = part.inlineData.data;
            console.log("Generated side profile image data received");
          }
        }
      }

      // Upload the generated image to Firebase Storage
      const fileName = `lm_side-${Date.now()}.jpg`; // Updated naming convention
      const sideProfileImagePath = await uploadImageToFirebase(
        generatedImageBase64,
        fileName,
        userId
      );

      console.log(
        "Side profile image uploaded to storage:",
        sideProfileImagePath
      );

      return {
        success: true,
        imagePath: sideProfileImagePath,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in generateSideProfile:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate side profile",
        error.message
      );
    }
  }
);

exports.generatePhysique = functions.https.onCall(
  {
    timeoutSeconds: 300,
    memory: "2GB",
  },
  async (request, context) => {
    try {
      const { enhancedFrontImagePath, advice } = request.data;
      const userId = request.auth.uid;

      if (!userId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "User ID is required"
        );
      }
      if (!enhancedFrontImagePath || !advice) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Enhanced front image path and advice are required"
        );
      }

      console.log("Generating physique image using AI...");

      const model = genAI.getGenerativeModel({
        model: config.gemini.model.flash, // Now using gemini-2.5-flash-preview
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      });

      // Get the enhanced front image from Firebase Storage
      const file = bucket.file(enhancedFrontImagePath);
      const [buffer] = await file.download();
      const enhancedFrontBase64 = buffer.toString("base64");

      const transformPrompt = generateTransformPrompt("FULL_BODY");

      // Generate the physique image
      const result = await model.generateContent([
        transformPrompt,
        {
          inlineData: {
            data: enhancedFrontBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      console.log("Physique processing completed");

      // Extract the generated image from the response
      let generatedImageBase64 = null;

      if (result.response.candidates && result.response.candidates.length > 0) {
        const candidate = result.response.candidates[0];

        for (const part of candidate.content.parts) {
          console.log("part....................", part);
          if (part.inlineData) {
            generatedImageBase64 = part.inlineData.data;
            console.log("Generated physique image data received");
          }
        }
      }

      // Upload the generated image to Firebase Storage
      const fileName = `lm_fullbody-${Date.now()}.jpg`; // Updated naming convention
      const physiqueImagePath = await uploadImageToFirebase(
        generatedImageBase64,
        fileName,
        userId
      );

      console.log("Physique image uploaded to storage:", physiqueImagePath);

      return {
        success: true,
        imagePath: physiqueImagePath,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in generatePhysique:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate physique image",
        error.message
      );
    }
  }
);

exports.generateLifestyle = functions.https.onCall(
  {
    timeoutSeconds: 300,
    memory: "2GB",
  },
  async (request, context) => {
    try {
      const { enhancedFrontImagePath, advice } = request.data;
      const userId = request.auth.uid;

      if (!userId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "User ID is required"
        );
      }
      if (!enhancedFrontImagePath || !advice) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Enhanced front image path and advice are required"
        );
      }

      console.log("Generating lifestyle image using AI...");

      const model = genAI.getGenerativeModel({
        model: config.gemini.model.flash, // Now using gemini-2.5-flash-preview
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      });

      // Get the enhanced front image from Firebase Storage
      const file = bucket.file(enhancedFrontImagePath);
      const [buffer] = await file.download();
      const enhancedFrontBase64 = buffer.toString("base64");

      const transformPrompt = generateTransformPrompt("ACTION_FULL_BODY");

      // Generate the lifestyle image
      const result = await model.generateContent([
        transformPrompt,
        {
          inlineData: {
            data: enhancedFrontBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      console.log("Lifestyle processing completed");

      // Extract the generated image from the response
      let generatedImageBase64 = null;

      if (result.response.candidates && result.response.candidates.length > 0) {
        const candidate = result.response.candidates[0];

        for (const part of candidate.content.parts) {
          console.log("part....................", part);
          if (part.inlineData) {
            generatedImageBase64 = part.inlineData.data;
            console.log("Generated lifestyle image data received");
          }
        }
      }

      // Upload the generated image to Firebase Storage
      const fileName = `lm_action_fullbody-${Date.now()}.jpg`; // Updated naming convention
      const lifestyleImagePath = await uploadImageToFirebase(
        generatedImageBase64,
        fileName,
        userId
      );

      console.log("Lifestyle image uploaded to storage:", lifestyleImagePath);

      return {
        success: true,
        imagePath: lifestyleImagePath,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in generateLifestyle:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate lifestyle image",
        error.message
      );
    }
  }
);
