// utils/imageUpload.ts
import { storage } from "@/src/config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

/**
 * Converts image URI to Blob for upload
 */
const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

/**
 * Uploads a single image to Firebase Storage
 * @param imageUri - Local image URI from camera/gallery
 * @param fileName - Custom filename (optional)
 * @param folder - Storage folder path (default: 'user-images')
 * @returns Promise<UploadResult>
 */
export const uploadImageToStorage = async (
  imageUri: string,
  fileName?: string,
  folder: string = "user-images"
): Promise<UploadResult> => {
  try {
    console.log("Starting image upload..Image URI:", imageUri);

    const timestamp = Date.now();
    const finalFileName = fileName || `image_${timestamp}.jpg`;

    const storageRef = ref(storage, `${folder}/${finalFileName}`);

    const blob = await uriToBlob(imageUri);

    const uploadResult = await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log("Upload completed.....Download URL:", downloadURL);

    return {
      success: true,
      url: downloadURL,
    };
  } catch (error) {
    console.error("Upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    };
  }
};

/**
 * Uploads user photos (front, side, full-body) with specific naming
 * @param photos - Object containing photo URIs
 * @returns Promise with upload results and URLs
 */
export const uploadUserPhotos = async (
  userId: string,
  photos: {
    frontPhoto: string;
    sidePhoto: string;
    fullBodyPhoto?: string | null;
  }
) => {
  console.log("Starting user photos upload to firebase...");

  try {
    const frontResult = await uploadImageToStorage(
      photos.frontPhoto,
      `${userId}_front_before.jpg`,
      "user-photos"
    );

    const sideResult = await uploadImageToStorage(
      photos.sidePhoto,
      `${userId}_side_before.jpg`,
      "user-photos"
    );

    let fullBodyResult: UploadResult | null = null;
    if (photos.fullBodyPhoto) {
      fullBodyResult = await uploadImageToStorage(
        photos.fullBodyPhoto,
        `${userId}_fullbody_before.jpg`,
        "user-photos"
      );
    }

    return {
      success:
        frontResult.success &&
        sideResult.success &&
        fullBodyResult?.success !== false,
      frontPhotoUrl: frontResult.url,
      sidePhotoUrl: sideResult.url,
      fullBodyPhotoUrl: fullBodyResult?.url,
      errors: {
        front: frontResult.error,
        side: sideResult.error,
        fullBody: fullBodyResult?.error,
      },
    };
  } catch (error) {
    console.error("User photos upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
