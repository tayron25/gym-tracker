import {
  AuthRepositoryError,
  type AuthChangeListener,
  type AuthRepository,
} from "../../../application/auth/auth-repository";
import type {
  AuthSession,
  Profile,
  ProfileInput,
  SignInInput,
  SignUpInput,
} from "../../../domain/types/auth";

export const DEMO_CREDENTIALS = {
  email: "tayron@example.com",
  password: "password",
} as const;

export const MOCK_RESET_TOKEN = "demo-reset-token";
export const MOCK_EXPIRED_RESET_TOKEN = "expired";

const SESSION_MARKER_KEY = "gym-tracker.mock-session";
const SESSION_MARKER = "active";
const DEMO_USER_ID = "mock-user-tayron";

type MockUser = {
  id: string;
  email: string;
  password: string;
  profile: Profile;
};

const createDemoUser = (): MockUser => ({
  id: DEMO_USER_ID,
  email: DEMO_CREDENTIALS.email,
  password: DEMO_CREDENTIALS.password,
  profile: {
    displayName: "Tayron",
    weightUnit: "kg",
    timezone: "America/La_Paz",
    weekStartsOn: 1,
  },
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const createMockAuthRepository = (): AuthRepository => {
  const users = new Map<string, MockUser>();
  const listeners = new Set<AuthChangeListener>();
  let currentUserId: string | null = null;

  const notify = (session: AuthSession | null) => {
    listeners.forEach((listener) => listener(session));
  };

  const findUserByEmail = (email: string) =>
    Array.from(users.values()).find((user) => user.email === normalizeEmail(email));

  const sessionForUser = (userId: string): AuthSession => {
    const user = users.get(userId);
    if (!user) {
      throw new AuthRepositoryError("UNAUTHENTICATED", "No hay una sesión simulada activa.");
    }

    return { userId: user.id, email: user.email };
  };

  users.set(DEMO_USER_ID, createDemoUser());

  return {
    async signUp(input: SignUpInput) {
      const email = normalizeEmail(input.email);
      if (findUserByEmail(email)) {
        throw new AuthRepositoryError(
          "EMAIL_ALREADY_REGISTERED",
          "La dirección ya está registrada.",
        );
      }

      const userId = `mock-user-${users.size + 1}`;
      users.set(userId, {
        id: userId,
        email,
        password: input.password,
        profile: {
          displayName: email.split("@")[0] ?? "Atleta",
          weightUnit: "kg",
          timezone: "America/La_Paz",
          weekStartsOn: 1,
        },
      });

      return { status: "pending-confirmation", email };
    },

    async signIn(input: SignInInput) {
      const user = findUserByEmail(input.email);
      if (!user || user.password !== input.password) {
        throw new AuthRepositoryError(
          "INVALID_CREDENTIALS",
          "Las credenciales no son válidas.",
        );
      }

      currentUserId = user.id;
      sessionStorage.setItem(SESSION_MARKER_KEY, SESSION_MARKER);
      const session = sessionForUser(user.id);
      notify(session);
      return session;
    },

    async signOut() {
      currentUserId = null;
      sessionStorage.removeItem(SESSION_MARKER_KEY);
      notify(null);
    },

    async getSession() {
      if (sessionStorage.getItem(SESSION_MARKER_KEY) !== SESSION_MARKER) {
        return null;
      }

      const userId = currentUserId ?? DEMO_USER_ID;
      currentUserId = userId;
      return sessionForUser(userId);
    },

    onAuthStateChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async requestPasswordReset() {
      return { status: "sent" };
    },

    async resetPassword(token: string, password: string) {
      if (token === MOCK_EXPIRED_RESET_TOKEN) {
        throw new AuthRepositoryError(
          "RESET_TOKEN_EXPIRED",
          "El enlace de recuperación venció.",
        );
      }

      if (token !== MOCK_RESET_TOKEN || password.length < 8) {
        throw new AuthRepositoryError(
          "RESET_TOKEN_INVALID",
          "El enlace de recuperación no es válido.",
        );
      }

      return { status: "updated" };
    },

    async getProfile() {
      if (!currentUserId) {
        throw new AuthRepositoryError("UNAUTHENTICATED", "No hay una sesión activa.");
      }

      const user = users.get(currentUserId);
      if (!user) {
        throw new AuthRepositoryError("UNAUTHENTICATED", "No hay una sesión activa.");
      }

      return { ...user.profile };
    },

    async updateProfile(input: ProfileInput) {
      if (!currentUserId) {
        throw new AuthRepositoryError("UNAUTHENTICATED", "No hay una sesión activa.");
      }

      const user = users.get(currentUserId);
      if (!user) {
        throw new AuthRepositoryError("UNAUTHENTICATED", "No hay una sesión activa.");
      }

      user.profile = { ...input };
      return { ...user.profile };
    },
  };
};

