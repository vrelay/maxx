import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import {
  imageToBase64,
  uploadImageToFirebase,
  downloadImageFromFirebase,
} from "../utils/imageUtils.js";
import {
  analyzeLooksmaxxingImages,
  generateEnhancedImage,
  generateTransformedImage,
} from "../services/geminiService.js";

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze looksmaxxing images and provide recommendations
 */
router.post("/analyze", verifyFirebaseToken, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const {
      frontImageUrl,
      sideImageUrl,
      fullBodyImageUrl,
      userStylePrefs = "none",
      targetIntensity = "S2",
    } = req.body;

    if (!frontImageUrl || !sideImageUrl) {
      return res.status(400).json({
        error: "invalid-argument",
        message: "Front and side images are required",
      });
    }

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

User style preference: ${userStylePrefs}
Target intensity: ${targetIntensity}

Return prioritized, practical improvements and an "edit_brief_front" tailored 
to the front selfie so an editor can implement them realistically.

Respond with ONLY valid JSON following this exact schema:
{
  "score": {"overall": 0-100, "confidence": "low|med|high"},
  "priorities": [
    {"area": "jawline|skin|hair|brows|facial_hair|eyes|teeth|posture|" +
     "physique|style|grooming|accessories",
     "improvement_habits": "string/*only four five words long " +
     "ex-Mewing and chewing exercises daily */",
     "score": 0-100/*represents current state of the area*/,
     "impact": "low|med|high",
     "difficulty": "low|med|high",
  ],
  "edit_brief_front": [
    {"edit": "micro action for the **front selfie** only",
     "intensity": "S1|S2|S3"}
  ],
  "tone": "natural|editorial|studio",
  "lighting": "soft key / natural contrast",
  "negative": ["list of artifacts to avoid"],
}`;

    const adviceJson = await analyzeLooksmaxxingImages(imageParts, userPrompt);

    res.json({
      success: true,
      advice_json: adviceJson,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/generate/front
 * Generate enhanced front image
 */
router.post("/generate/front", verifyFirebaseToken, async (req, res, next) => {
  try {
    const {
      frontImageUrl,
      sideImageUrl,
      advice,
      targetIntensity = "S2",
    } = req.body;
    const userId = req.user.uid;

    if (!frontImageUrl || !sideImageUrl || !advice) {
      return res.status(400).json({
        error: "invalid-argument",
        message: "Front image URL, side image URL, and advice are required",
      });
    }

    console.log("Generating enhanced front image using AI...");

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
INTENSITY: ${targetIntensity}
STYLE: tone=${adviceJson.tone || "natural"}, lighting=${
      adviceJson.lighting || "soft key / natural contrast"
    }

REQUIREMENTS: natural skin texture, realistic hair strands, subtle symmetry 
only, tidy brows/facial hair, slight teeth brightening (no overwhite), jawline 
definition without distortions. No CGI/illustration look.

OUTPUT: High-res portrait (5:6 aspect ratio, 335x400px equivalent). Exact aspect ratio to fill container completely, no black spaces or cropping needed. Keep original framing if possible.`;

    const generatedImageBase64 = await generateEnhancedImage(
      editingPrompt,
      frontBase64
    );

    const fileName = `lm_front-${Date.now()}.jpg`;
    const enhancedImagePath = await uploadImageToFirebase(
      generatedImageBase64,
      fileName,
      userId
    );

    console.log("Enhanced image uploaded to storage:", enhancedImagePath);

    res.json({
      success: true,
      imagePath: enhancedImagePath,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/generate/side
 * Generate side profile image
 */
router.post("/generate/side", verifyFirebaseToken, async (req, res, next) => {
  try {
    const { enhancedFrontImagePath, advice } = req.body;
    const userId = req.user.uid;

    if (!enhancedFrontImagePath || !advice) {
      return res.status(400).json({
        error: "invalid-argument",
        message: "Enhanced front image path and advice are required",
      });
    }

    console.log("Generating side profile image using AI...");

    // Get the enhanced front image from Firebase Storage
    const buffer = await downloadImageFromFirebase(enhancedFrontImagePath);
    const enhancedFrontBase64 = buffer.toString("base64");

    console.log(
      "Image loaded successfully, enhancedFrontBase64 length:",
      enhancedFrontBase64.length
    );

    const generatedImageBase64 = await generateTransformedImage(
      "SIDE_PROFILE",
      enhancedFrontBase64
    );

    // Upload the generated image to Firebase Storage
    const fileName = `lm_side-${Date.now()}.jpg`;
    const sideProfileImagePath = await uploadImageToFirebase(
      generatedImageBase64,
      fileName,
      userId
    );

    console.log(
      "Side profile image uploaded to storage:",
      sideProfileImagePath
    );

    res.json({
      success: true,
      imagePath: sideProfileImagePath,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/generate/physique
 * Generate physique/full body image
 */
router.post(
  "/generate/physique",
  verifyFirebaseToken,
  async (req, res, next) => {
    try {
      const { enhancedFrontImagePath, advice } = req.body;
      const userId = req.user.uid;

      if (!enhancedFrontImagePath || !advice) {
        return res.status(400).json({
          error: "invalid-argument",
          message: "Enhanced front image path and advice are required",
        });
      }

      console.log("Generating physique image using AI...");

      // Get the enhanced front image from Firebase Storage
      const buffer = await downloadImageFromFirebase(enhancedFrontImagePath);
      const enhancedFrontBase64 = buffer.toString("base64");

      const generatedImageBase64 = await generateTransformedImage(
        "FULL_BODY",
        enhancedFrontBase64
      );

      // Upload the generated image to Firebase Storage
      const fileName = `lm_fullbody-${Date.now()}.jpg`;
      const physiqueImagePath = await uploadImageToFirebase(
        generatedImageBase64,
        fileName,
        userId
      );

      console.log("Physique image uploaded to storage:", physiqueImagePath);

      res.json({
        success: true,
        imagePath: physiqueImagePath,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/generate/lifestyle
 * Generate lifestyle/action full body image
 */
router.post(
  "/generate/lifestyle",
  verifyFirebaseToken,
  async (req, res, next) => {
    try {
      const { enhancedFrontImagePath, advice } = req.body;
      const userId = req.user.uid;

      if (!enhancedFrontImagePath || !advice) {
        return res.status(400).json({
          error: "invalid-argument",
          message: "Enhanced front image path and advice are required",
        });
      }

      console.log("Generating lifestyle image using AI...");

      // Get the enhanced front image from Firebase Storage
      const buffer = await downloadImageFromFirebase(enhancedFrontImagePath);
      const enhancedFrontBase64 = buffer.toString("base64");

      const generatedImageBase64 = await generateTransformedImage(
        "ACTION_FULL_BODY",
        enhancedFrontBase64
      );

      // Upload the generated image to Firebase Storage
      const fileName = `lm_action_fullbody-${Date.now()}.jpg`;
      const lifestyleImagePath = await uploadImageToFirebase(
        generatedImageBase64,
        fileName,
        userId
      );

      console.log("Lifestyle image uploaded to storage:", lifestyleImagePath);

      res.json({
        success: true,
        imagePath: lifestyleImagePath,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
