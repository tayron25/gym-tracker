import type {
  AuthSession,
  Profile,
  ProfileInput,
  SignInInput,
  SignUpInput,
} from "../../domain/types/auth";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_ALREADY_REGISTERED"
  | "RESET_TOKEN_EXPIRED"
  | "RESET_TOKEN_INVALID"
  | "UNAUTHENTICATED"
  | "VALIDATION_ERROR";

export class AuthRepositoryError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthRepositoryError";
    this.code = code;
  }
}

export type SignUpResult = {
  status: "pending-confirmation";
  email: string;
};

export type PasswordResetRequestResult = {
  status: "sent";
};

export type PasswordResetResult = {
  status: "updated";
};

export type AuthChangeListener = (session: AuthSession | null) => void;

export interface AuthRepository {
  signUp(input: SignUpInput): Promise<SignUpResult>;
  signIn(input: SignInInput): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  onAuthStateChange(listener: AuthChangeListener): () => void;
  requestPasswordReset(email: string): Promise<PasswordResetRequestResult>;
  resetPassword(token: string, password: string): Promise<PasswordResetResult>;
  getProfile(): Promise<Profile>;
  updateProfile(input: ProfileInput): Promise<Profile>;
}

