import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Layers, Heart, History, Settings, Bell, Search, Moon, Sun, LogOut, User, Sparkles } from "lucide-react";
import { AIChatBubble } from "./AIChatBubble";
import { useAuthStore } from "../store/authStore";
import { useTestimonialStore } from "../store/testimonialStore";
import { useTheme } from "./ThemeProvider";
import api from "../lib/axios";
import { toast } from "sonner";
import logoIcon from "../assets/logo.png";
import mentorxLogo from "../assets/logo_transparent.png";

// Restoring the correct application features for TestimonialHub
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Batch Process", href: "/batch", icon: Layers },
  { name: "Wall of Love", href: "/wall", icon: Heart },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { step, setStep } = useTestimonialStore();
  const { theme, setTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  const isDark = theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark"));
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  
  const userEmail = user?.email || 'Guest User';
  const userInitial = userEmail.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [user?.avatar]);

  const isLoggingOut = useRef(false);

  const handleSignOut = async () => {
    try {
      isLoggingOut.current = true;
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      logout();
      window.location.replace('/');
    }
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (location.pathname === '/create' && step > 0 && href !== '/create') {
      e.preventDefault();
      if (window.confirm("You have unsaved changes. Are you sure you want to leave without exporting?")) {
        setStep(0);
        navigate(href);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 px-8 lg:px-16">
        <div className="max-w-[1600px] mx-auto h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/dashboard" onClick={(e) => handleNavClick(e, '/dashboard')} className="flex items-center gap-3 shrink-0 cursor-pointer">
             <div className="w-10 h-10 flex items-center justify-center">
                <img src={mentorxLogo} alt="MENTORX Logo" className="w-full h-full object-contain" />
             </div>
             <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">TestimonialHub</span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`flex items-center gap-2 text-[14px] font-semibold transition-colors ${
                    isActive
                      ? "text-[#00B2FF]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Actions & Profile */}
          <div className="flex items-center gap-5 shrink-0">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Toggle Theme"
             >
                {isDark ? (
                  <Sun className="w-5 h-5 cursor-pointer text-slate-300 hover:text-white transition-colors" />
                ) : (
                  <Moon className="w-5 h-5 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors" />
                )}
             </button>
             
             {/* Profile Dropdown Container */}
             <div className="relative" ref={menuRef}>
               <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)} 
                  title="Profile settings"
                  className="w-11 h-11 rounded-full bg-[#EBF8FF] dark:bg-blue-900/30 text-[#00B2FF] flex items-center justify-center font-bold text-base hover:opacity-80 transition-opacity overflow-hidden border-2 border-[#00B2FF]/30 hover:border-[#00B2FF]/70 transition-all"
               >
                  {user?.avatar && !imageError ? (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
               </button>

               {showProfileMenu && (
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-white/10 py-1 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                      <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Mobile Navigation (Scrollable) */}
        <div className="lg:hidden border-t border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar py-3">
           <div className="flex px-4 gap-6 min-w-max">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${
                      isActive
                        ? "text-[#00B2FF]"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-8 py-4 lg:px-16 lg:py-8">
        <div className="animate-in fade-in duration-500">
           {children}
        </div>
      </main>

      <AIChatBubble />
    </div>
  );
};

export default Layout;
