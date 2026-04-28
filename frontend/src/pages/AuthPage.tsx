import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown, ThumbsUp, ThumbsDown, ArrowRight, User, MessageSquareText, FileText, Star, LayoutDashboard, UserPlus, FileOutput, ChevronLeft, Moon, Sun, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../components/ThemeProvider';
import logoIcon from '../assets/logo.png';
import mentorxLogo from '../assets/logo_transparent.png';
import { PhoneAuthWidget } from '../components/auth/PhoneAuthWidget';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" ||
    (theme === "system" && document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // Refs for the smoky background effect
  const glowRef1 = useRef<HTMLDivElement>(null);
  const glowRef2 = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowRef1.current || !glowRef2.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Translate the glow elements to follow the mouse, centered on cursor
    // Different durations (via CSS) and slight offsets give it a "trailing smoke" feel
    glowRef1.current.style.transform = `translate(${x - 250}px, ${y - 250}px)`;
    glowRef2.current.style.transform = `translate(${x - 150}px, ${y - 150}px)`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsSignUp(location.pathname === '/signup');
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');

    // Handle errors from Social Login redirects
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    if (error === 'USER_ALREADY_EXISTS') {
      setIsSignUp(false);
      toast.error('Account already exists. Please sign in.');
      navigate(location.pathname, { replace: true });
    } else if (error === 'USER_NOT_FOUND') {
      setIsSignUp(true);
      toast.error('No account found. Please sign up to get started.');
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isSignUp && !confirmPassword)) {
      toast.error('All fields are required');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(isSignUp ? 'Creating account...' : 'Signing in...');

    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const { data } = await api.post(endpoint, { email: trimmedEmail, password: trimmedPassword });

      if (isSignUp) {
        toast.success('Account created successfully! Please sign in to continue.', { id: toastId });
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
        setIsLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      setAuth(data.user, data.accessToken);
      toast.success('Welcome back!', { id: toastId });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const errorData = err.response?.data;
      
      // Smart switching logic: If user tries to signup but account exists, switch to login
      if (errorData?.error === 'USER_ALREADY_EXISTS' && isSignUp) {
        setIsSignUp(false);
        toast.error('Account already exists. Please sign in.', { id: toastId });
        return;
      }
      
      // Smart switching logic: If user tries to login but no account exists, switch to signup
      if (errorData?.error === 'USER_NOT_FOUND' && !isSignUp) {
        setIsSignUp(true);
        toast.error(errorData.message || 'No account found. Switching to Sign Up...', { id: toastId });
        return;
      }

      if (errorData?.error === 'GOOGLE_ACCOUNT_NO_PASSWORD') {
        setIsSettingPassword(true);
        toast.dismiss(toastId);
        return;
      }
      const message = errorData?.message || 'Authentication failed';
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Setting password...');

    try {
      const { data } = await api.post('/auth/set-password', { email, newPassword: password });
      setAuth(data.user, data.accessToken);
      toast.success('Password set successfully! Logging you in...', { id: toastId });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to set password';
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Set a cookie to remember if we are in signup or login mode
    document.cookie = `auth_mode=${isSignUp ? 'signup' : 'login'}; path=/; max-age=600`; // 10 mins
    
    const apiBase = import.meta.env.VITE_API_URL;
    
    if (provider === 'Google') {
      // Sign In: only show account chooser (no consent)
      // Sign Up: show account chooser + consent screen
      const googleRoute = isSignUp ? 'google/signup' : 'google';
      window.location.href = `${apiBase}/auth/${googleRoute}`;
    } else {
      window.location.href = `${apiBase}/auth/${provider.toLowerCase()}`;
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 font-sans relative">

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
        title="Go back to home (Esc)"
        aria-label="Go back to home"
      >
        <ChevronLeft className="w-6 h-6 text-black dark:text-white stroke-[3] group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 md:top-8 md:right-8 z-[100] w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 text-slate-500 group-hover:text-indigo-500 transition-colors" />
        )}
      </button>

      {/* Left UI Mockup Section (Pixel Perfect Replica) */}
      <div
        className="hidden lg:flex flex-col w-[55%] bg-[#F0F4FA] dark:bg-slate-900 relative overflow-hidden justify-center items-center select-none"
        onMouseMove={handleMouseMove}
      >
        {/* Interactive Smoky Blue Glow Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            ref={glowRef1}
            className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1DA1F2]/30 rounded-full blur-[90px] transition-transform duration-[1200ms] ease-out will-change-transform"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
          <div
            ref={glowRef2}
            className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#3B82F6]/30 rounded-full blur-[60px] transition-transform duration-[600ms] ease-out will-change-transform"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </div>

        <div className="relative z-10 w-[760px] h-[640px] transform scale-[0.65] xl:scale-[0.8] 2xl:scale-90 origin-center">

          {/* Main Browser Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute top-[80px] left-[180px] w-[560px] h-[520px] bg-[#F8FAFC] rounded-[24px] shadow-sm flex overflow-hidden border border-slate-100"
          >
            {/* Sidebar */}
            <div className="w-[150px] bg-white border-r border-slate-100 flex flex-col pt-8 pb-4">
              <div className="px-5 mb-8">
                 <div className="w-12 h-12 flex items-center justify-center">
                    <img src={mentorxLogo} alt="MENTORX Logo" className="w-full h-full object-contain" />
                 </div>
              </div>
              <div className="w-full px-3 mb-2">
                <div className="flex items-center text-slate-500 text-[12px] font-medium p-2 rounded-lg cursor-pointer hover:bg-slate-50">
                  <MessageSquareText className="w-4 h-4 mr-2.5 opacity-70" /> Create Testimonial
                </div>
              </div>
              <div className="w-full px-3">
                <div className="flex items-center text-slate-500 text-[12px] font-medium p-2 rounded-lg cursor-pointer hover:bg-slate-50">
                  <LayoutDashboard className="w-4 h-4 mr-2.5 opacity-70" /> Dashboard
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white p-8 relative">
              <h1 className="text-[28px] font-bold text-slate-900 mb-6 tracking-tight">Testimonial Hub</h1>

              <div className="flex items-center space-x-2 mb-6">
                <div className="px-3.5 py-1.5 bg-[#F1F5F9] text-slate-800 text-[12px] font-semibold rounded-lg border border-slate-200/60">
                  All recents
                </div>
                <div className="px-3.5 py-1.5 text-slate-400 text-[12px] font-medium">
                  all recents
                </div>
              </div>

              <div className="space-y-4">
                {/* Content Card with Stars */}
                <div className="w-[90%] bg-white border border-slate-200 rounded-[16px] shadow-sm p-5 relative">
                  <div className="flex items-center mb-3">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[12px] text-slate-500 font-medium">5 Reviews</span>
                  </div>
                  <div className="w-[80%] h-2.5 bg-slate-200 rounded-full mb-3"></div>
                  <div className="w-[50%] h-2.5 bg-slate-200 rounded-full mb-6"></div>
                  <div className="flex items-center space-x-4">
                    <ThumbsUp className="w-4 h-4 text-slate-400" />
                    <ThumbsDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="w-[90%] h-[80px] bg-white border border-slate-100 rounded-[16px] shadow-[0_2px_10px_rgb(0,0,0,0.02)]"></div>
              </div>
            </div>
          </motion.div>

          {/* Floating Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-[260px] left-[40px] w-[320px] bg-white rounded-[16px] shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-slate-100 p-5 z-20"
          >
            <div className="flex flex-col mb-4">
              <div className="mb-3 text-slate-500">
                <div className="w-8 h-8 border-2 border-slate-200 rounded-lg flex items-center justify-center relative">
                  <FileText className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <Star className="w-2 h-2 text-slate-400 fill-slate-400" />
                  </div>
                </div>
              </div>
              <span className="text-[14px] font-semibold text-slate-500 mb-1">Actions</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 bg-[#E2E8F0] rounded-[10px] cursor-pointer hover:bg-slate-200 transition-colors">
                <div className="flex items-center text-slate-700">
                  <div className="w-6 h-6 mr-3 border border-slate-400 rounded-full flex items-center justify-center">
                    <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span className="text-[14px] font-medium text-slate-800">Collect Text Feedback</span>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#E2E8F0] rounded-[10px] cursor-pointer hover:bg-slate-200 transition-colors">
                <div className="flex items-center text-slate-700">
                  <div className="w-6 h-6 mr-3 border border-slate-400 rounded-md flex items-center justify-center">
                    <FileOutput className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span className="text-[14px] font-medium text-slate-800">Text-to-Testimonial Creator</span>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </motion.div>

          {/* Floating Testimonial Card (Top Right) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute top-[120px] right-[20px] w-[260px] bg-white rounded-[16px] shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-slate-100 p-4 z-20"
          >
            <div className="flex items-center mb-3">
              <div className="w-9 h-9 rounded-full overflow-hidden mr-3 shrink-0 shadow-sm border border-slate-100">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="text-[14px] font-bold text-slate-900 leading-none">Sarah Jenkins</h4>
                  <div className="w-4 h-4 ml-1 bg-[#1DA1F2] rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">@2 days ago</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-800 mb-3 leading-relaxed font-medium">
              This tool completely transformed how we collect feedback. Highly recommended! 👏
            </p>
            <div className="flex items-center text-slate-400 space-x-4">
              <div className="flex items-center text-[12px] font-semibold"><ThumbsUp className="w-4 h-4 mr-1.5" /> 124</div>
              <div className="flex items-center"><ThumbsDown className="w-4 h-4" /></div>
            </div>
          </motion.div>

          {/* Floating Workflow Card (Bottom Right) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute top-[350px] right-[-20px] w-[360px] bg-white rounded-[16px] shadow-[0_15px_50px_rgb(0,0,0,0.08)] border border-slate-100 p-4 flex flex-col z-30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-[140px] bg-[#E8E6FC] p-4 rounded-[16px] relative shadow-inner">
                <p className="text-[10px] text-[#2C2B5B] font-semibold leading-relaxed pb-4">
                  We've been using Testimonial Hub for a month. It completely automated our feedback collection and saved us 10+ hours a week. Highly recommended!
                </p>
                <div className="absolute bottom-3 right-3 w-5 h-5 bg-[#2D9CDB] rounded-lg flex items-center justify-center shadow-sm">
                  <User className="w-3 h-3 text-white" />
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 mx-1" />
              <div className="w-[140px] bg-white border border-slate-200 p-3 rounded-[16px] shadow-sm flex flex-col h-[130px]">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 shrink-0 border border-slate-100">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[8px] font-bold text-slate-900 uppercase tracking-tight leading-none">MICHAEL...</h4>
                    <p className="text-[7px] text-slate-500 mt-0.5">@ 1 day ago</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-800 leading-snug flex-1 font-medium">
                  "Completely automated our feedback collection and saved us 10+ hours a week. Highly recommended!"
                </p>
                <div className="flex items-center text-slate-400 text-[9px] font-semibold mt-2"><ThumbsUp className="w-3 h-3 mr-1" /> 89</div>
              </div>
            </div>

            <div className="w-full flex items-center px-1 pt-1 pb-1">
              <div className="w-6 h-6 rounded-full overflow-hidden mr-3 shrink-0 opacity-80 border border-slate-100">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col space-y-1 w-[80px]">
                <div className="w-full h-1.5 bg-slate-200 rounded-full"></div>
                <div className="w-[60%] h-1.5 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 py-10 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[380px] mx-auto">
          <h1 className="text-[32px] font-bold text-[#101828] dark:text-white mb-2 tracking-tight">
            {isSettingPassword ? 'Set your password' : isSignUp ? 'Welcome!' : 'Welcome back!'}
          </h1>
          <p className="text-[15px] text-[#475467] dark:text-slate-400 mb-8">
            {isSettingPassword
              ? 'This Google account doesn\'t have a password yet.'
              : isSignUp
                ? 'Enter your details to get started.'
                : 'Enter your credentials to access your dashboard.'}
          </p>

          {isSettingPassword ? (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#344054] dark:text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    className="w-full bg-[#F2F4F7] dark:bg-slate-900 border-transparent dark:border-white/10 rounded-md py-2 px-3.5 text-gray-900 dark:text-white placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#101828]/20 transition-all text-[15px]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#101828] hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-md py-2 transition-all disabled:opacity-50 text-[15px] shadow-sm active:scale-[0.98]"
              >
                Set Password & Log In
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#344054] dark:text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-[#F2F4F7] dark:bg-slate-900 border-transparent dark:border-white/10 rounded-md py-2 px-3.5 text-gray-900 dark:text-white placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#101828]/20 transition-all text-[15px] disabled:opacity-50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#344054] dark:text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full bg-[#F2F4F7] dark:bg-slate-900 border-transparent dark:border-white/10 rounded-md py-2 px-3.5 text-gray-900 dark:text-white placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#101828]/20 transition-all text-[15px] tracking-widest disabled:opacity-50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1">
                        <label className="block text-[14px] font-medium text-[#344054] dark:text-slate-300 mb-1.5">Confirm Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          className="w-full bg-[#F2F4F7] dark:bg-slate-900 border-transparent dark:border-white/10 rounded-md py-2 px-3.5 text-gray-900 dark:text-white placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#101828]/20 transition-all text-[15px] tracking-widest disabled:opacity-50"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#101828] hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-md py-2.5 mt-2 transition-all shadow-sm disabled:opacity-50 active:scale-[0.98] text-[15px]"
                >
                  {isLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[13px] font-medium">
                  <span className="px-4 bg-white dark:bg-slate-950 text-gray-500">
                    {isSignUp ? 'Or sign up with:' : 'Or sign in with:'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                {['Google', 'Github'].map((provider) => (
                  <button
                    key={provider}
                    disabled={isLoading}
                    onClick={() => handleSocialLogin(provider)}
                    className="flex-1 flex items-center justify-center py-2.5 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl transition-all shadow-sm group"
                  >
                    {provider === 'Google' && (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-[14px] font-semibold text-[#344054] dark:text-slate-300">
                          {isSignUp ? 'Sign up' : 'Sign in'} with Google
                        </span>
                      </>
                    )}
                    {provider === 'Github' && (
                      <>
                        <svg className="w-5 h-5 mr-2 text-[#101828] dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[14px] font-semibold text-[#344054] dark:text-slate-300">
                          {isSignUp ? 'Sign up' : 'Sign in'} with GitHub
                        </span>
                      </>
                    )}
                  </button>
                ))}
              </div>



              <div className="text-center mt-6">
                <p className="text-[14px] text-gray-500 font-medium">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <Link
                    to={isSignUp ? "/login" : "/signup"}
                    className="text-[#328C7D] font-semibold hover:opacity-80 transition-opacity"
                  >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
