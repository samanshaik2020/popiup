
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Link as LinkIcon, Eye, BarChart3, CheckCircle, Users, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Rite.ly</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="font-medium hover:bg-gray-100">Login</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-200">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full mb-8">
            <span className="text-sm font-medium text-purple-700">🚀 Transform your links into revenue</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Turn every link into a
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
              {" "}conversion machine
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create intelligent short links with customizable popup campaigns. 
            Monetize your traffic while delivering exceptional user experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-4 h-14 shadow-xl hover:shadow-2xl transition-all duration-300">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-14 border-2 hover:bg-gray-50">
              Watch Demo
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-4xl font-bold text-purple-600 mb-2">10M+</div>
              <div className="text-gray-600 font-medium">Links Created</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">250K+</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold text-indigo-600 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-8 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start monetizing your links and growing your business
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
              </div>
              <CardHeader className="pt-8">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <LinkIcon className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Create Short Link</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Paste any URL and we'll instantly create a professional, branded short link optimized for sharing.
                </p>
              </CardContent>
            </Card>

            <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
              </div>
              <CardHeader className="pt-8">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Design Your Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Create stunning popup campaigns with our intuitive editor. Choose timing, placement, and messaging.
                </p>
              </CardContent>
            </Card>

            <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
              </div>
              <CardHeader className="pt-8">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Track & Optimize</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Monitor performance with detailed analytics and optimize your campaigns for maximum conversion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to maximize your link performance and revenue potential
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: "Advanced Analytics", desc: "Detailed insights into clicks, conversions, and user behavior" },
              { icon: Users, title: "Audience Targeting", desc: "Show personalized content based on visitor location and device" },
              { icon: CheckCircle, title: "A/B Testing", desc: "Test different popup designs to optimize your conversion rates" },
              { icon: TrendingUp, title: "Real-time Tracking", desc: "Monitor your campaign performance as it happens" },
              { icon: Eye, title: "Custom Branding", desc: "Maintain your brand identity across all popup campaigns" },
              { icon: LinkIcon, title: "Bulk Management", desc: "Create and manage hundreds of links with ease" }
            ].map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-200">
                <feature.icon className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your links?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of marketers and businesses who are already maximizing their link potential with Rite.ly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 h-14 font-semibold shadow-xl">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 h-14">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Rite.ly</span>
            </div>
            <div className="flex items-center space-x-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © 2024 Rite.ly. All rights reserved. Built for the modern marketer.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
