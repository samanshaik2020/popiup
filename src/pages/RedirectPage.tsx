import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { X } from 'lucide-react';

// Define the type for popup data
interface PopupData {
  id: string;
  user_id: string;
  name: string;
  content: any; // This is likely JSON content stored as text
  type: string;
  position: string;
  trigger_type: string;
  trigger_value: {
    delay?: number;
  } | Record<string, any>;
  styles: Record<string, any>;
  active: boolean;
  frequency_cap: number | null;
  targeting_rules: any | null;
  created_at: string;
  updated_at: string;
}

// Define the type for short link data
interface ShortLinkData {
  id: string;
  user_id: string;
  popup_id: string | null;
  slug: string;
  destination_url: string;
  title: string;
  description: string;
  active: boolean;
  clicks: number;
  created_at: string;
  updated_at: string;
  popups: PopupData | null;
}

// Define the type for parsed popup content
interface ParsedPopupContent {
  profile_name: string;
  profile_url?: string;
  description: string;
  button_text: string;
  button_link: string;
  logo_text?: string;
  placement?: string;
  delay_seconds?: number;
  [key: string]: any;
}

const RedirectPage = () => {
  const { slug } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [linkData, setLinkData] = useState<ShortLinkData | null>(null);
  const [popupContent, setPopupContent] = useState<ParsedPopupContent | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  // New state for iframe loaded status
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Initial effect to fetch link data
    fetchLinkData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, toast]);

  // Separate useEffect to handle showing the popup after iframe loads
  useEffect(() => {
    if (iframeLoaded && popupContent && popupContent.delay_seconds && popupContent.delay_seconds > 0) {
      console.log("Starting countdown for", popupContent.delay_seconds, "seconds");
      setCountdown(popupContent.delay_seconds);
      
      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowPopup(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    } else if (iframeLoaded && popupContent && (!popupContent.delay_seconds || popupContent.delay_seconds <= 0)) {
      // If no delay specified, show popup immediately when iframe loads
      setShowPopup(true);
    }
  }, [iframeLoaded, popupContent]);

  // Fetch link data from Supabase based on slug
  async function fetchLinkData() {
      if (!slug) {
        window.location.href = "/";
        return;
      }

      try {
        setIsLoading(true);
        
        // Query short_links table by slug with related popup data
        const { data: linkData, error: linkError } = await supabase
          .from('short_links')
          .select('*, popups(*)')
          .eq('slug', slug)
          .single();

        if (linkError || !linkData) {
          console.error("Error fetching link:", linkError);
          toast({
            title: "Link not found",
            description: "This link doesn't exist or has been removed.",
            variant: "destructive"
          });
          window.location.href = "/";
          return;
        }

        console.log("Fetched link data:", linkData); // Debug: Log the data structure

        // Increment click count with error handling
        try {
          // Use a direct update with error handling
          const { error: updateError } = await supabase
            .from('short_links')
            .update({ 
              clicks: (linkData.clicks || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', linkData.id);
          
          if (updateError) {
            console.error("Error incrementing clicks:", updateError);
          } else {
            console.log("Click count updated successfully");
          }
          
          // For a more robust solution in production, consider:
          // 1. Creating a Postgres function that does an atomic increment
          // 2. Using Supabase Edge Functions for atomic operations
          // 3. Implementing a queue system for analytics events
        } catch (err) {
          console.error("Exception during click update:", err);
          // Continue with the flow even if click update fails
        }

        // Set link data
        setLinkData(linkData as ShortLinkData);
        
        // Parse and set popup content
        // Initialize with empty values, will be populated from Supabase
        let parsedContent: ParsedPopupContent = {
          profile_name: '',
          description: '',
          button_text: '',
          button_link: ''
        };
        
        if (linkData.popups?.content) {
          // Try parsing the content if it's stored as a string
          try {
            let contentData;
            if (typeof linkData.popups.content === 'string') {
              contentData = JSON.parse(linkData.popups.content);
            } else if (typeof linkData.popups.content === 'object') {
              contentData = linkData.popups.content;
            }
            
            // Apply all content properties from parsed data
            if (contentData) {
              Object.assign(parsedContent, contentData);
            }
          } catch (err) {
            console.error("Error parsing popup content:", err);
            // Continue with empty content if parse fails
          }
        }
        
        // Ensure required fields have values (use fallbacks only if needed)
        if (!parsedContent.profile_name) {
          parsedContent.profile_name = linkData.popups?.name || linkData.title || 'Popup';
        }
        
        if (!parsedContent.description) {
          parsedContent.description = linkData.description || 'Check out this content';
        }
        
        if (!parsedContent.button_text) {
          parsedContent.button_text = 'Learn More';
        }
        
        if (!parsedContent.button_link) {
          parsedContent.button_link = linkData.destination_url;
        }
        
        console.log("Parsed popup content:", parsedContent); // Debug: Log the parsed content
        setPopupContent(parsedContent);

        // Get delay from the popup configuration
        let delay = 0;
        if ((linkData.popups?.trigger_type === 'delay' || linkData.popups?.trigger_type === 'time_delay') && linkData.popups?.trigger_value) {
          // Check if trigger_value is a number first (common case)
          if (typeof linkData.popups.trigger_value === 'number') {
            delay = linkData.popups.trigger_value;
          }
          // If it's an object, try to get the delay property
          else if (typeof linkData.popups.trigger_value === 'object' && linkData.popups.trigger_value !== null) {
            if ('delay' in linkData.popups.trigger_value) {
              delay = Number(linkData.popups.trigger_value.delay) || 0;
            }
          }
          console.log("Extracted delay value:", delay);
        }
        
        // Store the delay in the popup content for display
        parsedContent.delay_seconds = delay;
        
        console.log("Popup delay:", delay); // Debug: Log the delay value
        // We'll handle the countdown and showing popup in the iframe loaded useEffect
        // This ensures we only start the countdown after the page is fully loaded
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

  // Removed duplicate fetchLinkData call and redundant countdown useEffect

  // Redirect to the destination URL
  const handleRedirect = () => {
    if (linkData) {
      window.location.href = linkData.destination_url;
    }
  };

  // Handle CTA button click
  const handleButtonClick = () => {
    // Use the button_link from parsed popup content
    if (popupContent?.button_link) {
      window.open(popupContent.button_link, '_blank');
    } else if (linkData?.destination_url) {
      // Fallback to destination URL
      window.open(linkData.destination_url, '_blank');
    }
  };

  // Get CSS classes for popup placement
  const getPlacementStyles = () => {
    // Get placement from popups data or default to center
    const placement = linkData?.popups?.position || 'center';
    
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
          <p className="text-gray-600 mb-4">This link doesn't exist or has been removed.</p>
          <Button onClick={() => window.location.href = "/"}>Go Home</Button>
        </div>
      </div>
    );
  }
  
  // Update handleRedirect to close popup instead of redirecting
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // The iframe-based layout with popup overlay
  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* The iframe containing the destination website */}
      <iframe 
        src={linkData.destination_url}
        className="w-full h-full border-0"
        onLoad={() => setIframeLoaded(true)}
        title="Destination website"
      />
      
      {/* Loading overlay shown while iframe is loading */}
      {!iframeLoaded && (
        <div className="absolute inset-0 bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Content...</h1>
            <p className="text-gray-600 mb-4">
              Please wait while we load the page
            </p>
          </div>
        </div>
      )}
      
      {/* Countdown overlay before showing popup */}
      {iframeLoaded && !showPopup && countdown > 0 && (
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md">
          <p className="text-sm text-gray-600">Popup will appear in {countdown}s</p>
        </div>
      )}

      {/* Popup Overlay */}
      {showPopup && popupContent && (
        <div className={`fixed ${getPlacementStyles()} z-50`}>
          <Card className="w-[400px] max-w-[90%] shadow-xl">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {/* Profile image if available */}
                  {popupContent.profile_image_url && (
                    <img 
                      src={popupContent.profile_image_url} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                      onError={(e) => {
                        console.error("Error loading profile image:", e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="font-semibold">{popupContent.profile_name}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-1 h-auto" 
                  onClick={handleClosePopup}
                >
                  <X size={16} />
                </Button>
              </div>
              
              {/* Main image if available */}
              {popupContent.image_url && (
                <div className="mb-4 rounded-md overflow-hidden">
                  <img 
                    src={popupContent.image_url} 
                    alt="Content" 
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      console.error("Error loading main image:", e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-700 mb-4 break-words overflow-hidden">{popupContent.description}</p>
              
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleButtonClick}
              >
                {popupContent.button_text}
              </Button>
              
              <div className="mt-2 text-xs text-center text-gray-400">
                {/* Debug info */}
                <div className="text-xs text-gray-400 mt-1">
                  Template: {popupContent.template || 'standard'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RedirectPage;
