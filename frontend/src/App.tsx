import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Route, Routes, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster as Sonner, toast } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { CreateTestimonial } from "./pages/CreateTestimonial";
import BatchProcess from "./pages/BatchProcess";
import WallOfLove from "./pages/WallOfLove";
import HistoryPage from "./pages/HistoryPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import { AuthInitializer } from "./components/AuthInitializer";
import { SessionValidator } from "./components/SessionValidator";
import { SingleTabEnforcer } from "./components/SingleTabEnforcer";
import { useAuthStore } from "./store/authStore";

import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner closeButton position="top-right" />
          <SessionValidator />
          <AuthInitializer />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout><Outlet /></Layout>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create" element={<CreateTestimonial />} />
                <Route path="/batch" element={<BatchProcess />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/wall" element={<WallOfLove />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
