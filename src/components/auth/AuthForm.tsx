import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SocialLoginButton } from "./SocialLoginButton";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

export function AuthForm({ isSignUp, onToggleMode }: AuthFormProps) {
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
          // Get user role from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          // Redirect based on user role
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

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/client`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid w-full gap-6">
        <SocialLoginButton
          icon={
            <svg className="size-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          }
          label="Continue with Google"
          onClick={handleGoogleSignIn}
          className="text-gray-900 bg-white hover:bg-gray-50 border border-gray-300"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

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
      </form>

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
    </div>
  );
}