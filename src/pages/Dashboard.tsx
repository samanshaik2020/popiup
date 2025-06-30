
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LinkIcon, Plus, BarChart3, Eye, Copy, Trash2 } from "lucide-react";
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

    // Load user's links from localStorage
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Rite.ly</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your popup links and track performance</p>
            </div>
            <Link to="/create-popup">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Popup Link
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{links.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {links.reduce((sum, link) => sum + link.clicks, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {links.length > 0 ? Math.round((links.reduce((sum, link) => sum + link.clicks, 0) / links.length) * 100) / 100 : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Popup Links</CardTitle>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
                  <p className="text-gray-600 mb-4">Create your first popup link to get started</p>
                  <Link to="/create-popup">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Create Your First Link
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{link.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{link.shortUrl}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(link.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{link.clicks}</div>
                          <div className="text-xs text-gray-500">Clicks</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(link.shortUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLink(link.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
};

export default Dashboard;
