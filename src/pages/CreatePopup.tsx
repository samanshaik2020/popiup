
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { LinkIcon, ArrowLeft, Copy, ExternalLink, Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PopupPreview } from "@/components/PopupPreview";
import { RecentLinks } from "@/components/RecentLinks";
import { createPopup, createShortLink, uploadFile } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const CreatePopup = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [adName, setAdName] = useState("");
  const [popupType, setPopupType] = useState("text");
  const [placement, setPlacement] = useState("top");
  const [delay, setDelay] = useState("3");
  const [template, setTemplate] = useState("standard");
  const [ctaName, setCtaName] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");
  const [ctaProfileUrl, setCtaProfileUrl] = useState("");
  const [ctaProfileImage, setCtaProfileImage] = useState<File | null>(null);
  const [ctaProfileImageUrl, setCtaProfileImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("Learn More");
  const [buttonUrl, setButtonUrl] = useState("");  // No default URL
  const [logoText, setLogoText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");  // No default URL
  
  // Image and Video States
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Custom Styling States
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [popupWidth, setPopupWidth] = useState("400px");
  const [popupHeight, setPopupHeight] = useState("auto");
  
  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Handle file upload
  const handleFileUpload = async (file: File, fileType: 'logo' | 'image' | 'profile' = 'logo') => {
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10); // Start progress
      
      // Create a unique file name using timestamp and random string
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `uploads/${user.id}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const result = await uploadFile(file, filePath, (progress) => {
        setUploadProgress(progress);
      });
      
      // Use the public URL from the result
      const url = result.publicUrl;
      
      // Set the URL based on file type
      switch (fileType) {
        case 'logo':
          setLogoUrl(url);
          setUploadedFile(file);
          break;
        case 'image':
          setImageUrl(url);
          setImageFile(file);
          break;
        case 'profile':
          setCtaProfileImageUrl(url);
          setCtaProfileImage(file);
          break;
      }
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });
      
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
      
      // Create popup content as JSON string - using field names that match RedirectPage expectations
      const popupContent = JSON.stringify({
        type: popupType,
        placement,
        delay_seconds: parseInt(delay),
        profile_name: ctaName,
        description: ctaDescription,
        profile_url: ctaProfileUrl,
        profile_image_url: ctaProfileImageUrl, // Add the profile image URL
        button_text: buttonText,
        button_link: buttonUrl,
        logo_text: logoText,
        logo_url: logoUrl,
        image_url: imageUrl, // Add the main image URL
        template: popupType === 'image' ? 'image' : ctaProfileImageUrl ? 'profile' : 'standard', // Set template based on content
      });
      
      // Debug the content being saved
      console.log('Saving popup with content:', {
        imageUrl,
        ctaProfileImageUrl,
        popupType,
        template: popupType === 'image' ? 'image' : ctaProfileImageUrl ? 'profile' : 'standard'
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

  // Prepare preview data with correct template handling
  const previewData = {
    type: popupType,
    placement,
    delay: parseInt(delay) || 0,
    ctaName,
    ctaDescription,
    ctaProfileUrl,
    ctaProfileImageUrl,
    buttonText,
    buttonUrl,
    logoText,
    logoUrl,
    imageUrl,
    // Make sure template is set correctly based on popup type
    template: popupType === 'image' ? 'image' : 
              ctaProfileImageUrl ? 'profile' : 'standard',
  };
  
  // Debug the preview data
  console.log('Preview data:', previewData);

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
              <CardContent className="max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="adName">Popup Name</Label>
                    <Input
                      id="adName"
                      placeholder="Name your popup"
                      value={adName}
                      onChange={(e) => setAdName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="originalUrl">Destination URL</Label>
                    <Input
                      id="originalUrl"
                      placeholder="https://yourwebsite.com"
                      type="url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      required
                    />
                  </div>

                  {/* Popup Type */}
                  {/* Template Selection */}
                  <div>
                    <Label>Choose a Template</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${template === "standard" ? "border-purple-500 bg-purple-50" : ""}`}
                        onClick={() => setTemplate("standard")}
                      >
                        <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500">Standard</div>
                        <p className="text-xs font-medium">Basic popup with text and CTA</p>
                      </div>
                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${template === "newsletter" ? "border-purple-500 bg-purple-50" : ""}`}
                        onClick={() => setTemplate("newsletter")}
                      >
                        <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500">Newsletter</div>
                        <p className="text-xs font-medium">Email signup form</p>
                      </div>
                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${template === "promotion" ? "border-purple-500 bg-purple-50" : ""}`}
                        onClick={() => setTemplate("promotion")}
                      >
                        <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500">Promotion</div>
                        <p className="text-xs font-medium">Sale or offer popup</p>
                      </div>
                    </div>
                  </div>

                  {/* Popup Type */}
                  <div>
                    <Label>Popup Type</Label>
                    <RadioGroup
                      value={popupType}
                      onValueChange={setPopupType}
                      className="flex flex-col space-y-2 mt-2"
                    >
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
                    
                    {popupType === "image" && (
                      <div className="mt-4">
                        <Label htmlFor="imageUpload">Upload Image</Label>
                        <div className="flex items-center gap-4 mt-1">
                          <Input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                try {
                                  setIsUploading(true);
                                  const filePath = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${file.name.split('.').pop()}`;
                                  const result = await uploadFile(file, filePath, (progress) => setUploadProgress(progress));
                                  setImageUrl(result.publicUrl);
                                  toast({
                                    title: "Upload complete",
                                    description: "Image has been uploaded"
                                  });
                                } catch (error: any) {
                                  toast({
                                    title: "Upload failed",
                                    description: error.message,
                                    variant: "destructive"
                                  });
                                } finally {
                                  setIsUploading(false);
                                  setUploadProgress(0);
                                }
                              }
                            }}
                          />
                          {imageUrl && (
                            <div className="relative h-24 w-40 overflow-hidden border rounded">
                              <img src={imageUrl} alt="Popup content" className="h-full w-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {popupType === "video" && (
                      <div className="mt-4">
                        <Label htmlFor="videoUpload">Upload Video</Label>
                        <div className="flex items-center gap-4 mt-1">
                          <Input
                            id="videoUpload"
                            type="file"
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVideoFile(file);
                                try {
                                  setIsUploading(true);
                                  const filePath = `popup-videos/${user?.id}/${Date.now()}_${file.name}`;
                                  const result = await uploadFile(file, filePath, (progress) => setUploadProgress(progress));
                                  setVideoUrl(result.publicUrl);
                                  toast({
                                    title: "Upload complete",
                                    description: "Video has been uploaded"
                                  });
                                } catch (error: any) {
                                  toast({
                                    title: "Upload failed",
                                    description: error.message,
                                    variant: "destructive"
                                  });
                                } finally {
                                  setIsUploading(false);
                                  setUploadProgress(0);
                                }
                              }
                            }}
                          />
                          {videoUrl && (
                            <div className="relative h-24 w-40 overflow-hidden border rounded">
                              <video src={videoUrl} controls className="h-full w-full object-cover">
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                          <SelectItem value="15">15</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
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
                  <div>
                    <Label htmlFor="ctaProfileImage">Profile Image</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <Input
                        id="ctaProfileImage"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCtaProfileImage(file);
                            await handleFileUpload(file, 'profile');
                          }
                        }}
                      />
                      {ctaProfileImageUrl && (
                        <div className="relative h-12 w-12 rounded-full overflow-hidden border">
                          <img src={ctaProfileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                        </div>
                      )}
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

                  {/* Styling Options */}
                  <div>
                    <h3 className="font-medium">Styling Options</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="backgroundColor">Background Color</Label>
                        <div className="flex mt-1">
                          <input
                            type="color"
                            id="backgroundColor"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="h-9 w-9 border rounded"
                          />
                          <Input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 ml-2"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="textColor">Text Color</Label>
                        <div className="flex mt-1">
                          <input
                            type="color"
                            id="textColor"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="h-9 w-9 border rounded"
                          />
                          <Input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1 ml-2"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="popupWidth">Width</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            type="text"
                            id="popupWidth"
                            value={popupWidth}
                            onChange={(e) => setPopupWidth(e.target.value)}
                          />
                          <span className="ml-2 text-sm text-gray-500">px/%</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="popupHeight">Height</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            type="text"
                            id="popupHeight"
                            value={popupHeight}
                            onChange={(e) => setPopupHeight(e.target.value)}
                          />
                          <span className="ml-2 text-sm text-gray-500">px/%</span>
                        </div>
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
