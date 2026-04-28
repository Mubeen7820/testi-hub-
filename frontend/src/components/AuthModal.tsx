import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '@/components/ThemeProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const isDark = theme === "dark" ||
    (theme === "system" && document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      navigate('/dashboard');
      onClose();
    }
  }, [isAuthenticated, navigate, isOpen, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
      
      setAuth(data.user, data.accessToken);
      toast.success(isSignUp ? 'Account created!' : 'Welcome back!', { id: toastId });
      navigate('/dashboard');
      onClose();
    } catch (err: any) {
      const errorData = err.response?.data;
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
      navigate('/dashboard');
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to set password';
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Set cookie for mode detection in backend callback
    document.cookie = `auth_mode=${isSignUp ? 'signup' : 'login'}; path=/; max-age=600`;
    
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Dark Overlay with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/60 backdrop-blur-md"
            style={{
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[900px] h-[600px] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Image Section */}
            <div className="hidden md:flex flex-col justify-end w-[45%] bg-[url('/images/conference_speaker_stage.png')] bg-cover bg-center relative p-10">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              <div className="relative z-10">
                <h2 className="text-white text-3xl font-bold mb-2">Join the Network.</h2>
                <p className="text-white/80 font-medium">Build and connect with teams that value execution.</p>
              </div>
            </div>

            {/* Right Form Section */}
            <div className="w-full md:w-[55%] p-8 lg:p-12 relative flex flex-col overflow-y-auto bg-white dark:bg-slate-950">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                title="Close"
              />

              <div className="flex-1 flex flex-col justify-center max-w-[340px] mx-auto w-full">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  {isSettingPassword ? 'Set your password' : isSignUp ? 'Create account' : 'Welcome back!'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                  {isSettingPassword 
                    ? 'This Google account doesn\'t have a password yet.'
                    : isSignUp 
                      ? 'Enter your details to get started.' 
                      : 'Enter your credentials to access your dashboard.'}
                </p>

                {isSettingPassword ? (
                  <form onSubmit={handleSetPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create password"
                          className="w-full bg-[#EBF0FF] dark:bg-slate-900/50 border-transparent dark:border-white/10 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 transition-all font-medium"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0A1128] text-white dark:bg-white dark:text-slate-900 font-bold rounded-md py-2.5 transition-all shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50"
                    >
                      Set Password & Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingPassword(false);
                        setPassword('');
                      }}
                      className="w-full text-slate-500 text-sm font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleAuth} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Email Address</label>
                        <input
                          type="email"
                          placeholder="Email Address"
                          className="w-full bg-[#EBF0FF] dark:bg-slate-900/50 border-transparent dark:border-white/10 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A1128]/20 dark:focus:ring-white/20 transition-all font-medium disabled:opacity-50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className="w-full bg-[#EBF0FF] dark:bg-slate-900/50 border-transparent dark:border-white/10 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A1128]/20 dark:focus:ring-white/20 transition-all font-medium disabled:opacity-50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
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
                              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Confirm Password</label>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm password"
                                className="w-full bg-[#EBF0FF] dark:bg-slate-900/50 border-transparent dark:border-white/10 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A1128]/20 dark:focus:ring-white/20 transition-all font-medium disabled:opacity-50"
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
                        className="w-full bg-[#0A1128] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-md py-2.5 mt-2 transition-all shadow-md disabled:opacity-50 active:scale-[0.98]"
                      >
                        {isLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                      </button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm font-medium">
                        <span className="px-4 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400">Or sign in with:</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {['Google', 'Github'].map((provider) => (
                        <button 
                          key={provider}
                          disabled={isLoading}
                          onClick={() => handleSocialLogin(provider)}
                          title={`Sign in with ${provider}`}
                          className="flex items-center justify-center py-2.5 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl transition-all group disabled:opacity-50 shadow-sm"
                        >
                          {provider === 'Google' && (
                            <>
                              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                              </svg>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
                            </>
                          )}
                          {provider === 'Github' && (
                            <>
                              <svg className="w-5 h-5 mr-2 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">GitHub</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="text-center mt-2 pb-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button 
                          type="button"
                          onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setEmail('');
                            setPassword('');
                            setConfirmPassword('');
                          }}
                          className="text-[#38bdf8] font-bold hover:underline transition-all"
                        >
                          {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
