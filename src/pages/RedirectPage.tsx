
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const RedirectPage = () => {
  const { slug } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [linkData, setLinkData] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch link data from Supabase based on slug
    async function fetchLinkData() {
      if (!slug) {
        window.location.href = "/";
        return;
      }

      try {
        setIsLoading(true);
        
        // Query short_links table by slug
        const { data: linkData, error: linkError } = await supabase
          .from('short_links')
          .select('*, popups(*)')
          .eq('slug', slug)
          .single();

        if (linkError || !linkData) {
          console.error("Error fetching link:", linkError);
          window.location.href = "/";
          return;
        }

        // Increment click count
        await supabase
          .from('short_links')
          .update({ clicks: (linkData.clicks || 0) + 1 })
          .eq('id', linkData.id);

        // Set data for display
        setLinkData({
          ...linkData,
          popup: linkData.popups,
          originalUrl: linkData.destination_url
        });

        const delay = linkData.popups?.delay || 0;
        setCountdown(delay);
        
        // Show popup after delay
        if (delay > 0) {
          const timer = setTimeout(() => {
            setShowPopup(true);
          }, delay * 1000);
          
          return () => clearTimeout(timer);
        } else {
          setShowPopup(true);
        }
      } catch (err) {
        console.error("Error processing link:", err);
        toast({
          title: "Error",
          description: "Could not load the link. Please try again.",
          variant: "destructive"
        });
        window.location.href = "/";
      } finally {
        setIsLoading(false);
      }
    }

    fetchLinkData();
  }, [slug]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRedirect = () => {
    if (linkData) {
      window.location.href = linkData.destination_url || linkData.originalUrl;
    }
  };

  const handleButtonClick = () => {
    if (linkData?.popup?.button_link || linkData?.popup?.buttonUrl) {
      window.open(linkData.popup.button_link || linkData.popup.buttonUrl, '_blank');
    }
  };

  const getPlacementStyles = () => {
    if (!linkData || !linkData.popup) return "";
    
    const placement = linkData.popup.placement;
    
    switch (placement) {
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "left":
        return "top-1/2 left-4 transform -translate-y-1/2";
      case "right":
        return "top-1/2 right-4 transform -translate-y-1/2";
      case "center":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      default:
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600 mb-4">Please wait while we fetch your content.</p>
        </div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link not found</h1>
          <p className="text-gray-600 mb-4">This link may have been removed or doesn't exist.</p>
          <Button onClick={() => window.location.href = "/"}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Loading/Countdown Screen */}
      {!showPopup && countdown > 0 && (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-4">
                {countdown}
              </div>
              <p className="text-gray-600">
                Preparing your content...
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popup Overlay */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className={`absolute max-w-sm w-full mx-4 ${getPlacementStyles()} animate-fade-in`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {(linkData.popup?.logo_text || linkData.popup?.logoText) && (
                    <div className="text-sm font-medium text-purple-600 mb-2">
                      {linkData.popup?.logo_text || linkData.popup?.logoText}
                    </div>
                  )}
                  {(linkData.popup?.cta_name || linkData.popup?.ctaName) && (
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {linkData.popup?.cta_name || linkData.popup?.ctaName}
                    </h3>
                  )}
                  {(linkData.popup?.cta_description || linkData.popup?.ctaDescription) && (
                    <p className="text-sm text-gray-600 mb-4">
                      {linkData.popup?.cta_description || linkData.popup?.ctaDescription}
                    </p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-auto"
                  onClick={handleRedirect}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {(linkData.popup?.button_text || linkData.popup?.buttonText) && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleButtonClick}
                  >
                    {linkData.popup?.button_text || linkData.popup?.buttonText}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleRedirect}
                >
                  Continue to Site
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-redirect after 30 seconds */}
      {showPopup && (
        <div className="fixed bottom-4 right-4 text-sm text-gray-500 bg-white px-3 py-2 rounded shadow">
          Auto-redirecting in 30s...
        </div>
      )}
    </div>
  );
};

export default RedirectPage;
