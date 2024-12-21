import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up to access WiFi vouchers"
              : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm 
            isSignUp={isSignUp} 
            onToggleMode={() => setIsSignUp(!isSignUp)} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;