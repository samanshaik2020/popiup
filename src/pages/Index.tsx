
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Link as LinkIcon, Eye, BarChart3, CheckCircle, Users, TrendingUp } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// CountAnimation component for animating number counting
interface CountAnimationProps {
  targetNumber: number;
  suffix?: string;
  duration?: number;
}

const CountAnimation = ({ targetNumber, suffix = "", duration = 2 }: CountAnimationProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * targetNumber));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, targetNumber, duration]);

  return <div ref={ref}>{count}{suffix}</div>;
};

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 } as any,
  },
};

// Fade-in animation for sections
const fadeInVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    } as any
  },
};

const Index = () => {
  // Scroll animation setup
  const { scrollYProgress } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Parallax effect for background elements
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  
  // Trigger animations after initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
        className="flex justify-between items-center px-8 py-6 bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50"
      >
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.div 
            className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl"
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <LinkIcon className="h-6 w-6 text-white" />
          </motion.div>
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Popiup</span>
        </motion.div>
        <motion.div 
          className="flex items-center space-x-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link to="/login">
              <Button variant="ghost" className="font-medium hover:bg-gray-100">Login</Button>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Get Started
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="px-8 py-24 text-center relative overflow-hidden"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"], 
          }}
          transition={{ 
            duration: 20, 
            ease: "linear", 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        ></motion.div>
        <div className="max-w-5xl mx-auto relative">
          <motion.div 
            className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="text-sm font-medium text-purple-700">🚀 Transform your links into revenue</span>
          </motion.div>
          
          <motion.h1 
            className="text-6xl font-bold text-gray-900 mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Turn every link into a
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"], 
              }}
              transition={{ 
                duration: 3, 
                ease: "linear", 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            >
              {" "}conversion machine
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            Create intelligent short links with customizable popup campaigns. 
            Monetize your traffic while delivering exceptional user experiences.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-4 h-14 shadow-xl hover:shadow-2xl transition-all duration-300">
                  Start Free Trial
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-14 border-2 hover:bg-gray-50">
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center space-x-8 mt-12 text-sm text-gray-500"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.2, staggerChildren: 0.2 }}
          >
            <motion.div className="flex items-center space-x-2" variants={itemVariants}>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </motion.div>
            <motion.div className="flex items-center space-x-2" variants={itemVariants}>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>14-day free trial</span>
            </motion.div>
            <motion.div className="flex items-center space-x-2" variants={itemVariants}>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="px-8 py-16 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-3 gap-8 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div className="p-8" variants={itemVariants}>
              <motion.div 
                className="text-4xl font-bold text-purple-600 mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1.5 }}
              >
                <CountAnimation targetNumber={10} suffix="M+" />
              </motion.div>
              <div className="text-gray-600 font-medium">Links Created</div>
            </motion.div>
            <motion.div className="p-8" variants={itemVariants}>
              <motion.div 
                className="text-4xl font-bold text-blue-600 mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1.5, delay: 0.2 }}
              >
                <CountAnimation targetNumber={250} suffix="K+" />
              </motion.div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </motion.div>
            <motion.div className="p-8" variants={itemVariants}>
              <motion.div 
                className="text-4xl font-bold text-indigo-600 mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1.5, delay: 0.4 }}
              >
                <CountAnimation targetNumber={98} suffix="%" />
              </motion.div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        className="px-8 py-20 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start monetizing your links and growing your business
            </p>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants}>
              <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <motion.div 
                  className="absolute -top-4 left-6"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </motion.div>
                <CardHeader className="pt-8">
                  <motion.div 
                    className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
                    whileHover={{ rotate: 15 }}
                  >
                    <LinkIcon className="h-8 w-8 text-purple-600" />
                  </motion.div>
                  <CardTitle className="text-xl">Create Short Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Paste any URL and we'll instantly create a professional, branded short link optimized for sharing.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <motion.div 
                  className="absolute -top-4 left-6"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </motion.div>
                <CardHeader className="pt-8">
                  <motion.div 
                    className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
                    whileHover={{ rotate: 15 }}
                  >
                    <Eye className="h-8 w-8 text-purple-600" />
                  </motion.div>
                  <CardTitle className="text-xl">Design Your Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Create stunning popup campaigns with our intuitive editor. Choose timing, placement, and messaging.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <motion.div 
                  className="absolute -top-4 left-6"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </motion.div>
                <CardHeader className="pt-8">
                  <motion.div 
                    className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
                    whileHover={{ rotate: 15 }}
                  >
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </motion.div>
                  <CardTitle className="text-xl">Track & Optimize</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Monitor performance with detailed analytics and optimize your campaigns for maximum conversion.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="px-8 py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInVariants}
      >
        <motion.div 
          className="absolute inset-0 bg-black/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        ></motion.div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h2 
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            Ready to transform your links?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join thousands of marketers and businesses who are already maximizing their link potential with Popiup
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 h-14 font-semibold shadow-xl">
                  Start Your Free Trial
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 h-14">
                Schedule Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="px-8 py-12 bg-gray-900 text-gray-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="flex items-center space-x-3 mb-4 md:mb-0" variants={itemVariants}>
              <motion.div 
                className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <LinkIcon className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-white">Popiup</span>
            </motion.div>
            <motion.div className="flex items-center space-x-8 text-sm" variants={itemVariants}>
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Privacy Policy
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Terms of Service
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Support
              </motion.a>
            </motion.div>
          </motion.div>
          <motion.div 
            className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            viewport={{ once: true }}
          >
            © 2024 Popiup. All rights reserved. Built for the modern marketer.
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
