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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/75 backdrop-blur-lg dark:bg-gray-900/75">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hover:from-purple-500 hover:to-blue-400 transition-all">
              WiFi Portal
            </span>
          </Link>
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isAdmin 
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  Admin
                </Link>
                <Link
                  to="/client"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    !isAdmin 
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  Client
                </Link>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:hover:bg-purple-900 dark:hover:text-purple-300 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}