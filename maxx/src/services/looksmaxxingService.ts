import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import app, { db } from "@/src/config/firebase";
import { saveImageToAppStorage } from "../utils/imageStorage";
import { uploadUserPhotos } from "../utils/imageUpload";

// New structured analysis types based on Gemini 2.5 specification
export interface AnalysisScore {
  overall: number; // 0-100
  confidence: "low" | "med" | "high";
}

export interface AnalysisPriority {
  area:
    | "jawline"
    | "skin"
    | "hair"
    | "brows"
    | "facial_hair"
    | "eyes"
    | "teeth"
    | "posture"
    | "physique"
    | "style"
    | "grooming"
    | "accessories";
  why: string;
  exercises: string;
  score: number;
  impact: "low" | "med" | "high";
  difficulty: "low" | "med" | "high";
  time_horizon: "now" | "2-4w" | "1-3m";
}

export interface AnalysisRecommendations {
  skin: string[];
  hair: string[];
  facial_hair: string[];
  brows: string[];
  eyes: string[];
  teeth: string[];
  jawline: string[];
  posture: string[];
  physique: string[];
  style: string[];
  grooming: string[];
  accessories: string[];
}

export interface EditBriefItem {
  edit: string;
  intensity: "S1" | "S2" | "S3";
}

export interface StructuredAnalysisResponse {
  score: AnalysisScore;
  priorities: AnalysisPriority[];
  recommendations: AnalysisRecommendations;
  edit_brief_front: EditBriefItem[];
  tone: "natural" | "editorial" | "studio";
  lighting: string;
  negative: string[];
  notes: string;
}

export interface LooksmaxxingResult {
  success: boolean;
  analysisResult?: {
    advice_json: StructuredAnalysisResponse;
    timestamp: string;
  };
  enhancedFrontResult?: {
    imagePath: string;
    timestamp: string;
  };
  sideProfileResult?: {
    imagePath: string;
    timestamp: string;
  };
  physiqueResult?: {
    imagePath: string;
    timestamp: string;
  };
  lifestyleResult?: {
    imagePath: string;
    timestamp: string;
  };
  error?: string;
}

// Initialize functions and connect to emulator if in development
const functions = getFunctions(app);

if (__DEV__) {
  try {
    connectFunctionsEmulator(functions, "10.0.2.2", 5001);
    // console.log(
    //   "Connected to Firebase Functions emulator at 10.105.66.143:5001"
    // );
  } catch (error) {
    console.log("Functions emulator connection error:", error);
  }
}

class LooksmaxxingService {
  private functions = functions;

  private hasStructuredAnalysis(analysisResult: any): boolean {
    return (
      analysisResult &&
      analysisResult.advice_json &&
      typeof analysisResult.advice_json === "object"
    );
  }

  getStructuredAnalysis(
    analysisResult: any
  ): StructuredAnalysisResponse | null {
    if (this.hasStructuredAnalysis(analysisResult)) {
      return analysisResult.advice_json;
    }
    return null;
  }

