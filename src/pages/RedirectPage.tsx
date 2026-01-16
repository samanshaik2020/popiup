import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase, trackEvent } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { X } from 'lucide-react';
import { Helmet } from "react-helmet";
import { PopupData, PopupContent } from "@/types";



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
  profile_name?: string;
  profile_url?: string;
  profile_image_url?: string;
  image_url?: string;
  video_url?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  logo_text?: string;
  logo_url?: string;
  placement?: string;
  delay_seconds?: number;
  template?: string;
  // Styling options
  background_color?: string;
  text_color?: string;
  popup_width?: string;
  popup_height?: string;
  // Button styling
  button_color?: string;
  button_text_color?: string;
  button_radius?: string;
  button_padding?: string;
  button_font_weight?: string;
  [key: string]: unknown;
}

const RedirectPage = () => {
  const { slug } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [linkData, setLinkData] = useState<ShortLinkData | null>(null);
  const [popupContent, setPopupContent] = useState<ParsedPopupContent | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  // New state for iframe loaded status
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [metaTags, setMetaTags] = useState<{
    title: string;
    description: string;
    image?: string;
    url: string;
  } | null>(null);

  // Debug info - log the slug parameter
  if (import.meta.env.DEV) {
    console.log('RedirectPage: Current slug parameter:', slug);
  }

  useEffect(() => {
    // Initial effect to fetch link data
    fetchLinkData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, toast]);

  // Separate useEffect to handle showing the popup after iframe loads
  useEffect(() => {
    if (iframeLoaded && popupContent && popupContent.delay_seconds && popupContent.delay_seconds > 0) {
      if (import.meta.env.DEV) {
        console.log("Starting countdown for", popupContent.delay_seconds, "seconds");
      }
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
      console.error("No slug parameter provided");
      setError("No slug parameter provided");
      window.location.href = "/";
      return;
    }

    try {
      setIsLoading(true);
      if (import.meta.env.DEV) {
        console.log("Fetching link data for slug:", slug);
      }

      // First, check if the slug exists in the database
      const { count, error: countError } = await supabase
        .from('short_links')
        .select('*', { count: 'exact', head: true })
        .eq('slug', slug);

      if (countError) {
        console.error("Error checking if slug exists:", countError);
        setError(`Database error: ${countError.message}`);
      }

      if (import.meta.env.DEV) {
        console.log(`Found ${count} links with slug '${slug}'`);
      }

      if (count === 0) {
        console.error(`No link found with slug: ${slug}`);
        setError(`Link not found: ${slug}`);
        toast({
          title: "Link not found",
          description: `No link exists with the identifier '${slug}'`,
          variant: "destructive"
        });

        // Wait a moment before redirecting to ensure the toast is visible
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return;
      }

      // Query short_links table by slug with related popup data
      const { data: linkData, error: linkError } = await supabase
        .from('short_links')
        .select('*, popups(*)')
        .eq('slug', slug)
        .single();

      if (linkError) {
        console.error("Error fetching link data:", linkError);
        setError(`Error fetching link: ${linkError.message}`);
        toast({
          title: "Error loading link",
          description: "There was a problem loading this link.",
          variant: "destructive"
        });

        // Wait a moment before redirecting to ensure the toast is visible
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return;
      }

      if (!linkData) {
        console.error("No link data returned for slug:", slug);
        setError(`No data returned for slug: ${slug}`);
        toast({
          title: "Link not found",
          description: "This link doesn't exist or has been removed.",
          variant: "destructive"
        });

        // Wait a moment before redirecting to ensure the toast is visible
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return;
      }

      if (import.meta.env.DEV) {
        console.log("Fetched link data:", linkData);
      }

      // Track click event in analytics table
      try {
        await trackEvent({
          short_link_id: linkData.id,
          popup_id: linkData.popup_id,
          event_type: 'click',
          referrer: document.referrer || null,
          browser: navigator.userAgent || null
        });
        if (import.meta.env.DEV) {
          console.log("Click event tracked successfully");
        }
      } catch (err) {
        console.error("Error tracking click event:", err);
        // Continue with the flow even if tracking fails
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

      if (import.meta.env.DEV) {
        console.log("Parsed popup content:", parsedContent);
      }
      setPopupContent(parsedContent);

      // Set meta tags for social media preview
      // Prioritize stored OG metadata, fallback to popup content or link data
      setMetaTags({
        title: linkData.og_title || linkData.title || parsedContent.profile_name || 'Check this out!',
        description: linkData.og_description || linkData.description || parsedContent.description || 'Click to view content',
        image: linkData.og_image || parsedContent.image_url || parsedContent.profile_image_url,
        url: linkData.destination_url
      });

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
        if (import.meta.env.DEV) {
          console.log("Extracted delay value:", delay);
        }
      }

      // Store the delay in the popup content for display
      parsedContent.delay_seconds = delay;

      if (import.meta.env.DEV) {
        console.log("Popup delay:", delay);
      }
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
      case "bottom":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "left":
        return "top-1/2 left-4 transform -translate-y-1/2";
      case "right":
        return "top-1/2 right-4 transform -translate-y-1/2";
      case "center":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
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
    <>
      {/* Dynamic meta tags for social media preview */}
      {metaTags && (
        <Helmet>
          <title>{metaTags.title}</title>
          <meta name="description" content={metaTags.description} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:title" content={metaTags.title} />
          <meta property="og:description" content={metaTags.description} />
          {metaTags.image && <meta property="og:image" content={metaTags.image} />}

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={window.location.href} />
          <meta name="twitter:title" content={metaTags.title} />
          <meta name="twitter:description" content={metaTags.description} />
          {metaTags.image && <meta name="twitter:image" content={metaTags.image} />}

          {/* Canonical URL - points to destination */}
          <link rel="canonical" href={metaTags.url} />
        </Helmet>
      )}

      <div className="h-screen w-screen overflow-hidden relative">
        {/* Error display */}
        {error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
            <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
              <h1 className="text-2xl font-bold text-red-700 mb-4">Error Loading Link</h1>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="text-sm text-gray-600 mb-6">
                <p>Debug information:</p>
                <p>Slug: {slug || 'No slug provided'}</p>
                <p>Path: {window.location.pathname}</p>
              </div>
              <Button onClick={() => window.location.href = "/"}>Return to Home</Button>
            </div>
          </div>
        )}

        {/* The iframe containing the destination website */}
        {linkData && (
          <iframe
            src={linkData.destination_url}
            className="w-full h-full border-0"
            onLoad={() => setIframeLoaded(true)}
            title="Destination website"
          />
        )}

        {/* Loading overlay shown while iframe is loading */}
        {isLoading && !error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Content...</h1>
              <p className="text-gray-600 mb-4">
                Please wait while we load the page
              </p>
              <p className="text-gray-500 text-sm">
                Looking up: {slug}
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
            <Card
              className="max-w-[90%] shadow-xl"
              style={{
                width: popupContent.popup_width || '400px',
                height: popupContent.popup_height || 'auto',
                backgroundColor: popupContent.background_color || '#ffffff',
                color: popupContent.text_color || '#000000'
              }}
            >
              <CardContent className="p-4">
                {/* Logo section */}
                {(popupContent.logo_text || popupContent.logo_url) && (
                  <div className="flex items-center mb-3">
                    {popupContent.logo_url && (
                      <img
                        src={popupContent.logo_url}
                        alt="Logo"
                        className="h-6 mr-2 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {popupContent.logo_text && (
                      <div
                        className="text-sm font-medium"
                        style={{ color: popupContent.text_color || '#000000' }}
                      >
                        {popupContent.logo_text}
                      </div>
                    )}
                  </div>
                )}

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
                    <h3
                      className="font-semibold"
                      style={{ color: popupContent.text_color || '#000000' }}
                    >
                      {popupContent.profile_name}
                    </h3>
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

                {/* Main image if available (for image template) */}
                {popupContent.template === 'image' && popupContent.image_url && (
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

                {/* Video if available (for video template) */}
                {popupContent.template === 'video' && popupContent.video_url && (
                  <div className="mb-4 rounded-md overflow-hidden">
                    <video
                      src={popupContent.video_url}
                      controls
                      className="w-full h-auto"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                <p
                  className="text-sm mb-4 break-words overflow-hidden"
                  style={{ color: popupContent.text_color || '#000000' }}
                >
                  {popupContent.description}
                </p>

                <Button
                  className="w-full"
                  onClick={handleButtonClick}
                  style={{
                    backgroundColor: popupContent.button_color || '#6D28D9',
                    color: popupContent.button_text_color || '#FFFFFF',
                    borderRadius: popupContent.button_radius || '0.375rem',
                    padding: popupContent.button_padding || '0.5rem 1rem',
                    fontWeight: popupContent.button_font_weight || '500'
                  }}
                >
                  {popupContent.button_text}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default RedirectPage;
