import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No active session found');
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }

        // Check if user is admin when required
        if (requireAdmin) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw profileError;
          }

          if (profile?.role !== 'admin') {
            toast.error("Access denied: Admin privileges required");
            navigate('/client');
            return;
          }
          setIsAdmin(true);
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        toast.error("Authentication error occurred");
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    // Initial auth check
    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        navigate('/login');
      } else if (event === 'SIGNED_IN' && session) {
        checkAuth();
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, requireAdmin]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && (!requireAdmin || isAdmin) ? children : null;
};

export default ProtectedRoute;