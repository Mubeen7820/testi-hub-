import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { toast } from 'sonner';

export const AuthInitializer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      const fetchUser = async () => {
        try {
          // Set temporary local storage token so api can use it
          localStorage.setItem('accessToken', token);
          
          const { data } = await api.get('/auth/me');
          // Check if this was a signup attempt
          const authMode = document.cookie.split('; ').find(row => row.startsWith('auth_mode='))?.split('=')[1];
          
          if (authMode === 'signup') {
            // Clear the cookie
            document.cookie = "auth_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            localStorage.removeItem('accessToken'); // Don't log them in yet
            navigate('/login', { replace: true });
            toast.success('Account created with Social Login! Please sign in now.');
            return;
          }

          setAuth(data.user, token);
          
          // Clear the token from URL and navigate to dashboard
          window.history.pushState(null, '', '/dashboard');
          navigate('/dashboard', { replace: true });
          toast.success('Signed in successfully!');

        } catch (error: any) {
          console.error('Failed to fetch user with Google token', error);
          localStorage.removeItem('accessToken');
          if (!error.isSilentRefreshError) {
            toast.error('Authentication failed');
          }
        }
      };

      fetchUser();
    }
  }, [location, navigate, setAuth]);

  return null;
};
