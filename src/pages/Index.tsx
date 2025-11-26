
import { Link } from "react-router-dom";
import {
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  LineChart,
  UserPlus,
  Globe,
  Link as LinkIcon,
  Megaphone,
  Share2,
  Server,
  Shield
} from "lucide-react";

const Index = () => {
  return (
    <div className="font-sans bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary antialiased min-h-screen">
      <div className="relative overflow-hidden">
        <header className="absolute inset-x-0 top-0 z-10">
          <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="bg-primary text-white rounded-lg p-2 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </span>
              <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Popiup</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Features</a>
              <a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Pricing</a>
              <a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Solutions</a>
              <a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Company</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors">Log In</Link>
              <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-opacity-90 transition-opacity">Get Started</Link>
            </div>
          </nav>
        </header>
        <main>
          <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 bg-background-light dark:bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-background-light dark:from-blue-950/20 dark:to-background-dark"></div>
            <div className="container mx-auto px-6 text-center relative z-10">
              <div className="inline-flex items-center space-x-2 bg-blue-100/50 dark:bg-blue-900/30 text-primary dark:text-accent px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                <span>Precision. Performance. Profit.</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-text-light-primary dark:text-text-dark-primary leading-tight">
                Optimize Every Click. <br />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Drive Data-Driven Results.</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-text-light-secondary dark:text-text-dark-secondary">
                Transform raw clicks into actionable intelligence. Our platform empowers marketers with the tools to track, analyze, and optimize every link's journey for maximum ROI.
              </p>

            </div>
          </section>
          <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
            <div className="container mx-auto px-6">
              <div className="flex justify-center items-center flex-wrap gap-x-8 md:gap-x-12 gap-y-4 text-gray-500 dark:text-gray-400">
                <span className="font-medium text-sm">Salesforce</span>
                <span className="font-medium text-sm">Google Analytics</span>
                <span className="font-medium text-sm">HubSpot</span>
                <span className="font-medium text-sm">Tableau</span>
              </div>
            </div>
          </section>
          <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-text-light-primary dark:text-text-dark-primary">
                  Your Data, Visualized. Your Performance, Amplified.
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-light-secondary dark:text-text-dark-secondary">
                  Gain comprehensive insights into your link performance with a glance.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-primary dark:text-accent mb-3">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-primary dark:text-accent">10.3M</p>
                  <p className="mt-1 text-text-light-secondary dark:text-text-dark-secondary text-sm">Total Clicks</p>
                  <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md mt-4 flex items-end overflow-hidden">
                    <div className="w-1/4 h-2/3 bg-accent opacity-70"></div>
                    <div className="w-1/4 h-1/2 bg-accent opacity-70"></div>
                    <div className="w-1/4 h-3/4 bg-accent opacity-70"></div>
                    <div className="w-1/4 h-1/3 bg-accent opacity-70"></div>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-primary dark:text-accent mb-3">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-primary dark:text-accent">25.7%</p>
                  <p className="mt-1 text-text-light-secondary dark:text-text-dark-secondary text-sm">Conversion Rate</p>
                  <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md mt-4 flex items-end overflow-hidden">
                    <div className="w-full h-full flex justify-between items-end gap-1 px-1 py-1">
                      <div className="w-1/5 h-2/3 bg-blue-500 dark:bg-blue-600 rounded-sm"></div>
                      <div className="w-1/5 h-1/2 bg-blue-500 dark:bg-blue-600 rounded-sm"></div>
                      <div className="w-1/5 h-1/3 bg-blue-500 dark:bg-blue-600 rounded-sm"></div>
                      <div className="w-1/5 h-1/4 bg-blue-500 dark:bg-blue-600 rounded-sm"></div>
                      <div className="w-1/5 h-1/5 bg-blue-500 dark:bg-blue-600 rounded-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-primary dark:text-accent mb-3">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-primary dark:text-accent">150K+</p>
                  <p className="mt-1 text-text-light-secondary dark:text-text-dark-secondary text-sm">New Leads Generated</p>
                  <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md mt-4 flex items-end overflow-hidden">
                    <div className="w-full h-full flex items-end px-1">
                      <div className="w-1/6 h-1/3 bg-accent rounded-t-sm"></div>
                      <div className="w-1/6 h-2/3 bg-accent rounded-t-sm"></div>
                      <div className="w-1/6 h-1/2 bg-accent rounded-t-sm"></div>
                      <div className="w-1/6 h-3/4 bg-accent rounded-t-sm"></div>
                      <div className="w-1/6 h-full bg-accent rounded-t-sm"></div>
                      <div className="w-1/6 h-2/5 bg-accent rounded-t-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-primary dark:text-accent mb-3">
                    <Globe className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-primary dark:text-accent">Global Reach</p>
                  <p className="mt-1 text-text-light-secondary dark:text-text-dark-secondary text-sm">Top 5 Countries by Clicks</p>
                  <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md mt-4 p-2">
                    <ul className="text-xs text-text-light-secondary dark:text-text-dark-secondary space-y-1">
                      <li className="flex justify-between"><span>USA</span> <span className="font-medium text-primary dark:text-accent">35%</span></li>
                      <li className="flex justify-between"><span>UK</span> <span className="font-medium text-primary dark:text-accent">18%</span></li>
                      <li className="flex justify-between"><span>Germany</span> <span className="font-medium text-primary dark:text-accent">12%</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-20 md:py-28 bg-background-light dark:bg-background-dark">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-text-light-primary dark:text-text-dark-primary">
                Comprehensive Tools for the <span className="text-primary dark:text-accent">Analytical Marketer</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-text-light-secondary dark:text-text-dark-secondary">
                From granular tracking to insightful reporting, get everything you need to make informed decisions.
              </p>
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent mb-4">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Precision Link Tracking</h3>
                  <p className="mt-2 text-text-light-secondary dark:text-text-dark-secondary">Monitor every click with unparalleled accuracy, capturing essential data points for detailed analysis.</p>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent mb-4">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Dynamic Campaign Attribution</h3>
                  <p className="mt-2 text-text-light-secondary dark:text-text-dark-secondary">Attribute conversions accurately to specific campaigns, channels, and even individual links.</p>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent mb-4">
                    <LineChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Real-time Performance Dashboards</h3>
                  <p className="mt-2 text-text-light-secondary dark:text-text-dark-secondary">Access intuitive dashboards showing key metrics, trends, and opportunities for optimization.</p>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent mb-4">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">A/B Testing & Redirection Rules</h3>
                  <p className="mt-2 text-text-light-secondary dark:text-text-dark-secondary">Test different landing pages and optimize routing based on user demographics or behavior.</p>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent mb-4">
                    <Server className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Robust API for Integrations</h3>
                  <p className="mt-2 text-text-light-secondary dark:text-text-dark-secondary">Seamlessly connect with your existing CRM, analytics tools, and marketing automation platforms.</p>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent mb-4">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Enterprise-Grade Data Security</h3>
                  <p className="mt-2 text-text-light-secondary dark:text-text-dark-secondary">Protect your valuable marketing data with advanced encryption and compliance standards.</p>
                </div>
              </div>
            </div>
          </section>
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-6">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-12 md:p-20 text-center">
                <h2 className="text-4xl md:text-5xl font-bold">Ready to Elevate Your Marketing Performance?</h2>
                <p className="mt-4 max-w-xl mx-auto text-lg text-gray-300">Join thousands of data-driven marketers who are achieving measurable growth with Popiup.</p>
                <div className="mt-10">
                  <a className="bg-accent text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-opacity-90 transition-colors" href="#">
                    Explore Advanced Analytics
                  </a>
                  <p className="mt-4 text-sm text-gray-400">Request a demo or start your free trial today.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="bg-card-light dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2">
                <Link to="/" className="flex items-center space-x-2">
                  <span className="bg-primary text-white rounded-lg p-2 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </span>
                  <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Popiup</span>
                </Link>
                <p className="mt-4 max-w-xs text-text-light-secondary dark:text-text-dark-secondary">
                  The definitive link intelligence platform for modern data-driven marketers.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-text-light-primary dark:text-text-dark-primary">Product</h4>
                <ul className="mt-4 space-y-3">
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Features</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Pricing</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Integrations</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Enterprise</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-text-light-primary dark:text-text-dark-primary">Resources</h4>
                <ul className="mt-4 space-y-3">
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Blog</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Case Studies</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Help Center</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-text-light-primary dark:text-text-dark-primary">Company</h4>
                <ul className="mt-4 space-y-3">
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">About</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Careers</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Legal</a></li>
                  <li><a className="text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-accent transition-colors" href="#">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <p>© 2024 Popiup. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a className="hover:text-primary dark:hover:text-accent transition-colors" href="#">Privacy</a>
                <a className="hover:text-primary dark:hover:text-accent transition-colors" href="#">Terms</a>
                <a className="hover:text-primary dark:hover:text-accent transition-colors" href="#">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
