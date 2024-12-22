import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface EmailFormProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

export function EmailForm({ isSignUp, onToggleMode }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/client`,
            data: {
              redirect_url: window.location.href,
            }
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          toast.success("Check your email to confirm your account!");
          onToggleMode();
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            if (email.length === 0) {
              toast.error("Please enter your email address");
            } else if (password.length === 0) {
              toast.error("Please enter your password");
            } else {
              toast.error("Invalid email or password. Please check your credentials and try again.");
            }
            throw signInError;
          }
          throw signInError;
        }

        if (data?.user) {
          toast.success("Successfully signed in!");
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          localStorage.setItem('isAuthenticated', 'true');
          
          if (profileData?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/client');
          }
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please confirm your email before signing in.");
      } else if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else if (!error.message.includes("Invalid login credentials")) {
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSignUp ? "Creating Account..." : "Signing In..."}
          </>
        ) : (
          isSignUp ? "Create Account" : "Sign In"
        )}
      </Button>

      <Button
        variant="link"
        onClick={onToggleMode}
        className="w-full text-sm"
        disabled={isLoading}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Need an account? Sign up"}
      </Button>
    </form>
  );
}