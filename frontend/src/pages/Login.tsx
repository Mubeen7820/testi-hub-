import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
      const { data } = await api.post(endpoint, { email, password });
      
      setAuth(data.user, data.accessToken);
      toast.success(isSignUp ? 'Account created!' : 'Welcome back!', { id: toastId });
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Authentication failed';
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      window.location.href = `https://testi-hub-backend.vercel.app/api/auth/google`;
      return;
    }
    
    toast.info(`OAuth flow for ${provider} initiated. Implementation would redirect to provider's auth page.`);
    // Keep other mock providers as is or add them later
  };


  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid/Gradient */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ 
             backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center border border-white/10">
            <User className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="text-slate-400 text-center mb-8">
          {isSignUp ? 'Enter your details to get started' : 'Enter your credentials to sign in'}
        </p>

        {!isSignUp && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {['Apple', 'Google', 'X'].map((provider) => (
                <button 
                  key={provider}
                  disabled={isLoading}
                  onClick={() => handleSocialLogin(provider)}
                  className="flex items-center justify-center py-3 bg-[#111111] hover:bg-[#1A1A1A] border border-white/5 rounded-xl transition-colors group disabled:opacity-50"
                >
                  {provider === 'Apple' && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.79 1.56-.05 2.87.6 3.63 1.83-2.9 1.66-2.58 5.76.5 6.84-.71 1.76-1.56 3.39-2.79 4.29zm-4.71-13.68c-.17-1.39.53-2.67 1.4-3.41.97-.8 2.37-1.33 3.53-1.29.23 1.5-.54 2.91-1.33 3.73-1.01.99-2.55 1.43-3.6 1.07z" />
                    </svg>
                  )}
                  {provider === 'Google' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  {provider === 'X' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#0A0A0A] text-slate-500 font-bold tracking-widest uppercase">OR CONTINUE WITH</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-[#111111] border border-white/5 rounded-md py-2 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-medium disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isSignUp ? 'Create password' : 'Enter password'}
                className="w-full bg-[#111111] border border-white/5 rounded-md py-2 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-medium disabled:opacity-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
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
              >
                <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  className="w-full bg-[#111111] border border-white/5 rounded-md py-2 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-medium disabled:opacity-50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bold rounded-md py-2.5 hover:bg-slate-200 transition-all shadow-lg shadow-white/5 disabled:opacity-50"
          >
            {isLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center">
          <p className="text-sm text-slate-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-white font-bold underline underline-offset-4 hover:text-slate-200 transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
          {!isSignUp && (
            <button className="text-sm text-white font-bold underline underline-offset-4 hover:text-slate-200 transition-colors block w-full">
              Forgot your password?
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
