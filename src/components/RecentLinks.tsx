import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Copy, LinkIcon, Edit, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getShortLinks } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface RecentLinksProps {
  maxItems?: number;
  showEditOptions?: boolean;
  onEditLink?: (linkId: string) => void;
  currentLinkId?: string | null;
}

export function RecentLinks({ 
  maxItems = 5, 
  showEditOptions = true,
  onEditLink,
  currentLinkId = null
}: RecentLinksProps) {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getShortLinks(user.id);
        setLinks(data.slice(0, maxItems));
      } catch (error) {
        console.error("Error fetching links:", error);
        toast({
          title: "Error loading links",
          description: "Failed to load your recent links",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLinks();
  }, [user, maxItems, toast]);
  
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard"
    });
  };
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Your Recent Links</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/dashboard")} 
          className="text-sm"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-3">
              {links.map((link) => (
                <div 
                  key={link.id} 
                  className={`p-3 border rounded-md hover:bg-gray-50 ${link.id === currentLinkId ? 'border-purple-400 bg-purple-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{link.title || "Unnamed Link"}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1 truncate">
                    {link.destination_url}
                  </p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {`${window.location.origin}/r/${link.slug}`}
                    </code>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(`${window.location.origin}/r/${link.slug}`)}
                        title="Copy link"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {showEditOptions && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            if (onEditLink) {
                              onEditLink(link.id);
                            } else {
                              navigate(`/edit-popup/${link.id}`);
                            }
                          }}
                          title="Edit link"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(`${window.location.origin}/r/${link.slug}`, '_blank')}
                        title="Open link"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">
              <p>No links created yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
