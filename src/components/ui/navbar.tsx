import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const user = useUser();
  
  const isAdmin = location.pathname.includes('admin');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/75 backdrop-blur-lg">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              WiFi Portal
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-1">
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isAdmin 
                        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    Admin
                  </Link>
                  <Link
                    to="/client"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !isAdmin 
                        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    Client
                  </Link>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}