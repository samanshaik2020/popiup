
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { LinkIcon, ArrowLeft, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PopupPreview } from "@/components/PopupPreview";
import { RecentLinks } from "@/components/RecentLinks";
import { createPopup, createShortLink } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const CreatePopup = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [adName, setAdName] = useState("");
  const [popupType, setPopupType] = useState("text");
  const [placement, setPlacement] = useState("top");
  const [delay, setDelay] = useState("3");
  const [ctaName, setCtaName] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");
  const [ctaProfileUrl, setCtaProfileUrl] = useState("");
  const [buttonText, setButtonText] = useState("Learn More");
  const [buttonUrl, setButtonUrl] = useState("");  // No default URL
  const [logoText, setLogoText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");  // No default URL
  
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    id: string;
    slug: string;
    fullUrl: string;
  } | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a popup",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Generate a random slug
      const slug = Math.random().toString(36).substring(2, 10);
      
      // Create popup content as JSON string
      const popupContent = JSON.stringify({
        type: popupType,
        placement,
        delay: parseInt(delay),
        ctaName,
        ctaDescription,
        ctaProfileUrl,
        buttonText,
        buttonUrl,
        logoText,
        logoUrl,
      });
      
      // First create the popup
      const popup = await createPopup({
        user_id: user.id,
        name: adName,
        content: popupContent,
        type: popupType,
        position: placement,
        trigger_type: "delay",
        trigger_value: parseInt(delay),
        active: true
      });
      
      // Then create the short link associated with this popup
      const shortLink = await createShortLink({
        user_id: user.id,
        popup_id: popup.id,
        slug,
        destination_url: originalUrl,
        title: adName,
        description: ctaDescription || null,
        active: true
      });
      
      // Set the generated link to display in UI
      setGeneratedLink({
        id: shortLink.id,
        slug: shortLink.slug,
        fullUrl: `${window.location.origin}/r/${shortLink.slug}`
      });
      
      toast({
        title: "Popup link created!",
        description: "Your link is ready to share",
      });
      
      // We no longer navigate to dashboard - keep user on this page
    } catch (error: any) {
      console.error("Error creating popup:", error);
      toast({
        title: "Error creating link",
        description: error.message || "Failed to create popup link",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewData = {
    type: popupType,
    placement,
    delay: parseInt(delay),
    ctaName,
    ctaDescription,
    ctaProfileUrl,
    buttonText,
    buttonUrl,
    logoText,
    logoUrl,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">Create Popup Link</span>
          </div>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Popup Link Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="originalUrl">Destination URL</Label>
                      <Input
                        id="originalUrl"
                        type="url"
                        placeholder="https://example.com"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adName">Ad Name</Label>
                      <Input
                        id="adName"
                        placeholder="My Campaign"
                        value={adName}
                        onChange={(e) => setAdName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Popup Type */}
                  <div>
                    <Label>Popup Type</Label>
                    <RadioGroup value={popupType} onValueChange={setPopupType} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="text" />
                        <Label htmlFor="text">Text</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="image" />
                        <Label htmlFor="image">Image</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="video" />
                        <Label htmlFor="video">Video</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Placement & Timing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="placement">Placement</Label>
                      <Select value={placement} onValueChange={setPlacement}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="delay">Delay (seconds)</Label>
                      <Select value={delay} onValueChange={setDelay}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* CTA Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium">CTA Settings</h3>
                    <div>
                      <Label htmlFor="ctaName">Name</Label>
                      <Input
                        id="ctaName"
                        placeholder="Your Name"
                        value={ctaName}
                        onChange={(e) => setCtaName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaDescription">Description</Label>
                      <Textarea
                        id="ctaDescription"
                        placeholder="Brief description of your offer..."
                        value={ctaDescription}
                        onChange={(e) => setCtaDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaProfileUrl">Profile URL</Label>
                      <Input
                        id="ctaProfileUrl"
                        type="url"
                        placeholder="https://yourprofile.com"
                        value={ctaProfileUrl}
                        onChange={(e) => setCtaProfileUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Button Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Button Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input
                          id="buttonText"
                          placeholder="Learn More"
                          value={buttonText}
                          onChange={(e) => setButtonText(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="buttonUrl">Button URL</Label>
                        <Input
                          id="buttonUrl"
                          type="url"
                          placeholder="https://example.com"
                          value={buttonUrl}
                          onChange={(e) => setButtonUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Logo Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="logoText">Logo Text</Label>
                        <Input
                          id="logoText"
                          placeholder="Your Brand"
                          value={logoText}
                          onChange={(e) => setLogoText(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          type="url"
                          placeholder="https://example.com"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Popup Link"
                    )}
                  </Button>
                  
                  {/* Generated Link Section - Always visible once generated */}
                  {generatedLink && (
                    <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg">
                      <h3 className="text-lg font-medium text-green-800 mb-2">Your Popup Link is Ready!</h3>
                      <div className="flex items-center bg-white border rounded-md overflow-hidden">
                        <input
                          type="text"
                          value={generatedLink.fullUrl}
                          readOnly
                          className="flex-1 px-4 py-2 text-sm font-mono focus:outline-none"
                        />
                        <div className="flex">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedLink.fullUrl);
                              toast({
                                title: "Copied!",
                                description: "Link copied to clipboard"
                              });
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 border-l"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <a
                            href={generatedLink.fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 hover:bg-gray-200 border-l"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Reset form for a new popup
                            setAdName("");
                            setOriginalUrl("");
                            setGeneratedLink(null);
                          }}
                          className="flex-1"
                        >
                          Create Another
                        </Button>
                        <Button 
                          onClick={() => navigate("/dashboard")} 
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <PopupPreview data={previewData} />
                </CardContent>
              </Card>

              {/* Recent links with edit options - using the RecentLinks component */}
              <RecentLinks
                maxItems={5}
                showEditOptions={true}
                currentLinkId={generatedLink?.id || null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePopup;