  getPriorityRecommendations(analysisResult: any): AnalysisPriority[] {
    const structured = this.getStructuredAnalysis(analysisResult);
    if (structured) {
      return structured.priorities.sort((a, b) => {
        const impactOrder = { high: 3, med: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      });
    }
    return [];
  }

  getRecommendationsByCategory(
    analysisResult: any,
    category: keyof AnalysisRecommendations
  ): string[] {
    const structured = this.getStructuredAnalysis(analysisResult);
    if (structured && structured.recommendations[category]) {
      return structured.recommendations[category];
    }
    return [];
  }

  getAnalysisScore(analysisResult: any): AnalysisScore | null {
    const structured = this.getStructuredAnalysis(analysisResult);
    return structured ? structured.score : null;
  }

  getQuickWins(analysisResult: any): AnalysisPriority[] {
    const structured = this.getStructuredAnalysis(analysisResult);
    if (structured) {
      return structured.priorities.filter(
        (p) => p.impact === "high" && p.difficulty === "low"
      );
    }
    return [];
  }

  getImmediateActions(analysisResult: any): AnalysisPriority[] {
    const structured = this.getStructuredAnalysis(analysisResult);
    if (structured) {
      return structured.priorities.filter((p) => p.time_horizon === "now");
    }
    return [];
  }

  async testConnection(): Promise<void> {
    try {
      // console.log("Testing Firebase Functions connection...");

      const testFunction = httpsCallable(this.functions, "analyzeLooksmaxxing");
      // console.log(
      //   "Successfully created httpsCallable - connection appears to be working"
      // );
    } catch (error) {
      console.error("Connection test failed:", error);
    }
  }

  /**
   * Process complete looksmaxxing pipeline with Gemini 2.5 models
   * @param frontPhoto - URL or base64 of front-facing photo
   * @param sidePhoto - URL or base64 of side profile photo
   * @param fullBodyPhoto - URL or base64 of full body photo
   * @param userStylePrefs - Optional style preference (e.g., "menswear streetwear", "business casual")
   * @param targetIntensity - Enhancement intensity level: S1 (subtle), S2 (balanced), S3 (maximum natural)
   * @returns Promise<LooksmaxxingResult> with structured analysis
   */
  async processLooksmaxxing(
    userId: string,
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto: string,
    userStylePrefs?: string,
    targetIntensity?: "S1" | "S2" | "S3"
  ): Promise<LooksmaxxingResult> {
    try {
      console.log("Starting API calls with URLs...");

      console.log("Step 1: Calling analyzeLooksmaxxing API...");

      const analyzeLooksmaxxing = httpsCallable(
        this.functions,
        "analyzeLooksmaxxing",
        { timeout: 120000 }
      );
      console.log("Created httpsCallable for analyzeLooksmaxxing");

      console.log("Making API call to analyzeLooksmaxxing...");

      const analysisResult = (await analyzeLooksmaxxing({
        frontImageUrl: frontPhoto,
        sideImageUrl: sidePhoto,
        fullBodyImageUrl: fullBodyPhoto,
        user_style_prefs: userStylePrefs,
        target_intensity: targetIntensity || "S2",
      })) as any;

      console.log("Analysis Result:", analysisResult.data);
      this.uploadJsonToFirestore(
        userId,
        analysisResult.data,
        "looksmaxxing_results"
      );

      console.log("Step 2: Calling generateEnhancedFront API...");
      const generateEnhancedFront = httpsCallable(
        this.functions,
        "generateEnhancedFront",
        { timeout: 120000 }
      );
      const enhancedFrontResult = (await generateEnhancedFront({
        frontImageUrl: frontPhoto,
        sideImageUrl: sidePhoto,
        fullBodyImageUrl: fullBodyPhoto,
        advice: JSON.stringify(analysisResult.data.advice_json),
        target_intensity: targetIntensity || "S2",
      })) as any;
      console.log("Enhanced Front Result:", enhancedFrontResult.data);
      await saveImageToAppStorage(
        enhancedFrontResult.data.imagePath,
        "front_after"
      );

      // console.log("Step 3: Calling generateSideProfile API...");
      // const generateSideProfile = httpsCallable(
      //   this.functions,
      //   "generateSideProfile",
      //  { timeout: 120000 }
      // );
      // const sideProfileResult = (await generateSideProfile({
      //   enhancedFrontImagePath: enhancedFrontResult.data.imagePath,
      //   advice: JSON.stringify(analysisResult.data.advice_json),
      // })) as any;
      // console.log("Side Profile Result:", sideProfileResult.data);
      // await saveImageToAppStorage(
      //   sideProfileResult.data.imagePath,
      //   "side_after"
      // );

      // console.log("Step 4: Calling generatePhysique API...");
      // const generatePhysique = httpsCallable(
      //   this.functions,
      //   "generatePhysique",
       // { timeout: 120000 }
      // );
      // const physiqueResult = (await generatePhysique({
      //   enhancedFrontImagePath: enhancedFrontResult.data.imagePath,
      //   advice: JSON.stringify(analysisResult.data.advice_json),
      // })) as any;
      // console.log("Physique Result:", physiqueResult.data);
      // await saveImageToAppStorage(
      //   physiqueResult.data.imagePath,
      //   "physique_after"
      // );

      // console.log("Step 5: Calling generateLifestyle API...");
      // const generateLifestyle = httpsCallable(
      //   this.functions,
      //   "generateLifestyle",
      //  { timeout: 120000 }
      // );
      // const lifestyleResult = (await generateLifestyle({
      //   enhancedFrontImagePath: enhancedFrontResult.data.imagePath,
      //   advice: JSON.stringify(analysisResult.data.advice_json),
      // })) as any;
      // console.log("Lifestyle Result:", lifestyleResult.data);
      // await saveImageToAppStorage(
      //   lifestyleResult.data.imagePath,
      //   "lifestyle_after"
      // );

      console.log("All API calls completed successfully!");

      return {
        success: true,
        analysisResult: analysisResult.data,
        enhancedFrontResult: enhancedFrontResult.data,
        // sideProfileResult: sideProfileResult.data,
        // physiqueResult: physiqueResult.data,
        // lifestyleResult: lifestyleResult.data,
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
    fullBodyPhoto: string,
    userStylePrefs?: string,
    targetIntensity?: "S1" | "S2" | "S3"
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
        user_style_prefs: userStylePrefs,
        target_intensity: targetIntensity || "S2",
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
    advice_json: StructuredAnalysisResponse,
    targetIntensity?: "S1" | "S2" | "S3"
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
        advice: JSON.stringify(advice_json),
        target_intensity: targetIntensity || "S2",
      });
      return result.data;
    } catch (error) {
      console.error("Enhanced front generation error:", error);
      throw error;
    }
  }

