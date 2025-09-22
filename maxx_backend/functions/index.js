const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("./config");

admin.initializeApp();

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const bucket = admin.storage().bucket();

const ANALYSIS_PROMPT = `You are a looksmaxxing expert analyzing these photos for male aesthetic improvement. Evaluate the subject's PSL rating potential and provide specific, actionable looksmaxxing advice.

Analyze and provide improvements for:
1. Hair: Optimal haircut for face shape, Norwood scale assessment, density maximization
2. Jawline & Chin: Gonial angle optimization, ramus length, chin projection
3. Eyes: Canthal tilt, hunter eyes potential, under-eye support, eyebrow thickness/shape
4. Midface: Ratio optimization, hollow cheeks potential, zygomatic projection
5. Skin: Collagen density, even tone, glow maximization
6. Neck & Posture: Forward head posture correction, neck thickness
7. Style: Clothing fit for frame, color matching for skin undertone
8. Facial hair: Optimal style for jaw enhancement and facial structure

Provide SPECIFIC actionable steps like "Get a mid-fade haircut with 3 inches on top styled with matte clay pomade" or "Grow stubble to 3-4mm to enhance jaw definition."

Output 10-12 concrete looksmaxxing improvements that will increase PSL rating.`;

const ENHANCEMENT_PROMPT = `Apply these looksmaxxing enhancements to ascend this male subject's appearance:

[ADVICE_PLACEHOLDER]

Transform him into his maximum aesthetic potential while keeping it realistic. Focus on masculine features - stronger jaw, hunter eyes, better facial harmony. The improvements should look like achievable softmaxxing results (grooming, skincare, gym gains). Maintain his ethnicity but optimize all features for maximum PSL rating.`;

const SIDE_PROFILE_PROMPT = `Convert this looksmaxxed front portrait into a perfect side profile showing his improved forward growth and facial projection. Display the enhanced jawline, ideal gonial angle, chin projection, and improved posture. Maintain all looksmaxxing improvements - the perfect hair, skin, and any visible style enhancements. Show the masculine profile with optimal nasofrontal angle and ramus length.`;

const PHYSIQUE_PROMPT = `Extend this looksmaxxed portrait into a full-body physique shot showing ideal male proportions. Display athletic V-taper with visible shoulder to waist ratio, wearing fitted clothing that shows frame. Include visible signs of gymmaxxing - developed neck, shoulders, and athletic posture. Style should be high-value male fashion - fitted dark jeans or chinos, quality fitted t-shirt or button-down showing physique.`;

const LIFESTYLE_PROMPT = `Create a high-SMV lifestyle shot of this looksmaxxed subject in a status-signaling environment. Show him at an upscale rooftop bar during golden hour, dressed in business casual (fitted dress shirt, designer watch visible), with confident alpha body language. He should be in a dominant social position - center of frame, taking up space, relaxed but authoritative posture. Maximum status and attractiveness display.`;

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

// Step 1: Analyze images and get looksmaxxing advice
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
      const { frontImageUrl, sideImageUrl, fullBodyImageUrl } = request.data;

      if (!frontImageUrl || !sideImageUrl) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Front and side images are required"
        );
      }

      const model = genAI.getGenerativeModel({
        model: config.gemini.model.pro,
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

      const analysisResult = await model.generateContent([
        ANALYSIS_PROMPT,
        ...imageParts,
      ]);
      const looksmaxxingAdvice = analysisResult.response.text();

      return {
        success: true,
        advice: looksmaxxingAdvice,
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

// Step 2: Generate enhanced front image
exports.generateEnhancedFront = functions.https.onCall(
  {
    timeoutSeconds: 300,
    memory: "2GB",
  },
  async (request, context) => {
    try {
      const { frontImageUrl, sideImageUrl, fullBodyImageUrl, advice } =
        request.data;
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
        model: "gemini-2.5-flash-image-preview",
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      });

      const frontBase64 = await imageToBase64(frontImageUrl);
      const sideBase64 = await imageToBase64(sideImageUrl);
      const fullBodyBase64 = fullBodyImageUrl
        ? await imageToBase64(fullBodyImageUrl)
        : null;

      const enhancementPrompt = `${ENHANCEMENT_PROMPT.replace(
        "[ADVICE_PLACEHOLDER]",
        advice
      )}

IMPORTANT: Generate a high-quality, realistic portrait image that shows the enhanced version of this person. Apply all the looksmaxxing improvements mentioned in the advice while keeping the person's core facial features and ethnicity intact.

Make sure to generate an actual image, not just describe it.`;

      // Prepare image parts for context
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

      // Generate the enhanced image
      const result = await model.generateContent([
        enhancementPrompt,
        ...imageParts,
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

      // Upload the generated image to Firebase Storage
      const fileName = `enhanced-front-${Date.now()}.jpg`;
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

// Step 3: Generate side profile
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
        model: "gemini-2.5-flash-image-preview",
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      });

      // Get the enhanced front image from Firebase Storage
      const file = bucket.file(enhancedFrontImagePath);
      const [buffer] = await file.download();
      const enhancedFrontBase64 = buffer.toString("base64");

      const sideProfilePrompt = `${SIDE_PROFILE_PROMPT} Apply the following enhancements: ${advice}

IMPORTANT: Generate a high-quality side profile image that shows the enhanced version of this person from a 90-degree side angle. Apply all the looksmaxxing improvements while keeping the person's core facial features and ethnicity intact.

Make sure to generate an actual image, not just describe it.`;

      console.log(
        "image loaded successfully,enhancedFrontBase64",
        enhancedFrontBase64.length
      );

      // Generate the side profile image
      const result = await model.generateContent([
        sideProfilePrompt,
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
      const fileName = `side-profile-${Date.now()}.jpg`;
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

// Step 4: Generate physique image
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
        model: "gemini-2.5-flash-image-preview",
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      });

      // Get the enhanced front image from Firebase Storage
      const file = bucket.file(enhancedFrontImagePath);
      const [buffer] = await file.download();
      const enhancedFrontBase64 = buffer.toString("base64");

      const physiquePrompt = `${PHYSIQUE_PROMPT} Apply the following enhancements: ${advice}

IMPORTANT: Generate a high-quality full-body physique image that shows the enhanced version of this person with ideal male proportions and athletic build. Apply all the looksmaxxing improvements while keeping the person's core facial features and ethnicity intact.

Make sure to generate an actual image, not just describe it.`;

      // Generate the physique image
      const result = await model.generateContent([
        physiquePrompt,
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
      const fileName = `physique-${Date.now()}.jpg`;
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

// Step 5: Generate lifestyle image
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
        model: "gemini-2.5-flash-image-preview",
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      });

      // Get the enhanced front image from Firebase Storage
      const file = bucket.file(enhancedFrontImagePath);
      const [buffer] = await file.download();
      const enhancedFrontBase64 = buffer.toString("base64");

      const lifestylePrompt = `${LIFESTYLE_PROMPT} Apply the following enhancements: ${advice}

IMPORTANT: Generate a high-quality lifestyle image that shows the enhanced version of this person in an upscale, status-signaling environment. Apply all the looksmaxxing improvements while keeping the person's core facial features and ethnicity intact.

Make sure to generate an actual image, not just describe it.`;

      // Generate the lifestyle image
      const result = await model.generateContent([
        lifestylePrompt,
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
      const fileName = `lifestyle-${Date.now()}.jpg`;
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
