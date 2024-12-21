import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import AuthForm from "@/components/auth/AuthForm";
import GoogleOneTap from "@/components/auth/GoogleOneTap";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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
          setIsSignUp(false);
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
          navigate("/client");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Sign up to access WiFi vouchers"
              : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            isSignUp={isSignUp}
            setIsSignUp={setIsSignUp}
            isLoading={isLoading}
            onSubmit={handleAuth}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
          />
        </CardContent>
      </Card>
      <GoogleOneTap />
    </div>
  );
};

export default AuthPage;