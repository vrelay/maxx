// utils/imageStorage.ts
import RNFS from "react-native-fs";
import { storage } from "@/src/config/firebase";
import { getDownloadURL, ref } from "firebase/storage";

// Type definitions
interface SaveImageResult {
  success: boolean;
  localPath?: string;
  fileName?: string;
  uri?: string;
  error?: string;
}

interface SavedImage {
  name: string;
  path: string;
  uri: string;
  size: number;
  modificationTime: Date;
}

interface GetSavedImagesResult {
  success: boolean;
  images: SavedImage[];
  error?: string;
}

interface CheckImageResult {
  exists: boolean;
  path: string | null;
  uri: string | null;
}

interface DeleteImageResult {
  success: boolean;
  error?: string;
}

export const saveImageToAppStorage = async (
  imagePath: string,
  customFileName: string | null = null
): Promise<SaveImageResult> => {
  try {
    if (!imagePath) {
      throw new Error("Image path is required");
    }

    console.log("Downloading and saving image from path:", imagePath);

    // Check if this is a local file URI (camera image) or Firebase Storage path
    const isLocalFile = imagePath.startsWith("file://");
    
    if (isLocalFile) {
      // Handle local file - copy directly to app storage
      return await copyLocalImageToAppStorage(imagePath, customFileName);
    }

    // Handle Firebase Storage path - download from Firebase
    const imageRef = ref(storage, imagePath);
    const downloadURL: string = await getDownloadURL(imageRef);
    // console.log("Firebase download URL obtained");

    // Create filename - use custom name or generate from original path
    const originalFileName: string = imagePath.split("/").pop() || "image";
    const fileExtension: string = originalFileName.includes(".")
      ? originalFileName.split(".").pop() || "jpg"
      : "jpg";

    const fileName: string = customFileName
      ? `${customFileName}.${fileExtension}`
      : `${Date.now()}_${originalFileName}`;

    // Use DocumentDirectoryPath - this is private to your app and won't show in gallery
    const localFilePath: string = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    // Download the file to app's private storage
    const downloadResult: RNFS.DownloadResult = await RNFS.downloadFile({
      fromUrl: downloadURL,
      toFile: localFilePath,
      background: true,
      discretionary: true,
      cacheable: false,
    }).promise;

    if (downloadResult.statusCode === 200) {
      // console.log("Image saved to app storage:", localFilePath);

      return {
        success: true,
        localPath: localFilePath,
        fileName: fileName,
        uri: `file://${localFilePath}`, // Ready-to-use URI for Image component
      };
    } else {
      throw new Error(
        `Download failed with status: ${downloadResult.statusCode}`
      );
    }
  } catch (error: any) {
    console.error("Error saving image to app storage:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

// Helper function to copy local images to app storage
const copyLocalImageToAppStorage = async (
  localUri: string,
  customFileName: string | null = null
): Promise<SaveImageResult> => {
  try {
    console.log("Copying local image to app storage:", localUri);

    // Extract the source path from the URI
    const sourcePath = localUri.replace("file://", "");
    
    // Check if source file exists
    const exists = await RNFS.exists(sourcePath);
    if (!exists) {
      throw new Error("Source image file does not exist");
    }

    // Create filename
    const originalFileName: string = sourcePath.split("/").pop() || "image";
    const fileExtension: string = originalFileName.includes(".")
      ? originalFileName.split(".").pop() || "jpg"
      : "jpg";

    const fileName: string = customFileName
      ? `${customFileName}.${fileExtension}`
      : `${Date.now()}_${originalFileName}`;

    // Destination path in app's private storage
    const localFilePath: string = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    // Copy the file
    await RNFS.copyFile(sourcePath, localFilePath);
    
    console.log("Local image copied to app storage:", localFilePath);

    return {
      success: true,
      localPath: localFilePath,
      fileName: fileName,
      uri: `file://${localFilePath}`,
    };
  } catch (error: any) {
    console.error("Error copying local image to app storage:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

// Get all saved images from app storage
export const getSavedImages = async (): Promise<GetSavedImagesResult> => {
  try {
    const documentsPath: string = RNFS.DocumentDirectoryPath;

    // Read all files in the documents directory
    const files: RNFS.ReadDirItem[] = await RNFS.readDir(documentsPath);

    // Filter only image files
    const imageFiles: RNFS.ReadDirItem[] = files.filter(
      (file: RNFS.ReadDirItem) => {
        const ext: string = file.name.toLowerCase().split(".").pop() || "";
        return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
      }
    );

    // Convert to usable format
    const images: SavedImage[] = imageFiles.map((file: RNFS.ReadDirItem) => ({
      name: file.name,
      path: file.path,
      uri: `file://${file.path}`, // Ready-to-use URI
      size: file.size,
      modificationTime: file.mtime || new Date(),
    }));

    console.log("Found saved images:", images.length);
    return {
      success: true,
      images: images,
    };
  } catch (error: any) {
    console.error("Error getting saved images:", error);
    return {
      success: false,
      images: [],
      error: error.message || "Unknown error occurred",
    };
  }
};

// Check if specific image exists in app storage
export const checkImageExists = async (
  fileName: string
): Promise<CheckImageResult> => {
  try {
    const filePath: string = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    const exists: boolean = await RNFS.exists(filePath);

    return {
      exists: exists,
      path: exists ? filePath : null,
      uri: exists ? `file://${filePath}` : null,
    };
  } catch (error: any) {
    console.error("Error checking image existence:", error);
    return { exists: false, path: null, uri: null };
  }
};

// Delete saved image
export const deleteSavedImage = async (
  fileName: string
): Promise<DeleteImageResult> => {
  try {
    const filePath: string = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    const exists: boolean = await RNFS.exists(filePath);

    if (exists) {
      await RNFS.unlink(filePath);
      console.log("Image deleted:", fileName);
      return { success: true };
    } else {
      return { success: false, error: "File does not exist" };
    }
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

// Additional utility function - Get image by filename
export const getImageByFileName = async (
  fileName: string
): Promise<SavedImage | null> => {
  try {
    const result: GetSavedImagesResult = await getSavedImages();

    if (result.success) {
      const foundImage: SavedImage | undefined = result.images.find(
        (img: SavedImage) => img.name === fileName
      );
      return foundImage || null;
    }

    return null;
  } catch (error: any) {
    console.error("Error getting image by filename:", error);
    return null;
  }
};

// Clear all saved images
export const clearAllSavedImages = async (): Promise<DeleteImageResult> => {
  try {
    const result: GetSavedImagesResult = await getSavedImages();

    if (!result.success) {
      return { success: false, error: "Failed to get saved images" };
    }

    const deletePromises: Promise<DeleteImageResult>[] = result.images.map(
      (image: SavedImage) => deleteSavedImage(image.name)
    );

    const deleteResults: DeleteImageResult[] = await Promise.all(
      deletePromises
    );
    const successCount: number = deleteResults.filter((r) => r.success).length;

    return {
      success: successCount === result.images.length,
      error:
        successCount < result.images.length
          ? `Only ${successCount} of ${result.images.length} images deleted`
          : undefined,
    };
  } catch (error: any) {
    console.error("Error clearing all saved images:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

// Export types for use in other files
export type {
  SaveImageResult,
  SavedImage,
  GetSavedImagesResult,
  CheckImageResult,
  DeleteImageResult,
};
