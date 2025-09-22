export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providers: string[];
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_SUCCESS"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "CLEAR_SUCCESS" }
  | { type: "RESET_STATE" };
