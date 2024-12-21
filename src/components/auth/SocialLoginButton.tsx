import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: "outline" | "default";
}

export function SocialLoginButton({
  icon,
  label,
  className,
  variant = "outline",
  ...props
}: SocialLoginButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "w-full relative h-11",
        "flex items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}