import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the URL hash parameters
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Check if this is an email confirmation callback
        if (type === "email_confirmation" || type === "recovery" || type === "signup") {
          if (!accessToken) {
            throw new Error("No access token found in URL");
          }

          // Set the session using the tokens from the URL
          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              throw error;
            }

            // Show success toast
            toast({
              title: "Email confirmed!",
              description: "Your email has been confirmed and you're now logged in.",
              duration: 5000,
            });

            // Redirect to dashboard
            navigate("/dashboard");
            return;
          }
        }

        // If we get here, something went wrong
        setError("Invalid authentication callback");
        setIsLoading(false);
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "An error occurred during authentication");
        setIsLoading(false);
        
        toast({
          title: "Authentication Error",
          description: err.message || "An error occurred during authentication",
          variant: "destructive",
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleEmailConfirmation();
  }, [location, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirming your email...</h2>
            <p className="text-gray-600">Please wait while we verify your account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-500">Redirecting to login page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
