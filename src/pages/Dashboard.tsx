
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LinkIcon, Plus, BarChart3, Eye, Copy, Trash2, ExternalLink, Calendar, TrendingUp, Loader2, Settings, LogOut, Zap, MousePointerClick, Activity } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen backdrop-blur-xl bg-white/60 border-r border-white/20 shadow-2xl p-6 flex flex-col">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-xl shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">Popiup</span>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-200/50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                <p className="text-xs text-gray-500">Pro Account</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg font-medium">
              <Activity className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <Link to="/create-popup" className="w-full">
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/60 rounded-xl transition-all duration-200">
                <Plus className="h-5 w-5" />
                <span>Create Link</span>
              </button>
            </Link>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/60 rounded-xl transition-all duration-200">
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/60 rounded-xl transition-all duration-200">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Logout */}
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 mt-4">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600 text-lg">Here's what's happening with your links today</p>
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
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
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

            {/* Create New Link Card */}
            <Link to="/create-popup">
              <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center h-full p-6">
                  <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-3">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Create New Link</p>
                  <p className="text-xs text-gray-500 mt-1">Start a new campaign</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Links Grid */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Links</h2>
              <span className="text-sm text-gray-500">{links.length} total links</span>
            </div>

            {links.length === 0 ? (
              <Card className="border-0 backdrop-blur-md bg-white/80 shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                    <LinkIcon className="h-16 w-16 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No links yet</h3>
                  <p className="text-gray-500 mb-6 text-center max-w-md">Create your first popup link to start monetizing your content and tracking engagement</p>
                  <Link to="/create-popup">
                    <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 rounded-xl">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Link
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {links.map(link => (
                  <Card key={link.id} className="border-0 backdrop-blur-md bg-white/80 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b border-purple-100/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                            {(link.title || link.slug).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">{link.title || link.slug}</CardTitle>
                            <CardDescription className="font-mono text-xs">ID: {link.id.slice(0, 8)}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/edit-popup/${link.popup_id}`)}
                            className="p-2 text-green-600 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Edit"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteLink(link.id)}
                            className="p-2 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {/* Short URL */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Short URL</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex-1 font-mono text-sm bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-lg text-purple-700 truncate">
                            {`${window.location.origin}/r/${link.slug}`}
                          </span>
                          <button 
                            onClick={() => copyToClipboard(`${window.location.origin}/r/${link.slug}`)}
                            className="p-2 text-purple-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Copy link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Destination URL */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destination</label>
                        <a href={link.destination_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 truncate">
                          <span className="truncate">{link.destination_url}</span>
                          <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MousePointerClick className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Clicks</p>
                              <p className="text-lg font-bold text-gray-900">{link.clicks || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Created</p>
                              <p className="text-sm font-medium text-gray-900">{new Date(link.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <button className="p-3 text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg" title="View Analytics">
                          <BarChart3 className="h-5 w-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          </>
        )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
