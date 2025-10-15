
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LinkIcon, Plus, BarChart3, Eye, Copy, Trash2, ExternalLink, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getShortLinks, deleteShortLink, getClickStats } from "@/lib/supabase";

interface PopupLink {
  id: string;
  user_id: string;
  popup_id: string | null;
  slug: string;
  destination_url: string; // Changed from target_url to match database schema
  title: string; // Changed from name to match database schema
  description: string;
  active: boolean;
  clicks?: number; // Calculated from analytics table
  created_at: string;
  updated_at: string;
  popups: {
    id: string;
    name: string;
    content: any;
  } | null;
}

interface ClickStats {
  totalClicks: number;
  avgClicksPerLink: number;
  clicksByLink: Record<string, number>;
}

const Dashboard = () => {
  const [links, setLinks] = useState<PopupLink[]>([]);
  const [clickStats, setClickStats] = useState<ClickStats>({
    totalClicks: 0,
    avgClicksPerLink: 0,
    clicksByLink: {}
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch links and analytics in parallel
        const [shortLinks, stats] = await Promise.all([
          getShortLinks(user.id),
          getClickStats(user.id)
        ]);
        
        // Merge click counts into links
        const linksWithClicks = shortLinks.map(link => ({
          ...link,
          clicks: stats.clicksByLink[link.id] || 0
        }));
        
        setLinks(linksWithClicks);
        setClickStats(stats);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load your data');
        toast({
          title: 'Error',
          description: 'Failed to load your data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative backdrop-blur-md bg-white/70 border-b border-white/20 px-8 py-4 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-200">
              <LinkIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">Popiup</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/40 shadow-sm">
              <span className="font-medium">{user.email}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} className="font-medium bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-200">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Monitor your link performance and create new campaigns 🚀</p>
          </div>
          <Link to="/create-popup">
            <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 rounded-xl">
              <Plus className="h-5 w-5 mr-2" />
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
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-purple-100">Total Links</CardTitle>
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <LinkIcon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{links.length}</div>
                  <p className="text-xs text-purple-200 font-medium flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Active campaigns
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-pink-100">Total Clicks</CardTitle>
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{clickStats.totalClicks}</div>
                  <p className="text-xs text-pink-200 font-medium">All time engagement 🎯</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-indigo-100">Avg. Clicks</CardTitle>
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{clickStats.avgClicksPerLink.toFixed(1)}</div>
                  <p className="text-xs text-indigo-200 font-medium">Per link performance 📈</p>
                </CardContent>
              </Card>
            </div>

            {/* Links Table */}
            <Card className="border-0 backdrop-blur-md bg-white/80 shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Your Links</CardTitle>
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
                          <tr key={link.id} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200 group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                                  {(link.title || link.slug).charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">{link.title || link.slug}</div>
                                  <div className="text-xs text-gray-500 font-mono">ID: {link.id.slice(0, 8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-lg text-purple-700">{`${window.location.origin}/r/${link.slug}`}</span>
                                <button 
                                  onClick={() => copyToClipboard(`${window.location.origin}/r/${link.slug}`)}
                                  className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-all duration-200"
                                  title="Copy link"
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
                                <button className="p-2 text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-200 transform hover:scale-110" title="Analytics">
                                  <BarChart3 className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => navigate(`/edit-popup/${link.popup_id}`)}
                                  className="p-2 text-green-600 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Edit popup link"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => deleteLink(link.id)}
                                  className="p-2 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Delete link"
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
