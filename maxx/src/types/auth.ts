export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providers: string[];
  creationTime?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isPremiumLoading: boolean;
  isAuthenticated: boolean;
  subscriptionDays: number | null;
  isPremium: boolean;
  premiumPurchaseDate: Date | null;
  error: string | null;
  success: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface ServiceResponse<T = any> {
  data: T | null;
  error: string | null;
  message: string;
  success: boolean;
}

export type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PREMIUM_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_SUBSCRIPTION_DAYS"; payload: number }
  | { type: "SET_PREMIUM_STATUS"; payload: boolean }
  | { type: "SET_PREMIUM_PURCHASE_DATE"; payload: Date | null }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_SUCCESS"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "CLEAR_SUCCESS" }
  | { type: "RESET_STATE" };
