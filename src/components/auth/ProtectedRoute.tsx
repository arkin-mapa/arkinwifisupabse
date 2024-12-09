import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionContext } from '@supabase/auth-helpers-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { session } = useSessionContext();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!session?.user) {
          console.log('No active session found');
          setIsAuthenticated(false);
          navigate('/login', { replace: true });
          return;
        }

        // Check if user is admin when required
        if (requireAdmin) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              if (profileError.code === 'PGRST116') {
                // Profile not found, create it
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert([
                    { 
                      id: session.user.id,
                      role: 'client' // Default role
                    }
                  ]);

                if (insertError) throw insertError;
                
                // Not an admin, redirect
                toast.error("Access denied: Admin privileges required");
                navigate('/client', { replace: true });
                return;
              }
              throw profileError;
            }

            if (profile?.role !== 'admin') {
              toast.error("Access denied: Admin privileges required");
              navigate('/client', { replace: true });
              return;
            }
            setIsAdmin(true);
          } catch (error) {
            console.error('Profile check error:', error);
            toast.error("Error checking user permissions");
            navigate('/login', { replace: true });
            return;
          }
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        toast.error("Authentication error occurred");
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requireAdmin, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated && (!requireAdmin || isAdmin) ? children : null;
};

export default ProtectedRoute;