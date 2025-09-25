import { getAuth } from "firebase/auth";
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

// API Configuration
const API_BASE_URL = "http://34.41.142.44/api";
// 'http://10.0.2.2:3000/api'  // Android emulator localhost

// Initialize Firebase Auth
const auth = getAuth(app);

class LooksmaxxingService {
  private apiBaseUrl = API_BASE_URL;

  /**
   * Get Firebase ID token for authentication
   */
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    return await user.getIdToken();
  }

  /**
   * Make authenticated HTTP request to the API
   */
  private async makeApiRequest(
    endpoint: string,
    data: any,
    timeout: number = 180000
  ): Promise<any> {
    try {
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

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
      console.log("Testing API server connection...");

      const response = await fetch(
        `${this.apiBaseUrl.replace("/api", "")}/health`
      );
      const data = await response.json();

      if (response.ok && data.status === "healthy") {
        console.log("API server connection successful:", data);
      } else {
        throw new Error("API server health check failed");
      }
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
    subscribed: boolean,
    userId: string,
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto: string,
    setStep: (step: number) => void,
    userStylePrefs?: string,
    targetIntensity?: "S1" | "S2" | "S3"
  ): Promise<LooksmaxxingResult> {
    try {
      console.log("Starting API calls with URLs...");

      // First database save: Initial photo URLs
      const initialData = {
        userId: userId,
        inputPhotos: {
          frontPhoto: frontPhoto,
          sidePhoto: sidePhoto,
          fullBodyPhoto: fullBodyPhoto,
        },
        userStylePrefs: userStylePrefs || "",
        targetIntensity: targetIntensity || "S2",
        status: "processing",
      };

      const initialSaveResult = await this.uploadJsonToFirestore(
        userId,
        initialData,
        "looksmaxxing_results"
      );

      if (!initialSaveResult.success || !initialSaveResult.documentId) {
        console.error("Failed to save initial data:", initialSaveResult.error);
        throw new Error("Failed to create initial document in database");
      }

      const documentId = initialSaveResult.documentId;

      console.log("Step 1: Calling analyze API...");

      const analysisResult = await this.makeApiRequest(
        "/analyze",
        {
          frontImageUrl: frontPhoto,
          sideImageUrl: sidePhoto,
          fullBodyImageUrl: fullBodyPhoto,
          userStylePrefs: userStylePrefs,
          targetIntensity: targetIntensity || "S2",
        },
        120000
      );
      console.log("Analysis Result:", analysisResult);

      // Second database update: Analysis result JSON
      const analysisUpdateData = {
        analysisResult: analysisResult,
        status: "analysis_complete",
      };

      const analysisUpdateResult = await this.updateDocumentInFirestore(
        userId,
        documentId,
        analysisUpdateData,
        "looksmaxxing_results"
      );

      if (!analysisUpdateResult.success) {
        console.error(
          "Failed to update analysis result:",
          analysisUpdateResult.error
        );
      }

      setStep(1);

      console.log("Step 2: Calling generate/front API...");
      const enhancedFrontResult = await this.makeApiRequest(
        "/generate/front",
        {
          frontImageUrl: frontPhoto,
          sideImageUrl: sidePhoto,
          advice: JSON.stringify(analysisResult.advice_json),
          targetIntensity: targetIntensity || "S2",
        },
        300000
      );
      setStep(2);
      console.log("Enhanced Front Result:", enhancedFrontResult);
      await saveImageToAppStorage(enhancedFrontResult.imagePath, "front_after");

      if (!subscribed) {
        // Third database update: Generated images for non-subscribed users
        const finalUpdateData = {
          generatedImages: {
            enhancedFrontResult: enhancedFrontResult,
          },
          status: "complete",
        };

        const finalUpdateResult = await this.updateDocumentInFirestore(
          userId,
          documentId,
          finalUpdateData,
          "looksmaxxing_results"
        );

        if (!finalUpdateResult.success) {
          console.error(
            "Failed to update final result:",
            finalUpdateResult.error
          );
        }

        return {
          success: true,
          analysisResult: analysisResult,
          enhancedFrontResult: enhancedFrontResult,
        };
      }

      console.log("Step 3: Calling generate/side API...");
      const sideProfileResult = await this.makeApiRequest(
        "/generate/side",
        {
          enhancedFrontImagePath: enhancedFrontResult.imagePath,
          advice: JSON.stringify(analysisResult.advice_json),
        },
        300000
      );
      console.log("Side Profile Result:", sideProfileResult);
      await saveImageToAppStorage(sideProfileResult.imagePath, "side_after");

      console.log("Step 4: Calling generate/physique API...");
      const physiqueResult = await this.makeApiRequest(
        "/generate/physique",
        {
          enhancedFrontImagePath: enhancedFrontResult.imagePath,
          advice: JSON.stringify(analysisResult.advice_json),
        },
        300000
      );
      console.log("Physique Result:", physiqueResult);
      await saveImageToAppStorage(physiqueResult.imagePath, "physique_after");

      console.log("Step 5: Calling generate/lifestyle API...");
      const lifestyleResult = await this.makeApiRequest(
        "/generate/lifestyle",
        {
          enhancedFrontImagePath: enhancedFrontResult.imagePath,
          advice: JSON.stringify(analysisResult.advice_json),
        },
        300000
      );
      console.log("Lifestyle Result:", lifestyleResult);
      await saveImageToAppStorage(lifestyleResult.imagePath, "lifestyle_after");

      console.log("All API calls completed successfully!");

      // Third database update: All generated images for subscribed users
      const finalUpdateData = {
        generatedImages: {
          enhancedFrontResult: enhancedFrontResult,
          sideProfileResult: sideProfileResult,
          physiqueResult: physiqueResult,
          lifestyleResult: lifestyleResult,
        },
        status: "complete",
      };

      const finalUpdateResult = await this.updateDocumentInFirestore(
        userId,
        documentId,
        finalUpdateData,
        "looksmaxxing_results"
      );

      if (!finalUpdateResult.success) {
        console.error(
          "Failed to update final result:",
          finalUpdateResult.error
        );
      }

      return {
        success: true,
        analysisResult: analysisResult,
        enhancedFrontResult: enhancedFrontResult,
        sideProfileResult: sideProfileResult,
        physiqueResult: physiqueResult,
        lifestyleResult: lifestyleResult,
      };
    } catch (error: any) {
      console.error("API call error:", error);
      console.error("Error details:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
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
      const result = await this.makeApiRequest("/analyze", {
        frontImageUrl: frontPhoto,
        sideImageUrl: sidePhoto,
        fullBodyImageUrl: fullBodyPhoto,
        userStylePrefs: userStylePrefs,
        targetIntensity: targetIntensity || "S2",
      });
      return result;
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
      const result = await this.makeApiRequest(
        "/generate/front",
        {
          frontImageUrl: frontPhoto,
          sideImageUrl: sidePhoto,
          advice: JSON.stringify(advice_json),
          targetIntensity: targetIntensity || "S2",
        },
        300000
      );
      return result;
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
      const result = await this.makeApiRequest(
        "/generate/side",
        {
          enhancedFrontImagePath: enhancedFrontImagePath,
          advice: JSON.stringify(advice_json),
        },
        300000
      );
      return result;
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
      const result = await this.makeApiRequest(
        "/generate/physique",
        {
          enhancedFrontImagePath: enhancedFrontImagePath,
          advice: JSON.stringify(advice_json),
        },
        300000
      );
      return result;
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
      const result = await this.makeApiRequest(
        "/generate/lifestyle",
        {
          enhancedFrontImagePath: enhancedFrontImagePath,
          advice: JSON.stringify(advice_json),
        },
        300000
      );
      return result;
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
        initialImages: json,
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

  /**
   * Update existing document in Firestore with new data
   */
  async updateDocumentInFirestore(
    userId: string,
    documentId: string,
    updateData: any,
    collectionName: string = "looksmaxxing_results"
  ) {
    try {
      const { doc, updateDoc, serverTimestamp } = await import(
        "firebase/firestore"
      );

      const docRef = doc(db, collectionName, documentId);

      // Prepare update data
      const dataToUpdate = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      // Update document in Firestore
      await updateDoc(docRef, dataToUpdate);

      console.log(
        `Document updated in Firestore collection: ${collectionName}, document: ${documentId}`
      );

      return {
        success: true,
        documentId: documentId,
        collectionName: collectionName,
        message: "Document updated successfully in Firestore",
      };
    } catch (error) {
      console.error("Update document in firestore error:", error);
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
