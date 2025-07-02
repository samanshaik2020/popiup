import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getPopupById, getShortLinkByPopupId, updatePopup, uploadFile } from "@/lib/supabase";
import { PopupPreview } from "@/components/PopupPreview";


const EditPopup = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [popupType, setPopupType] = useState("text");
  const [position, setPosition] = useState("top");
  const [triggerType, setTriggerType] = useState("delay");
  const [triggerValue, setTriggerValue] = useState("3");
  const [template, setTemplate] = useState("standard");
  const [originalUrl, setOriginalUrl] = useState("");
  const [ctaName, setCtaName] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");
  const [buttonText, setButtonText] = useState("Learn More");
  const [buttonUrl, setButtonUrl] = useState("");
  
  // Profile image states
  const [ctaProfileImageUrl, setCtaProfileImageUrl] = useState("");
  const [ctaProfileImage, setCtaProfileImage] = useState<File | null>(null);
  
  // Media upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Enhanced styling states with separate controls
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [popupWidth, setPopupWidth] = useState("400px");
  const [popupHeight, setPopupHeight] = useState("auto");
  
  // Combined styles object for compatibility with existing code
  const styles = {
    backgroundColor,
    textColor,
    width: popupWidth,
    height: popupHeight
  };
  
  // Preview data that matches the PopupPreview component's expected props
  const previewData = {
    type: popupType,
    placement: position, // match the expected prop name
    delay: parseInt(triggerValue),
    ctaName: ctaName,
    ctaDescription: ctaDescription,
    ctaProfileUrl: ctaProfileImageUrl || "", // Use the uploaded profile image URL
    buttonText: buttonText,
    buttonUrl: buttonUrl,
    logoText: "",
    logoUrl: imageUrl || "", // Use the uploaded image URL if available
    videoUrl: videoUrl || "" // Add video URL if available
  };
  
  // Fetch popup data
  useEffect(() => {
    const fetchPopupData = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        
        // Fetch popup details
        const popupData = await getPopupById(id);
        if (!popupData) {
          toast({
            title: "Error",
            description: "Popup not found",
            variant: "destructive"
          });
          navigate("/dashboard");
          return;
        }
        
        // Check ownership
        if (popupData.user_id !== user.id) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to edit this popup",
            variant: "destructive"
          });
          navigate("/dashboard");
          return;
        }
        
        // Fetch associated short link
        const shortLinkData = await getShortLinkByPopupId(popupData.id);
        
        // Populate form fields
        setName(popupData.name || "");
        setContent(popupData.content || "");
        setPopupType(popupData.type || "text");
        setPosition(popupData.position || "top");
        setTriggerType(popupData.trigger_type || "delay");
        
        // Fix for the trigger_value type issue
        if (popupData.trigger_value) {
          if (typeof popupData.trigger_value === 'string') {
            setTriggerValue(popupData.trigger_value);
          } else if (typeof popupData.trigger_value === 'number') {
            setTriggerValue(String(popupData.trigger_value));
          } else {
            // Fallback to default
            setTriggerValue("3");
          }
        }
        
        // Set CTA fields if available
        try {
          const contentObj = JSON.parse(popupData.content);
          setCtaName(contentObj.name || "");
          setCtaDescription(contentObj.description || "");
          setButtonText(contentObj.buttonText || "Learn More");
          setButtonUrl(contentObj.buttonUrl || "");
        } catch (error) {
          // If content is not valid JSON, use it as plain text
          setContent(popupData.content);
        }
        
        // Set styles if available
        if (popupData.styles) {
          try {
            // Safely handle styles which could be a string or an object
            const stylesData = typeof popupData.styles === 'string' 
              ? JSON.parse(popupData.styles) 
              : popupData.styles;
              
            // Only spread if it's actually an object
            if (stylesData && typeof stylesData === 'object') {
              setBackgroundColor(stylesData.backgroundColor || backgroundColor);
              setTextColor(stylesData.textColor || textColor);
              setPopupWidth(stylesData.width || popupWidth);
              setPopupHeight(stylesData.height || popupHeight);
            }
          } catch (error) {
            console.error('Error parsing styles:', error);
          }
        }
        
        if (shortLinkData) {
          setOriginalUrl(shortLinkData.destination_url);
        }
      } catch (error: any) {
        console.error("Error fetching popup:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load popup data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopupData();
  }, [id, user, navigate, toast]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !user) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Create content object
      const contentObj = {
        name: ctaName,
        description: ctaDescription,
        buttonText,
        buttonUrl
      };
      
      const popupData = {
        name,
        content: JSON.stringify(contentObj),
        type: popupType,
        position,
        triggerType,
        triggerValue,
        styles: JSON.stringify({
          backgroundColor,
          textColor,
          width: popupWidth,
          height: popupHeight
        }),
      };
      
      // Update popup
      await updatePopup(id, popupData);
      
      toast({
        title: "Success",
        description: "Popup updated successfully"
      });
      
      // Navigate to dashboard after short delay
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Error updating popup:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update popup",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-10">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="grid md:grid-cols-2 gap-8">
        {loading ? (
          <div className="md:col-span-2 flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Popup</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Popup Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a name for this popup"
                      required
                    />
                  </div>
                  
                  {/* Custom Styling Controls */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Popup Styling</h3>
                    
                    {/* Background Color */}
                    <div>
                      <Label htmlFor="bgColor">Background Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="bgColor"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {/* Text Color */}
                    <div>
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {/* Popup Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="popupWidth">Width</Label>
                        <Input
                          id="popupWidth"
                          value={popupWidth}
                          onChange={(e) => setPopupWidth(e.target.value)}
                          placeholder="400px"
                        />
                      </div>
                      <div>
                        <Label htmlFor="popupHeight">Height</Label>
                        <Input
                          id="popupHeight"
                          value={popupHeight}
                          onChange={(e) => setPopupHeight(e.target.value)}
                          placeholder="auto"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Popup Settings */}
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
                  </div>
                  
                  <div>
                    <Label>Position</Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Trigger</Label>
                    <Select value={triggerType} onValueChange={setTriggerType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delay">Time Delay</SelectItem>
                        <SelectItem value="scroll">Scroll Position</SelectItem>
                        <SelectItem value="exit">Exit Intent</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {triggerType === "delay" && (
                      <div className="mt-2">
                        <Label htmlFor="delay">Delay (seconds)</Label>
                        <Input
                          id="delay"
                          type="number"
                          min="1"
                          max="60"
                          value={triggerValue}
                          onChange={(e) => setTriggerValue(e.target.value)}
                        />
                      </div>
                    )}
                    
                    {triggerType === "scroll" && (
                      <div className="mt-2">
                        <Label htmlFor="scroll">Scroll percentage</Label>
                        <Input
                          id="scroll"
                          type="number"
                          min="10"
                          max="100"
                          value={triggerValue}
                          onChange={(e) => setTriggerValue(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  
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
                  
                  <div>
                    <Label htmlFor="ctaName">Header Text</Label>
                    <Input
                      id="ctaName"
                      value={ctaName}
                      onChange={(e) => setCtaName(e.target.value)}
                      placeholder="Header text for your popup"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ctaDescription">Description</Label>
                    <Textarea
                      id="ctaDescription"
                      value={ctaDescription}
                      onChange={(e) => setCtaDescription(e.target.value)}
                      placeholder="Description for your popup"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Text to display on the button"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="buttonUrl">Button URL</Label>
                    <Input
                      id="buttonUrl"
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="URL for the button click"
                    />
                  </div>
                  
                  <div>
                    <Label>Styling Options</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="bgColor">Background Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="bgColor"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="textColor">Text Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="textColor"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="popupWidth">Width</Label>
                        <Input
                          id="popupWidth"
                          value={popupWidth}
                          onChange={(e) => setPopupWidth(e.target.value)}
                          placeholder="400px"
                        />
                      </div>
                      <div>
                        <Label htmlFor="popupHeight">Height</Label>
                        <Input
                          id="popupHeight"
                          value={popupHeight}
                          onChange={(e) => setPopupHeight(e.target.value)}
                          placeholder="auto"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PopupPreview data={previewData} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default EditPopup;
