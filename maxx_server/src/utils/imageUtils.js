import { bucket } from '../config/firebase.js';

/**
 * Convert image URL to base64
 * @param {string} imageUrl - The image URL to convert
 * @returns {Promise<string>} Base64 encoded image data
 */
export const imageToBase64 = async (imageUrl) => {
  try {
    if (imageUrl.startsWith("data:")) {
      const base64Data = imageUrl.split(",")[1];
      return base64Data;
    }

    console.log("Fetching image from URL:", imageUrl);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    console.log("Successfully converted image to base64, length:", base64.length);
    return base64;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw new Error(`Failed to convert image to base64: ${error.message}`);
  }
};

/**
 * Upload image to Firebase Storage
 * @param {string} generatedImageData - Base64 image data
 * @param {string} fileName - Name for the uploaded file
 * @param {string} userId - User ID for file path
 * @returns {Promise<string>} File path in storage
 */
export const uploadImageToFirebase = async (generatedImageData, fileName, userId) => {
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
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Download image from Firebase Storage
 * @param {string} filePath - Path to the file in Firebase Storage
 * @returns {Promise<Buffer>} Image buffer
 */
export const downloadImageFromFirebase = async (filePath) => {
  try {
    const file = bucket.file(filePath);
    const [buffer] = await file.download();
    return buffer;
  } catch (error) {
    console.error("Error downloading image from Firebase:", error);
    throw new Error(`Failed to download image: ${error.message}`);
  }
};
