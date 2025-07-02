
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PopupPreviewProps {
  data: {
    type: string;
    placement: string;
    delay: number;
    ctaName: string;
    ctaDescription: string;
    ctaProfileUrl: string;
    ctaProfileImageUrl?: string;
    buttonText: string;
    buttonUrl: string;
    logoText: string;
    logoUrl: string;
    imageUrl?: string;
    template?: string;
    backgroundColor?: string;
    textColor?: string;
    popupWidth?: string;
    popupHeight?: string;
  };
}

export const PopupPreview = ({ data }: PopupPreviewProps) => {
  const getPlacementStyles = () => {
    switch (data.placement) {
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
      default:
        return "top-4 left-1/2 transform -translate-x-1/2";
    }
  };

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "600px", position: "sticky", top: "1rem" }}>
      {/* Simulated webpage background */}
      <div className="p-6 bg-white h-full">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      {/* Popup Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <Card 
          className={`absolute max-w-sm mx-4 ${getPlacementStyles()} animate-fade-in`}
          style={{
            width: data.popupWidth || 'auto',
            height: data.popupHeight || 'auto',
            backgroundColor: data.backgroundColor || '#ffffff',
            color: data.textColor || '#000000'
          }}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {/* Logo section with text or image */}
                {(data.logoText || data.logoUrl) && (
                  <div className="flex items-center mb-2">
                    {data.logoUrl && (
                      <img 
                        src={data.logoUrl} 
                        alt="Logo" 
                        className="h-6 mr-2 object-contain"
                      />
                    )}
                    {data.logoText && (
                      <div className="text-sm font-medium" style={{ color: data.textColor || '#000000' }}>
                        {data.logoText}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Profile template with image */}
                {data.template === 'profile' && data.ctaProfileImageUrl && (
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      <img 
                        src={data.ctaProfileImageUrl} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      {data.ctaName && (
                        <h3 className="font-semibold" style={{ color: data.textColor || '#000000' }}>
                          {data.ctaName}
                        </h3>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Image template */}
                {data.template === 'image' && data.imageUrl && (
                  <div className="mb-3">
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={data.imageUrl} 
                        alt="Popup Image" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
                
                {/* Standard template or when no profile image is set */}
                {(data.template !== 'profile' || !data.ctaProfileImageUrl) && data.ctaName && data.template !== 'image' && (
                  <h3 className="font-semibold mb-2" style={{ color: data.textColor || '#000000' }}>
                    {data.ctaName}
                  </h3>
                )}
                
                {data.ctaDescription && (
                  <p className="text-sm mb-4 break-words overflow-hidden" style={{ color: data.textColor || '#000000' }}>
                    {data.ctaDescription}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {data.buttonText && (
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {data.buttonText}
              </Button>
            )}
            
            <div className="text-xs text-gray-500 mt-3 text-center">
              Will show after {parseInt(data.delay.toString()) || 0} seconds
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
