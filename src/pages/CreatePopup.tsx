
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { LinkIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PopupPreview } from "@/components/PopupPreview";

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
  const [buttonUrl, setButtonUrl] = useState("");
  const [logoText, setLogoText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLink = {
      id: Date.now().toString(),
      name: adName,
      shortUrl: `https://rite.ly/r/${Math.random().toString(36).substr(2, 8)}`,
      originalUrl,
      clicks: 0,
      createdAt: new Date().toISOString(),
      popup: {
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
      }
    };

    // Save to localStorage
    const existingLinks = JSON.parse(localStorage.getItem("userLinks") || "[]");
    existingLinks.push(newLink);
    localStorage.setItem("userLinks", JSON.stringify(existingLinks));

    toast({
      title: "Popup link created!",
      description: "Your link is ready to share",
    });

    navigate("/dashboard");
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

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Create Popup Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PopupPreview data={previewData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePopup;
