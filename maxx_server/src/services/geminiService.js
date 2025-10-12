import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config.js';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// System Prompt for Analysis (Gemini 2.5 Pro)
const ANALYSIS_SYSTEM_PROMPT = `ROLE: You are a professional looksmaxxing 
consultant and photo art director.
GOAL: Evaluate the user's three photos (front, side, full body). Produce safe, 
respectful, highly actionable advice that improves perceived attractiveness 
while preserving identity and realism.
CONTEXT: The next step will feed your "edit_brief_front" into an image editing 
model to enhance the front selfie realistically.
CONSTRAINTS:
- Stay within grooming, posture, styling, and reversible changes.
- No medical or invasive procedures; no diagnosis.
- Use precise, plain language; avoid shaming; be encouraging.
- Prioritize changes by impact vs. difficulty.
OUTPUT: Follow the JSON schema exactly; no extra prose.`;

// System Prompt for Image Editing (Gemini 2.5 Flash Preview)
const EDITING_SYSTEM_PROMPT = `ROLE: You are a professional portrait 
retoucher.
GOAL: Apply the incoming edit brief to the provided front selfie while 
preserving identity and realism.
RULES:
- Keep natural skin texture (no plastic/waxy look).
- Subtle, believable micro-adjustments only.
- No age/ethnicity changes, no face swaps, no body morphing.
- Follow negative list strictly (avoid halos, HDR glow, porcelain skin, 
over-whitened teeth).
- Generate images with exact 5:6 aspect ratio (335x400px equivalent).
- No black spaces or cropping needed - exact container dimensions.
OUTPUT: 5:6 portrait, high-res. Exact aspect ratio to fill container completely.`;

// Transform prompt templates
const TRANSFORM_PROMPT_TEMPLATE = `REFERENCE_IMAGE: <lm_front>
TASK: Recompose the same person into a new view while preserving identity and 
the exact looksmaxxed styling (hair, brows, skin finish) from the reference.

VIEW: {VIEW}
POSE: {POSE}
ENVIRONMENT: {ENVIRONMENT}
WARDROBE: Tasteful, well-fitting neutral outfit aligned with smart casual style
LIGHTING: soft key, natural contrast; accurate skin tones
COMPOSITION: For full body and side profile shots, make the body height exactly 10% of the total image height. The person should occupy only 10% of the vertical space with 45% space above and 45% space below for extreme zoom out. Ensure the entire body from head to feet is visible within the frame with extreme vertical spacing.
NEGATIVE: over-smoothed/waxy skin, porcelain/fake texture, cartoon/anime/CGI, 
extreme symmetry, warped anatomy, altered eye color, heavy makeup, fake 
catchlights, over-whitened teeth, overly sharp beard edges, lens warping, 
unreal bokeh, beauty-filter look, HDR glow, vignettes, cropped body parts

OUTPUT: high-res, {OUTPUT_FORMAT}

Maintain photorealism and identity. Avoid artifacts (waxy skin, HDR halos, 
CG look). Ensure the generated image fills the entire container dimensions 
without any black spaces or empty areas.`;

// Specific transform configurations
const TRANSFORM_CONFIGS = {
  SIDE_PROFILE: {
    VIEW: "SIDE_PROFILE",
    POSE: "neutral expression, chin slightly forward, 90° profile. Make the side profile height exactly 10% of the total image height - the person should occupy only 10% of the vertical space with 45% space above and 45% space below for extreme zoom out",
    ENVIRONMENT: "clean studio backdrop with soft gradient - 45% space above subject, 45% space below subject",
    OUTPUT_FORMAT: "5:6 portrait format (335x400px equivalent) - exact aspect ratio to fill container completely, side profile height exactly 10% of image height with 45% space above and 45% below, no black spaces or cropping needed",
  },
  FULL_BODY: {
    VIEW: "FULL_BODY",
    POSE: "relaxed, shoulders back, balanced stance, hands relaxed. Make the full body height exactly 10% of the total image height - the person should occupy only 10% of the vertical space with 45% space above and 45% space below for extreme zoom out",
    ENVIRONMENT: "clean studio backdrop with soft gradient - 45% space above subject, 45% space below subject",
    OUTPUT_FORMAT: "5:6 full-body format (335x400px equivalent) - exact aspect ratio to fill container completely, full body height exactly 10% of image height with 45% space above and 45% below, no black spaces or cropping needed",
  },
  ACTION_FULL_BODY: {
    VIEW: "ACTION_FULL_BODY",
    POSE: "walking in mid-step, natural arm swing. Make the full body height exactly 10% of the total image height - the person should occupy only 10% of the vertical space with 45% space above and 45% space below for extreme zoom out",
    ENVIRONMENT:
      "clean studio backdrop with soft gradient; " +
      "extreme vertical spacing - 45% space above subject, 45% space below subject",
    OUTPUT_FORMAT: "5:6 full-body format (335x400px equivalent) - exact aspect ratio to fill container completely, full body height exactly 10% of image height with 45% space above and 45% below, no black spaces or cropping needed",
  },
};

