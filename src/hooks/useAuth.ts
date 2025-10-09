import { useState, useEffect } from "react";
import { authManager, type AuthState } from "@/lib/auth";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    return await authManager.signInWithEmail(email, password);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    return await authManager.signUpWithEmail(email, password, fullName);
  };

  const signInWithGoogle = async () => {
    return await authManager.signInWithGoogle();
  };

  const signOut = async () => {
    return await authManager.signOut();
  };

  const resetPassword = async (email: string) => {
    return await authManager.resetPassword(email);
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAuthenticated: !!authState.user,
  };
}
