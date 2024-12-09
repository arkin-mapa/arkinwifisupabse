import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { session, isLoading: sessionLoading } = useSessionContext();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Starting logout process");
      
      // Clear any existing session first
      await supabase.auth.clearSession();
      
      // Then perform the signOut
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.error('Logout error:', error);
        toast.error("Failed to log out");
        return;
      }

      console.log("Logout successful");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't show anything while session is loading
  if (sessionLoading) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="font-semibold"
            onClick={() => navigate(session?.user ? "/client" : "/login")}
          >
            WiFi Voucher System
          </Button>
        </div>

        {session?.user && (
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}