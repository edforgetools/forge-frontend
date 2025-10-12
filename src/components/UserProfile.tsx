import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

interface UserProfileProps {
  onSignInClick?: () => void;
}

export function UserProfile({ onSignInClick }: UserProfileProps) {
  const { user, signOut, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Button variant="secondary" onClick={onSignInClick}>
        <User className="w-[18px] h-[18px] mr-2" />
        Sign In
      </Button>
    );
  }

  const getInitials = (name: string | undefined, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
        <AvatarFallback>
          {getInitials(user.user_metadata?.full_name, user.email || "")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="text-sm font-medium leading-none">
          {user.user_metadata?.full_name || "User"}
        </p>
        <p className="text-xs leading-none text-muted-foreground">
          {user.email}
        </p>
      </div>
      <Button
        variant="ghost"
        size="md"
        onClick={handleSignOut}
        disabled={loading}
        aria-label={loading ? "Signing out..." : "Sign out"}
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
