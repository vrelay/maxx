// services/authService.ts
import * as WebBrowser from "expo-web-browser";
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import {
  LoginCredentials,
  ServiceResponse,
  SignupCredentials,
  User,
} from "../types/auth";

WebBrowser.maybeCompleteAuthSession();

class AuthService {
  private convertFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      providers: firebaseUser.providerData.map((p) => p.providerId),
    };
  }

  private handleError(error: any): ServiceResponse {
    const errorCode = error.code || "unknown";
    console.error("Auth Error:", errorCode, error.message);

    const errorMessages: Record<string, string> = {
      "auth/user-not-found": "No account found with this email",
      "auth/wrong-password": "Incorrect password",
      "auth/invalid-email": "Invalid email address",
      "auth/user-disabled": "Account has been disabled",
      "auth/too-many-requests": "Too many attempts. Try again later",
      "auth/email-already-in-use": "Email already registered",
      "auth/weak-password": "Password must be at least 6 characters",
      "auth/invalid-credential": "Invalid email or password",
      "auth/network-request-failed": "Network error. Check connection",
    };

    return {
      data: null,
      error:
        errorMessages[errorCode] || error.message || "Authentication failed",
      message: errorMessages[errorCode] || "Authentication failed",
      success: false,
    };
  }

  async signUpWithEmail(
    credentials: SignupCredentials
  ): Promise<ServiceResponse<User>> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      // console.log("credentials of signedup user:", userCredential);
      const user = this.convertFirebaseUser(userCredential.user);
      user.displayName = credentials.displayName;
      // console.log("user after signup",user);
      return {
        data: user,
        error: null,
        message: "Account created successfully",
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: (error as any).message || "Signup failed",
        message: (error as any).message || "Signup failed",
        success: false,
      }
    }
  }

  async signInWithEmail(
    credentials: LoginCredentials
  ): Promise<ServiceResponse<User>> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      // console.log("signedin user credentials",userCredential)
      const user = this.convertFirebaseUser(userCredential.user);

      return {
        data: user,
        error: null,
        message: "Signed in successfully",
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: (error as any).message || "Login failed",
        message: (error as any).message || "Login failed",
        success: false,
      };
    }
  }

  async signOut(): Promise<ServiceResponse> {
    try {
      await signOut(auth);
      return {
        data: null,
        error: null,
        message: "Signed out successfully",
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: (error as any).message || "Sign out failed",
        message: (error as any).message || "Sign out failed",
        success: false,
      }
    }
  }
}

export const authService = new AuthService();
