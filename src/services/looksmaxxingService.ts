import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import app from "@/src/config/firebase";
import { saveImageToAppStorage } from "../utils/imageStorage";
import { uploadUserPhotos } from "../utils/imageUpload";

export interface LooksmaxxingResult {
  success: boolean;
  analysisResult?: any;
  enhancedFrontResult?: any;
  sideProfileResult?: any;
  physiqueResult?: any;
  lifestyleResult?: any;
  error?: string;
}

// Initialize functions and connect to emulator if in development
const functions = getFunctions(app);

if (__DEV__) {
  try {
    connectFunctionsEmulator(functions, "10.145.43.202", 5001);
    console.log("Connected to Firebase Functions emulator at 10.145.43.202:5001");
  } catch (error) {
    console.log("Functions emulator connection error:", error);
  }
}

class LooksmaxxingService {
  private functions = functions;

  async testConnection(): Promise<void> {
    try {
      console.log("Testing Firebase Functions connection...");
      console.log("Functions instance:", this.functions);
      console.log("App config:", this.functions.app.options);

      // Try to create a callable function to test the connection
      const testFunction = httpsCallable(this.functions, "analyzeLooksmaxxing");
      console.log(
        "Successfully created httpsCallable - connection appears to be working"
      );
    } catch (error) {
      console.error("Connection test failed:", error);
    }
  }

  async processLooksmaxxing(
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto: string
  ): Promise<LooksmaxxingResult> {
    try {
      console.log("Starting API calls with URLs...");

      console.log("Step 1: Calling analyzeLooksmaxxing API...");

      const analyzeLooksmaxxing = httpsCallable(
        this.functions,
        "analyzeLooksmaxxing"
      );
      console.log("Created httpsCallable for analyzeLooksmaxxing");

      console.log("Making API call to analyzeLooksmaxxing...");

      const analysisResult = (await analyzeLooksmaxxing({
        frontImageUrl: frontPhoto,
        sideImageUrl: sidePhoto,
        fullBodyImageUrl: fullBodyPhoto,
      })) as any;

      console.log("Analysis Result:", analysisResult.data);

      console.log("Step 2: Calling generateEnhancedFront API...");
      const generateEnhancedFront = httpsCallable(
        this.functions,
        "generateEnhancedFront"
      );
      const enhancedFrontResult = (await generateEnhancedFront({
        frontImageUrl: frontPhoto,
        sideImageUrl: sidePhoto,
        fullBodyImageUrl: fullBodyPhoto,
        advice: analysisResult.data.advice,
      })) as any;
      console.log("Enhanced Front Result:", enhancedFrontResult.data);
      await saveImageToAppStorage(
        enhancedFrontResult.data.imagePath,
        "front_after"
      );

      console.log("Step 3: Calling generateSideProfile API...");
      const generateSideProfile = httpsCallable(
        this.functions,
        "generateSideProfile"
      );
      const sideProfileResult = (await generateSideProfile({
        enhancedFrontImagePath: enhancedFrontResult.data.imagePath,
        advice: analysisResult.data.advice,
      })) as any;
      console.log("Side Profile Result:", sideProfileResult.data);
      await saveImageToAppStorage(
        sideProfileResult.data.imagePath,
        "side_after"
      );

      console.log("Step 4: Calling generatePhysique API...");
      const generatePhysique = httpsCallable(
        this.functions,
        "generatePhysique"
      );
      const physiqueResult = (await generatePhysique({
        enhancedFrontImagePath: enhancedFrontResult.data.imagePath,
        advice: analysisResult.data.advice,
      })) as any;
      console.log("Physique Result:", physiqueResult.data);
      await saveImageToAppStorage(
        physiqueResult.data.imagePath,
        "physique_after"
      );

      console.log("Step 5: Calling generateLifestyle API...");
      const generateLifestyle = httpsCallable(
        this.functions,
        "generateLifestyle"
      );
      const lifestyleResult = (await generateLifestyle({
        enhancedFrontImagePath: enhancedFrontResult.data.imagePath,
        advice: analysisResult.data.advice,
      })) as any;
      console.log("Lifestyle Result:", lifestyleResult.data);
      await saveImageToAppStorage(
        lifestyleResult.data.imagePath,
        "lifestyle_after"
      );

      console.log("All API calls completed successfully!");

      return {
        success: true,
        analysisResult: analysisResult.data,
        enhancedFrontResult: enhancedFrontResult.data,
        sideProfileResult: sideProfileResult.data,
        physiqueResult: physiqueResult.data,
        lifestyleResult: lifestyleResult.data,
      };
    } catch (error: any) {
      console.error("API call error:", error);
      console.error("Error details:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });

      if (error?.code) {
        console.error("Firebase error code:", error.code);
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error",
      };
    }
  }

  async analyzeLooksmaxxing(
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto: string
  ): Promise<any> {
    try {
      const analyzeLooksmaxxing = httpsCallable(
        this.functions,
        "analyzeLooksmaxxing"
      );
      const result = await analyzeLooksmaxxing({
        frontImageUrl: frontPhoto,
        sideImageUrl: sidePhoto,
        fullBodyImageUrl: fullBodyPhoto,
      });
      return result.data;
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  }

  async generateEnhancedFront(
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto: string,
    advice: string
  ): Promise<any> {
    try {
      const generateEnhancedFront = httpsCallable(
        this.functions,
        "generateEnhancedFront"
      );
      const result = await generateEnhancedFront({
        frontImageUrl: frontPhoto,
        sideImageUrl: sidePhoto,
        fullBodyImageUrl: fullBodyPhoto,
        advice: advice,
      });
      return result.data;
    } catch (error) {
      console.error("Enhanced front generation error:", error);
      throw error;
    }
  }

  async generateSideProfile(
    enhancedFrontImage: string,
    advice: string
  ): Promise<any> {
    try {
      const generateSideProfile = httpsCallable(
        this.functions,
        "generateSideProfile"
      );
      const result = await generateSideProfile({
        enhancedFrontImage: enhancedFrontImage,
        advice: advice,
      });
      return result.data;
    } catch (error) {
      console.error("Side profile generation error:", error);
      throw error;
    }
  }

  async generatePhysique(
    enhancedFrontImage: string,
    advice: string
  ): Promise<any> {
    try {
      const generatePhysique = httpsCallable(
        this.functions,
        "generatePhysique"
      );
      const result = await generatePhysique({
        enhancedFrontImage: enhancedFrontImage,
        advice: advice,
      });
      return result.data;
    } catch (error) {
      console.error("Physique generation error:", error);
      throw error;
    }
  }

  async generateLifestyle(
    enhancedFrontImage: string,
    advice: string
  ): Promise<any> {
    try {
      const generateLifestyle = httpsCallable(
        this.functions,
        "generateLifestyle"
      );
      const result = await generateLifestyle({
        enhancedFrontImage: enhancedFrontImage,
        advice: advice,
      });
      return result.data;
    } catch (error) {
      console.error("Lifestyle generation error:", error);
      throw error;
    }
  }

  async uploadUserPhotos(
    userId: string,
    photos: {
      frontPhoto: string;
      sidePhoto: string;
      fullBodyPhoto?: string | null;
    }
  ): Promise<any> {
    try {
      const result = await uploadUserPhotos(userId, photos);
      if (result.success) {
        return {
          frontPhotoUrl: result.frontPhotoUrl,
          sidePhotoUrl: result.sidePhotoUrl,
          fullBodyPhotoUrl: result.fullBodyPhotoUrl,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      console.error("Upload user photos error:", error);
      throw error;
    }
  }
}

export default new LooksmaxxingService();
