import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Button } from "./button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const { session, isLoading: isSessionLoading } = useSessionContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Current session:", data.session);
    };
    
    checkSession();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut || isSessionLoading) return;
    
    setIsLoggingOut(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log("No active session found, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("Logging out with session:", sessionData.session);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Failed to logout. Please try again.");
        return;
      }

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6 text-lg font-semibold">
          WiFi Voucher System
        </div>
        
        {!isSessionLoading && session && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleLogout}
            disabled={isLoggingOut || isSessionLoading}
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        )}
      </div>
    </nav>
  );
}