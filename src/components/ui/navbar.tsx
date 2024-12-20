import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
      <div className="px-3 sm:container sm:mx-auto">
        <div className="flex h-12 sm:h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              className="flex items-center"
            >
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hover:from-purple-500 hover:to-blue-400 transition-all">
                WiFi Portal
              </span>
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-1.5"
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isAdmin 
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  Admin
                </Link>
                <Link
                  to="/client"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    !isAdmin 
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  Client
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 h-8 px-2 gap-1 border-purple-200 hover:bg-purple-50 hover:text-purple-700 
                           dark:border-purple-800 dark:hover:bg-purple-900 dark:hover:text-purple-300 
                           transition-all"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="text-xs">Logout</span>
                </Button>
              </div>

              {/* Mobile Navigation Menu */}
              {isMenuOpen && (
                <div className="absolute top-12 sm:top-14 left-0 right-0 bg-white dark:bg-gray-900 border-b sm:hidden">
                  <div className="flex flex-col p-3 space-y-2">
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        isAdmin 
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Admin
                    </Link>
                    <Link
                      to="/client"
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        !isAdmin 
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Client
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full h-8 gap-1 border-purple-200 hover:bg-purple-50 hover:text-purple-700 
                               dark:border-purple-800 dark:hover:bg-purple-900 dark:hover:text-purple-300 
                               transition-all"
                    >
                      <LogOut className="h-3 w-3" />
                      <span className="text-xs">Logout</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}