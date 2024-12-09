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