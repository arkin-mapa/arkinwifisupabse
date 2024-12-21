import { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const GOOGLE_CLIENT_ID = "1096241878873-bnv8e0f7p8p7qqj4vj5g5k91vf9ld4hq.apps.googleusercontent.com";

const GoogleOneTap = () => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleGoogleOneTapResponse = async (response: CredentialResponse) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) throw error;

      if (data?.user) {
        toast.success("Successfully signed in!");
        navigate("/client");
      }
    } catch (error: any) {
      console.error('Google One Tap error:', error);
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleOneTapResponse,
            auto_select: true,
            cancel_on_tap_outside: false,
          });

          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log('One Tap not displayed:', notification.getNotDisplayedReason());
            }
          });
        }
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    loadGoogleScript();
  }, []);

  return null;
};

export default GoogleOneTap;