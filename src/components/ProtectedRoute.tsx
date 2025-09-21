import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useSession = () => {
  const [loading, setLoading] = React.useState(true);
  const [hasSession, setHasSession] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          console.warn('Auth getSession error:', error.message);
          setHasSession(false);
        } else {
          setHasSession(!!data.session);
        }
      } catch (e) {
        console.warn('Auth getSession failed:', e);
        if (!mounted) return;
        setHasSession(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, hasSession };
};

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { loading, hasSession } = useSession();
  const location = useLocation();

  if (loading) return null;
  if (!hasSession) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
