
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Link as LinkIcon, Eye, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center space-x-2">
          <LinkIcon className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">Rite.ly</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn every link into a
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              {" "}conversion tool
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create short links with customizable popup ads. Monetize your traffic 
            while providing value to your audience.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4">
              Try It Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <LinkIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>1. Shorten Your Link</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Paste any URL and we'll create a short, branded link for you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>2. Customize Popup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Design your popup ad with text, images, or videos. Choose placement and timing.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>3. Share & Earn</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Share your link and track performance. Every click is an opportunity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to monetize your links?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of marketers who are already earning with Rite.ly
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <LinkIcon className="h-6 w-6" />
            <span className="text-xl font-bold">Rite.ly</span>
          </div>
          <p className="text-gray-400">
            © 2024 Rite.ly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
