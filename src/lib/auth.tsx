"use client";

import {
  confirmSignUp,
  getCurrentUser,
  resendSignUpCode,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authConfigured, configureAmplify } from "./amplify";

type AuthStatus = "loading" | "signedOut" | "signedIn";

export interface AuthContextValue {
  status: AuthStatus;
  email: string | null;
  configured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<"done" | "confirm">;
  confirmSignUpCode: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const noopAsync = async () => {};

/** Side-effect-free auth context for Storybook/Chromatic. */
export function StubAuthProvider({
  value,
  children,
}: {
  value: Partial<AuthContextValue> & Pick<AuthContextValue, "status" | "configured">;
  children: ReactNode;
}) {
  const merged: AuthContextValue = {
    email: null,
    signInWithPassword: noopAsync,
    signUpWithPassword: async () => "done",
    confirmSignUpCode: noopAsync,
    resendCode: noopAsync,
    signOutUser: noopAsync,
    refresh: noopAsync,
    ...value,
  };
  return <AuthContext.Provider value={merged}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    authConfigured ? "loading" : "signedOut",
  );
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    configureAmplify();
  }, []);

  const refresh = useCallback(async () => {
    if (!authConfigured) {
      setStatus("signedOut");
      setEmail(null);
      return;
    }
    try {
      const user = await getCurrentUser();
      setEmail(user.signInDetails?.loginId || user.username || null);
      setStatus("signedIn");
    } catch {
      setEmail(null);
      setStatus("signedOut");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      email,
      configured: authConfigured,
      refresh,
      async signInWithPassword(loginEmail, password) {
        await signIn({ username: loginEmail.trim().toLowerCase(), password });
        await refresh();
      },
      async signUpWithPassword(loginEmail, password) {
        const normalized = loginEmail.trim().toLowerCase();
        const result = await signUp({
          username: normalized,
          password,
          options: {
            userAttributes: { email: normalized },
          },
        });
        if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") return "confirm";
        await refresh();
        return "done";
      },
      async confirmSignUpCode(loginEmail, code) {
        await confirmSignUp({
          username: loginEmail.trim().toLowerCase(),
          confirmationCode: code.trim(),
        });
      },
      async resendCode(loginEmail) {
        await resendSignUpCode({ username: loginEmail.trim().toLowerCase() });
      },
      async signOutUser() {
        await signOut();
        setEmail(null);
        setStatus("signedOut");
      },
    }),
    [status, email, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
