import { cn } from "@/lib/utils";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function Navbar({ className, ...props }: NavbarProps) {
  return (
    <nav
      className={cn(
        "w-full h-14 flex items-center px-4 md:px-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            WiFi Manager
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Welcome, Admin
          </span>
        </div>
      </div>
    </nav>
  );
}