
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
    buttonText: string;
    buttonUrl: string;
    logoText: string;
    logoUrl: string;
  };
}

export const PopupPreview = ({ data }: PopupPreviewProps) => {
  const getPlacementStyles = () => {
    switch (data.placement) {
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2";
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
    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "600px" }}>
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
        <Card className={`absolute max-w-sm w-full mx-4 ${getPlacementStyles()} animate-fade-in`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {data.logoText && (
                  <div className="text-sm font-medium text-purple-600 mb-2">
                    {data.logoText}
                  </div>
                )}
                {data.ctaName && (
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {data.ctaName}
                  </h3>
                )}
                {data.ctaDescription && (
                  <p className="text-sm text-gray-600 mb-4">
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
              Will show after {data.delay} seconds
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
