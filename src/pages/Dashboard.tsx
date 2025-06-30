
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LinkIcon, Plus, BarChart3, Eye, Copy, Trash2, ExternalLink, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PopupLink {
  id: string;
  name: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<PopupLink[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));

    const userLinks = localStorage.getItem("userLinks");
    if (userLinks) {
      setLinks(JSON.parse(userLinks));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const deleteLink = (id: string) => {
    const updatedLinks = links.filter(link => link.id !== id);
    setLinks(updatedLinks);
    localStorage.setItem("userLinks", JSON.stringify(updatedLinks));
    toast({
      title: "Link deleted",
      description: "Your popup link has been deleted",
    });
  };

  if (!user) return null;

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
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
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gray-50/50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-900">Your Popup Links</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {links.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <LinkIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No links created yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Create your first popup link to start monetizing your traffic and tracking performance
                </p>
                <Link to="/create-popup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6">
                    Create Your First Link
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {links.map((link, index) => (
                  <div key={link.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{link.name}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <LinkIcon className="h-3 w-3" />
                            <span className="font-mono">{link.shortUrl}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-xs">{link.originalUrl}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 ml-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{link.clicks}</div>
                          <div className="text-xs text-gray-500">clicks</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(link.shortUrl)}
                            className="hover:bg-purple-50 hover:border-purple-200"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLink(link.id)}
                            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
