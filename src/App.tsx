
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePopup from "./pages/CreatePopup";
import EditPopup from "./pages/EditPopup";
import RedirectPage from "./pages/RedirectPage";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Define all specific routes first */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-popup" element={
              <ProtectedRoute>
                <CreatePopup />
              </ProtectedRoute>
            } />
            <Route path="/edit-popup/:id" element={
              <ProtectedRoute>
                <EditPopup />
              </ProtectedRoute>
            } />
            {/* Support the /r/:slug format for backward compatibility */}
            <Route path="/r/:slug" element={<RedirectPage />} />
            
            {/* This is the catch-all slug route for direct domain URLs */}
            <Route path="/:slug" element={<RedirectPage />} />
            
            {/* This is the 404 catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