  async generateSideProfile(
    enhancedFrontImagePath: string,
    advice_json: StructuredAnalysisResponse
  ): Promise<any> {
    try {
      const generateSideProfile = httpsCallable(
        this.functions,
        "generateSideProfile"
      );
      const result = await generateSideProfile({
        enhancedFrontImagePath: enhancedFrontImagePath,
        advice: JSON.stringify(advice_json),
      });
      return result.data;
    } catch (error) {
      console.error("Side profile generation error:", error);
      throw error;
    }
  }

  async generatePhysique(
    enhancedFrontImagePath: string,
    advice_json: StructuredAnalysisResponse
  ): Promise<any> {
    try {
      const generatePhysique = httpsCallable(
        this.functions,
        "generatePhysique"
      );
      const result = await generatePhysique({
        enhancedFrontImagePath: enhancedFrontImagePath,
        advice: JSON.stringify(advice_json),
      });
      return result.data;
    } catch (error) {
      console.error("Physique generation error:", error);
      throw error;
    }
  }

  async generateLifestyle(
    enhancedFrontImagePath: string,
    advice_json: StructuredAnalysisResponse
  ): Promise<any> {
    try {
      const generateLifestyle = httpsCallable(
        this.functions,
        "generateLifestyle"
      );
      const result = await generateLifestyle({
        enhancedFrontImagePath: enhancedFrontImagePath,
        advice: JSON.stringify(advice_json),
      });
      return result.data;
    } catch (error) {
      console.error("Lifestyle generation error:", error);
      throw error;
    }
  }

  async uploadJsonToFirestore(
    userId: string,
    json: any,
    collectionName: string = "looksmaxxing_results"
  ) {
    try {
      const { doc, setDoc, serverTimestamp } = await import(
        "firebase/firestore"
      );

      // Create document reference with auto-generated ID or use timestamp
      const docId = `${userId}_${Date.now()}`;
      const docRef = doc(db, collectionName, docId);

      // Prepare data to upload
      const dataToUpload = {
        userId: userId,
        data: json,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Upload to Firestore
      await setDoc(docRef, dataToUpload);

      console.log(
        `JSON data uploaded to Firestore collection: ${collectionName}, document: ${docId}`
      );

      return {
        success: true,
        documentId: docId,
        collectionName: collectionName,
        message: "Data uploaded successfully to Firestore",
      };
    } catch (error) {
      console.error("Upload json to firestore error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getJsonFromFirestore(
    userId: string,
    collectionName: string = "looksmaxxing_results",
    documentId?: string
  ) {
    try {
      const { collection, query, where, getDocs, doc, getDoc, orderBy, limit } =
        await import("firebase/firestore");

      if (documentId) {
        // Get specific document
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return {
            success: true,
            data: docSnap.data(),
            documentId: docSnap.id,
          };
        } else {
          return {
            success: false,
            error: "Document not found",
          };
        }
      } else {
        // Get all documents for user (most recent first)
        const q = query(
          collection(db, collectionName),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        const documents: any[] = [];

        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        return {
          success: true,
          data: documents[0],
          count: documents.length,
        };
      }
    } catch (error) {
      console.error("Get json from firestore error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
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
      console.log(
        "photos in the uploadUserPhotos............................",
        photos
      );
      const result = await uploadUserPhotos(userId, photos);
      if (result.success) {
        return {
          success: true,
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
