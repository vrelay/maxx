// context/AuthContext.tsx
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { CustomerInfo } from "react-native-purchases";
import Purchases from "react-native-purchases";
import { auth } from "../config/firebase";
import { authService } from "../services/authService";
import revenueCatService from "../services/revenueCatService";
import { useSubscriptionMonitoring } from "../services/subscriptionService";
import { useReferralLink } from "../hooks/useReferralLink";
import {
  AuthAction,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  User,
} from "../types/auth";
import { SavedImage } from "../utils/imageStorage";

interface AuthContextType extends AuthState {
  leftImages: SavedImage[];
  rightImages: SavedImage[];
  setLeftImages: (images: SavedImage[]) => void;
  setRightImages: (images: SavedImage[]) => void;
  looksmaxxingResults: any;
  setLooksmaxxingResults: (results: any) => void;
  processImgsGenrationForNextStep: "next3" | "nextmonthsiteration" | "";
  setProcessImgsGenrationForNextStep: (
    agree: "next3" | "nextmonthsiteration" | ""
  ) => void;
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  signUp: (credentials: SignupCredentials) => Promise<boolean>;
  signOut: () => Promise<void>;
  sendEmailVerificationForEmailSignup: () => Promise<boolean>;
  checkEmailIsEmailVerified: () => Promise<boolean>;
  clearError: () => void;
  // RevenueCat premium status
  customerInfo: CustomerInfo | null;
  isPremium: boolean;
  refreshCustomerInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
        isLoading: false,
        error: null,
      };
    case "SET_SUBSCRIPTION_DAYS":
      return { ...state, subscriptionDays: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_SUCCESS":
      return { ...state, success: action.payload, isLoading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "CLEAR_SUCCESS":
      return { ...state, success: null };
    case "RESET_STATE":
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        subscriptionDays: null,
        error: null,
        success: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  subscriptionDays: null,
  error: null,
  success: null,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [leftImages, setLeftImages] = useState<SavedImage[]>([]);
  const [rightImages, setRightImages] = useState<SavedImage[]>([]);
  const [looksmaxxingResults, setLooksmaxxingResults] = useState<any>(null);
  const [processImgsGenrationForNextStep, setProcessImgsGenrationForNextStep] =
    useState<"next3" | "nextmonthsiteration" | "">("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Referral link handling
  const { claimPendingReferral } = useReferralLink();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          providers: firebaseUser.providerData.map((p) => p.providerId),
          creationTime: firebaseUser.metadata.creationTime,
        };
        dispatch({ type: "SET_USER", payload: user });
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
    });

    return unsubscribe;
  }, []);

  // Initialize RevenueCat when user is authenticated
  useEffect(() => {
    if (state.user) {
      refreshCustomerInfo();

      // Listen for customer info updates
      const listener = revenueCatService.addCustomerInfoUpdateListener(
        (info) => {
          setCustomerInfo(info);
        }
      );

      return () => {
        // Cleanup listener if it has a remove method
        try {
          if (typeof (listener as any)?.remove === "function") {
            (listener as any).remove();
          }
        } catch (error) {
          console.error("Error removing listener:", error);
        }
      };
    }
  }, [state.user]);

  const refreshCustomerInfo = async () => {
    try {
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error("Error refreshing customer info:", error);
    }
  };

  // Add subscription monitoring after refreshCustomerInfo is defined
  useSubscriptionMonitoring(refreshCustomerInfo);

  const signIn = async (credentials: LoginCredentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    const result = await authService.signInWithEmail(credentials);
    if (result.success) {
      // Set RevenueCat app user ID
      await revenueCatService.initialize(result.data.uid);

      dispatch({ type: "SET_SUCCESS", payload: result.message });
      return true;
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
      return false;
    }
  };

  const signUp = async (credentials: SignupCredentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    const result = await authService.signUpWithEmail(credentials);

    if (result.success) {
      // Set RevenueCat app user ID
      await Purchases.logIn(result.data.uid);

      // Claim pending referral if exists
      await claimPendingReferral(result.data.uid);

      dispatch({ type: "SET_SUCCESS", payload: result.message });
      return true;
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
      return false;
    }
  };

  const sendEmailVerificationForEmailSignup = async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      try {
        await sendEmailVerification(currentUser);
        dispatch({ type: "SET_SUCCESS", payload: "Verification email sent!" });
        return true;
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        return false;
      }
    }
    return false;
  };

  const checkEmailIsEmailVerified = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();

      const updatedUser: User = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        providers: user.providerData.map((p) => p.providerId),
      };

      dispatch({ type: "SET_USER", payload: updatedUser });

      if (user.emailVerified) {
        dispatch({
          type: "SET_SUCCESS",
          payload: "Email verified successfully!",
        });
      }

      return user.emailVerified;
    }
    return false;
  };

  const signOut = async () => {
    const result = await authService.signOut();

    if (result.success) {
      dispatch({ type: "RESET_STATE" });
      dispatch({ type: "SET_SUCCESS", payload: result.message });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const isPremium = revenueCatService.isPremiumUser(customerInfo);

  const calculateCurrentDays = () => {
    const user = state.user;
    if (!user?.creationTime) {
      // Fallback to a default start date if user creation time is not available for testing
      const defaultStartDate = new Date("2024-01-01");
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - defaultStartDate.getTime());
      dispatch({
        type: "SET_SUBSCRIPTION_DAYS",
        payload: Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
      });
      return;
    }

    const startDate = new Date(user?.creationTime || "");
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    dispatch({
      type: "SET_SUBSCRIPTION_DAYS",
      payload: Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
    });
    return;
  };

  useEffect(() => {
    calculateCurrentDays();
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        leftImages,
        rightImages,
        setLeftImages,
        setRightImages,
        looksmaxxingResults,
        setLooksmaxxingResults,
        processImgsGenrationForNextStep,
        setProcessImgsGenrationForNextStep,
        signIn,
        signUp,
        signOut,
        sendEmailVerificationForEmailSignup,
        checkEmailIsEmailVerified,
        clearError,
        customerInfo,
        isPremium,
        refreshCustomerInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
