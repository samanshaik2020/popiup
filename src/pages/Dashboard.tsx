
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LinkIcon, Plus, BarChart3, Eye, Copy, Trash2, ExternalLink, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getShortLinks, deleteShortLink } from "@/lib/supabase";

interface PopupLink {
  id: string;
  user_id: string;
  popup_id: string | null;
  slug: string;
  destination_url: string; // Changed from target_url to match database schema
  title: string; // Changed from name to match database schema
  description: string;
  active: boolean;
  clicks?: number; // Making this optional as it might be calculated
  created_at: string;
  updated_at: string;
  popups: {
    id: string;
    name: string;
    content: any;
  } | null;
}

const Dashboard = () => {
  const [links, setLinks] = useState<PopupLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const shortLinks = await getShortLinks(user.id);
        setLinks(shortLinks);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching links:', err);
        setError(err.message || 'Failed to load your links');
        toast({
          title: 'Error',
          description: 'Failed to load your links',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [user, toast]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const deleteLink = async (id: string) => {
    try {
      await deleteShortLink(id);
      const updatedLinks = links.filter(link => link.id !== id);
      setLinks(updatedLinks);
      toast({
        title: "Link deleted",
        description: "Your link has been deleted",
      });
    } catch (err: any) {
      console.error('Error deleting link:', err);
      toast({
        title: "Error",
        description: "Failed to delete the link",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const avgCtr = links.length > 0 ? (totalClicks / links.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <LinkIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Rite.ly</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              <span className="font-medium">{user.email}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} className="font-medium">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Monitor your link performance and create new campaigns</p>
          </div>
          <Link to="/create-popup">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Create New Link
            </Button>
          </Link>
        </div>
        

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-lg text-gray-600">Loading your links...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            <p className="font-medium">Failed to load your links</p>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Links</CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <LinkIcon className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{links.length}</div>
                  <p className="text-xs text-green-600 font-medium">Active campaigns</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Clicks</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{totalClicks}</div>
                  <p className="text-xs text-blue-600 font-medium">All time clicks</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg. Clicks</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{avgCtr}</div>
                  <p className="text-xs text-green-600 font-medium">Per link</p>
                </CardContent>
              </Card>
            </div>

            {/* Links Table */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Your Links</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Short URL</th>
                        <th className="px-6 py-3 text-left">Original URL</th>
                        <th className="px-6 py-3 text-center">Clicks</th>
                        <th className="px-6 py-3 text-center">Created</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {links.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <LinkIcon className="h-12 w-12 text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-1">No links yet</h3>
                              <p className="text-gray-500 mb-4">Create your first popup link to start monetizing</p>
                              <Link to="/create-popup">
                                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-200">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create New Link
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        links.map(link => (
                          <tr key={link.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                                  {(link.title || link.slug).charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{link.title || link.slug}</div>
                                  <div className="text-sm text-gray-500">ID: {link.id.slice(0, 8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="font-mono">{`${window.location.origin}/r/${link.slug}`}</span>
                                <button 
                                  onClick={() => copyToClipboard(`${window.location.origin}/r/${link.slug}`)}
                                  className="ml-2 text-gray-400 hover:text-gray-600"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-xs truncate">
                                <a href={link.destination_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center">
                                  {link.destination_url}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-medium text-gray-900">{link.clicks || 0}</div>
                              <div className="text-xs text-gray-500 flex items-center justify-center">
                                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                <span>Active</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{new Date(link.created_at).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500 flex items-center justify-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{new Date(link.created_at).toLocaleTimeString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">
                                  <BarChart3 className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => navigate(`/edit-popup/${link.popup_id}`)}
                                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                  title="Edit popup link"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => deleteLink(link.id)}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
