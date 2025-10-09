import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Auth state management
class AuthManager {
  private listeners: Set<(state: AuthState) => void> = new Set();
  private state: AuthState = {
    user: null,
    session: null,
    loading: true,
  };

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      this.updateState({
        user: session?.user ?? null,
        session,
        loading: false,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(
        (_event: string, session: Session | null) => {
          this.updateState({
            user: session?.user ?? null,
            session,
            loading: false,
          });
        }
      );
    } catch (error) {
      console.error("Error initializing auth:", error);
      this.updateState({
        user: null,
        session: null,
        loading: false,
      });
    }
  }

  private updateState(newState: AuthState) {
    this.state = newState;
    this.listeners.forEach((listener) => listener(newState));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signUpWithEmail(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  }

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }
}

export const authManager = new AuthManager();
