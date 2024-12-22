import { SocialLogin } from "./SocialLogin";
import { EmailForm } from "./EmailForm";

interface AuthFormProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

export function AuthForm({ isSignUp, onToggleMode }: AuthFormProps) {
  return (
    <div className="space-y-6">
      <SocialLogin />
      <EmailForm isSignUp={isSignUp} onToggleMode={onToggleMode} />
    </div>
  );
}