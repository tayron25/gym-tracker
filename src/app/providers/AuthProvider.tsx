import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  AuthRepository,
  PasswordResetRequestResult,
  PasswordResetResult,
  SignUpResult,
} from "../../application/auth/auth-repository";
import type {
  AuthSession,
  Profile,
  ProfileInput,
  SignInInput,
  SignUpInput,
} from "../../domain/types/auth";

type AuthContextValue = {
  session: AuthSession | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn(input: SignInInput): Promise<AuthSession>;
  signUp(input: SignUpInput): Promise<SignUpResult>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<PasswordResetRequestResult>;
  resetPassword(token: string, password: string): Promise<PasswordResetResult>;
  updateProfile(input: ProfileInput): Promise<Profile>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = PropsWithChildren<{
  repository: AuthRepository;
}>;

export function AuthProvider({ children, repository }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(
    async (nextSession: AuthSession | null) => {
      if (!nextSession) {
        setProfile(null);
        return;
      }

      setProfile(await repository.getProfile());
    },
    [repository],
  );

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const currentSession = await repository.getSession();
      if (!mounted) return;
      setSession(currentSession);
      await loadProfile(currentSession);
      if (mounted) setIsLoading(false);
    };

    void initialize();

    const unsubscribe = repository.onAuthStateChange((nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      void loadProfile(nextSession);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [loadProfile, repository]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      signIn: (input) => repository.signIn(input),
      signUp: (input) => repository.signUp(input),
      signOut: () => repository.signOut(),
      requestPasswordReset: (email) => repository.requestPasswordReset(email),
      resetPassword: (token, password) => repository.resetPassword(token, password),
      updateProfile: async (input) => {
        const updated = await repository.updateProfile(input);
        setProfile(updated);
        return updated;
      },
    }),
    [isLoading, profile, repository, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}

