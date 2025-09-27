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
// const API_BASE_URL = "https://bapi.lookai.me/api";
// 'http://10.0.2.2:3000/api'  // Android emulator localhost

// API Configuration - Local Development Server
const API_BASE_URL = "http://10.145.59.184:3000/api";
// Alternative: Use localhost if testing on simulator
// const API_BASE_URL = "http://localhost:3000/api";

// Initialize Firebase Auth
const auth = getAuth(app);

class LooksmaxxingService {
  private apiBaseUrl = API_BASE_URL;

  /**
   * Get Firebase ID token for authentication
   */
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    console.log("Current user:", user ? user.uid : "No user");

    if (!user) {
      throw new Error("User not authenticated - please sign in first");
    }

    try {
      const token = await user.getIdToken();
      console.log("Firebase token obtained successfully");
      return token;
    } catch (error) {
      console.error("Failed to get Firebase token:", error);
      throw new Error("Failed to get authentication token");
    }
  }

  /**
   * Make authenticated HTTP request to the API
   */
  private async makeApiRequest(
    endpoint: string,
    data: any,
    timeout: number = 300000
  ): Promise<any> {
    try {
      console.log(`Making API request to: ${this.apiBaseUrl}${endpoint}`);
      console.log("Request data keys:", Object.keys(data));

      const token = await this.getAuthToken();
      console.log("Auth token obtained, making request...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("Request timeout triggered");
        controller.abort();
      }, timeout);

      const url = `${this.apiBaseUrl}${endpoint}`;
      console.log("Full URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("API error response:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response");
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("API request successful");
      return result;
    } catch (error) {
      console.error("API request failed:", error);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout - the server took too long to respond");
      }
      if (error instanceof Error && error.message.includes("Network request failed")) {
        throw new Error("Network connection failed - please check your internet connection and try again");
      }
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean, error?: string }> {
    try {
      console.log("Testing API server connection...");
      console.log("API Base URL:", this.apiBaseUrl);

      const healthUrl = `${this.apiBaseUrl.replace("/api", "")}/health`;
      console.log("Health check URL:", healthUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "healthy") {
        console.log("API server connection successful:", data);
        return { success: true };
      } else {
        throw new Error("API server health check failed - invalid response");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Connection test failed:", errorMessage);

      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Connection timeout - server may be down' };
      }

      return { success: false, error: `Connection failed: ${errorMessage}` };
    }
  }

  /**
   * Process basic looksmaxxing pipeline for non-subscribed users (analysis + front image only)
   * @param userId - User ID for database operations
   * @param frontPhoto - URL or base64 of front-facing photo
   * @param sidePhoto - URL or base64 of side profile photo
   * @param fullBodyPhoto - URL or base64 of full body photo
   * @param setStep - Function to update progress steps
   * @param userStylePrefs - Optional style preference
   * @param targetIntensity - Enhancement intensity level: S1 (subtle), S2 (balanced), S3 (maximum natural)
   * @returns Promise<LooksmaxxingResult> with analysis and front image only
   */
  async processLooksmaxxingBasic(
    userId: string,
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto: string,
    setStep?: (step: number) => void,
    userStylePrefs?: string,
    targetIntensity?: "S1" | "S2" | "S3"
  ): Promise<LooksmaxxingResult> {
    try {
      console.log("Starting API calls with URLs...");

      // Test connection first - Temporarily disabled for local development
      // const connectionTest = await this.testConnection();
      // if (!connectionTest.success) {
      //   throw new Error(`API server connection failed: ${connectionTest.error}`);
      // }

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

      const analysisResult = await this.analyzeLooksmaxxing(
        frontPhoto,
        sidePhoto,
        fullBodyPhoto,
        userStylePrefs,
        targetIntensity
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

      setStep?.(1);

      console.log("Step 2: Calling generate/front API...");
      const enhancedFrontResult = await this.generateEnhancedFront(
        frontPhoto,
        sidePhoto,
        fullBodyPhoto,
        analysisResult.advice_json,
        targetIntensity
      );
      setStep?.(2);
      console.log("Enhanced Front Result:", enhancedFrontResult);
      await saveImageToAppStorage(enhancedFrontResult.imagePath, "front_after");

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

  /**
   * Generate additional images for subscribed users using existing analysis and front image
   * @param userId - User ID for database operations
   * @param documentId - Existing document ID to update
   * @param analysisResult - Already generated analysis result
   * @param enhancedFrontResult - Already generated front image result
   * @param setStep - Function to update progress steps
   * @returns Promise<LooksmaxxingResult> with all generated images
   */
  async generateAdditionalImages(
    userId: string,
    documentId: string,
    analysisResult: any,
    enhancedFrontResult: any,
    setStep?: (step: number) => void
  ): Promise<LooksmaxxingResult> {
    try {
      console.log(
        "Starting additional image generation for subscribed user..."
      );

      console.log("Step 3: Calling generate/side API...");
      const sideProfileResult = await this.generateSideProfile(
        enhancedFrontResult.imagePath,
        analysisResult.advice_json
      );
      console.log("Side Profile Result:", sideProfileResult);
      await saveImageToAppStorage(sideProfileResult.imagePath, "side_after");
      setStep?.(3);

      console.log("Step 4: Calling generate/physique API...");
      const physiqueResult = await this.generatePhysique(
        enhancedFrontResult.imagePath,
        analysisResult.advice_json
      );
      console.log("Physique Result:", physiqueResult);
      await saveImageToAppStorage(physiqueResult.imagePath, "physique_after");
      setStep?.(4);

      console.log("Step 5: Calling generate/lifestyle API...");
      const lifestyleResult = await this.generateLifestyle(
        enhancedFrontResult.imagePath,
        analysisResult.advice_json
      );
      console.log("Lifestyle Result:", lifestyleResult);
      await saveImageToAppStorage(lifestyleResult.imagePath, "lifestyle_after");
      setStep?.(5);

      console.log("All additional API calls completed successfully!");

      // Update database with all generated images
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
      console.error("Additional image generation error:", error);
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

  /**
   * Process complete looksmaxxing pipeline for subscribed users (all images)
   * @param userId - User ID for database operations
   * @param frontPhoto - URL or base64 of front-facing photo
   * @param sidePhoto - URL or base64 of side profile photo
   * @param fullBodyPhoto - URL or base64 of full body photo
   * @param setStep - Function to update progress steps
   * @param userStylePrefs - Optional style preference
   * @param targetIntensity - Enhancement intensity level: S1 (subtle), S2 (balanced), S3 (maximum natural)
   * @returns Promise<LooksmaxxingResult> with all generated images
   */
  async processLooksmaxxingComplete(
    userId: string,
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto: string,
    setStep?: (step: number) => void,
    userStylePrefs?: string,
    targetIntensity?: "S1" | "S2" | "S3"
  ): Promise<LooksmaxxingResult> {
    try {
      console.log("Starting complete API calls with URLs...");

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

      const analysisResult = await this.analyzeLooksmaxxing(
        frontPhoto,
        sidePhoto,
        fullBodyPhoto,
        userStylePrefs,
        targetIntensity
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

      setStep?.(1);

      console.log("Step 2: Calling generate/front API...");
      const enhancedFrontResult = await this.generateEnhancedFront(
        frontPhoto,
        sidePhoto,
        fullBodyPhoto,
        analysisResult.advice_json,
        targetIntensity
      );
      setStep?.(2);
      console.log("Enhanced Front Result:", enhancedFrontResult);
      await saveImageToAppStorage(enhancedFrontResult.imagePath, "front_after");

      // Generate additional images using the existing analysis and front image
      return await this.generateAdditionalImages(
        userId,
        documentId,
        analysisResult,
        enhancedFrontResult,
        setStep
      );
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

  /**
   * Upgrade existing basic results to complete results after subscription
   * @param userId - User ID for database operations
   * @param documentId - Existing document ID to update
   * @param setStep - Function to update progress steps
   * @returns Promise<LooksmaxxingResult> with all generated images
   */
  async upgradeToCompleteResults(
    userId: string,
    documentId?: string,
    setStep?: (step: number) => void
  ): Promise<LooksmaxxingResult> {
    try {
      // Get existing data from database
      const existingData = await this.getJsonFromFirestore(
        userId,
        "looksmaxxing_results",
        documentId
      );

      if (!existingData.success || !existingData.data) {
        throw new Error("Failed to retrieve existing data from database");
      }

      const data = existingData.data;
      const analysisResult = data.analysisResult;
      const enhancedFrontResult = data.generatedImages?.enhancedFrontResult;

      if (!analysisResult || !enhancedFrontResult) {
        throw new Error("Missing required data for upgrade");
      }

      // Get the actual document ID from the response
      const actualDocumentId = documentId || existingData.data.id;

      if (!actualDocumentId) {
        throw new Error("No document ID available for update");
      }

      console.log("Upgrading existing results to complete results...");

      // Generate additional images using existing analysis and front image
      return await this.generateAdditionalImages(
        userId,
        actualDocumentId,
        analysisResult,
        enhancedFrontResult,
        setStep
      );
    } catch (error: any) {
      console.error("Upgrade to complete results error:", error);
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
          fullBodyImageUrl: fullBodyPhoto,
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