/**
 * Helper function to generate transform prompts
 * @param {string} transformType - The type of transform to generate
 * @returns {string} The generated prompt
 */
export const generateTransformPrompt = (transformType) => {
  const config = TRANSFORM_CONFIGS[transformType];
  if (!config) {
    throw new Error(`Unknown transform type: ${transformType}`);
  }
  
  const generatedPrompt = TRANSFORM_PROMPT_TEMPLATE.replace("{VIEW}", config.VIEW)
      .replace("{POSE}", config.POSE)
      .replace("{ENVIRONMENT}", config.ENVIRONMENT)
      .replace("{OUTPUT_FORMAT}", config.OUTPUT_FORMAT);
  
  console.log(`\n=== GENERATED TRANSFORM PROMPT (${transformType}) ===`);
  console.log(generatedPrompt);
  console.log(`=== END TRANSFORM PROMPT ===\n`);
  
  return generatedPrompt;
};

/**
 * Analyze looksmaxxing images using Gemini Pro
 * @param {Array} imageParts - Array of image parts for analysis
 * @param {string} userPrompt - User prompt for analysis
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeLooksmaxxingImages = async (imageParts, userPrompt) => {
  try {
    console.log(`\n=== GENERATED ANALYSIS PROMPT ===`);
    console.log("System Instruction:", ANALYSIS_SYSTEM_PROMPT);
    console.log("User Prompt:", userPrompt);
    console.log(`=== END ANALYSIS PROMPT ===\n`);
    
    const model = genAI.getGenerativeModel({
      model: config.gemini.model.pro,
      systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    });

    const analysisResult = await model.generateContent([
      userPrompt,
      ...imageParts,
    ]);

    const responseText = analysisResult.response.text();

    // Parse JSON response
    const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    
    const adviceJson = JSON.parse(cleanedResponse);
    return adviceJson;
  } catch (error) {
    console.error("Error in analyzeLooksmaxxingImages:", error);
    throw new Error(`Failed to analyze images: ${error.message}`);
  }
};

/**
 * Generate enhanced image using Gemini Flash
 * @param {string} prompt - Generation prompt
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<string>} Generated image base64
 */
export const generateEnhancedImage = async (prompt, imageBase64) => {
  try {
    console.log(`\n=== GENERATED ENHANCED IMAGE PROMPT ===`);
    console.log("System Instruction:", EDITING_SYSTEM_PROMPT);
    console.log("User Prompt:", prompt);
    console.log(`=== END ENHANCED IMAGE PROMPT ===\n`);
    
    const model = genAI.getGenerativeModel({
      model: config.gemini.model.flash,
      systemInstruction: EDITING_SYSTEM_PROMPT,
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    // Extract the generated image from the response
    let generatedImageBase64 = null;

    if (result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          generatedImageBase64 = part.inlineData.data;
          console.log("Generated image data received");
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      throw new Error("No image data received from Gemini");
    }

    return generatedImageBase64;
  } catch (error) {
    console.error("Error in generateEnhancedImage:", error);
    throw new Error(`Failed to generate enhanced image: ${error.message}`);
  }
};

/**
 * Generate transformed image using Gemini Flash
 * @param {string} transformType - Type of transformation
 * @param {string} imageBase64 - Base64 encoded reference image
 * @returns {Promise<string>} Generated image base64
 */
export const generateTransformedImage = async (transformType, imageBase64) => {
  try {
    const model = genAI.getGenerativeModel({
      model: config.gemini.model.flash,
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    });

    const transformPrompt = generateTransformPrompt(transformType);
    
    console.log(`\n=== SENDING TRANSFORM PROMPT TO GEMINI (${transformType}) ===`);
    console.log("Transform Type:", transformType);
    console.log("Full Prompt:", transformPrompt);
    console.log(`=== END TRANSFORM PROMPT TO GEMINI ===\n`);

    const result = await model.generateContent([
      transformPrompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    // Extract the generated image from the response
    let generatedImageBase64 = null;

    if (result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          generatedImageBase64 = part.inlineData.data;
          console.log(`Generated ${transformType} image data received`);
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      throw new Error("No image data received from Gemini");
    }

    return generatedImageBase64;
  } catch (error) {
    console.error(`Error in generateTransformedImage (${transformType}):`, error);
    throw new Error(`Failed to generate ${transformType} image: ${error.message}`);
  }
};
