import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { z } from "zod";

// Validation schemas
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({
  open,
  onOpenChange,
  defaultMode = "signin",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  React.useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setEmail("");
      setPassword("");
      setFullName("");
      setError("");
      setSuccess("");
    }
  }, [open, defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form data based on mode
      let validatedData;
      if (mode === "signin") {
        validatedData = signInSchema.parse({ email, password });
        const { error } = await signIn(
          validatedData.email,
          validatedData.password
        );
        if (error) throw error;
        onOpenChange(false);
      } else if (mode === "signup") {
        validatedData = signUpSchema.parse({ email, password, fullName });
        const { error } = await signUp(
          validatedData.email,
          validatedData.password,
          validatedData.fullName
        );
        if (error) throw error;
        setSuccess("Check your email for a confirmation link!");
      } else if (mode === "forgot") {
        validatedData = forgotPasswordSchema.parse({ email });
        const { error } = await resetPassword(validatedData.email);
        if (error) throw error;
        setSuccess("Password reset email sent!");
      }
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || "Validation error");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signin":
        return "Sign In";
      case "signup":
        return "Sign Up";
      case "forgot":
        return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signin":
        return "Sign in to save and manage your thumbnail projects";
      case "signup":
        return "Create an account to start saving your projects";
      case "forgot":
        return "Enter your email to receive a password reset link";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Google Sign In */}
          {mode !== "forgot" && (
            <>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-[18px] h-[18px] animate-spin mr-2" />
                ) : (
                  <Mail className="w-[18px] h-[18px] mr-2" />
                )}
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFullName(e.target.value)
                    }
                    className="pl-10"
                    required={mode === "signup"}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    className="pl-10"
                    required={mode === "signin" || mode === "signup"}
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin mr-2" />
              ) : null}
              {mode === "signin"
                ? "Sign In"
                : mode === "signup"
                  ? "Sign Up"
                  : "Send Reset Email"}
            </Button>
          </form>

          {/* Mode switching */}
          <div className="text-center text-sm">
            {mode === "signin" && (
              <>
                <span className="text-muted-foreground">
                  Don't have an account?{" "}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setMode("signup")}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  Sign up
                </Button>
                <br />
                <Button
                  variant="ghost"
                  onClick={() => setMode("forgot")}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  Forgot your password?
                </Button>
              </>
            )}
            {mode === "signup" && (
              <>
                <span className="text-muted-foreground">
                  Already have an account?{" "}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setMode("signin")}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </Button>
              </>
            )}
            {mode === "forgot" && (
              <>
                <span className="text-muted-foreground">
                  Remember your password?{" "}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setMode("signin")}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
