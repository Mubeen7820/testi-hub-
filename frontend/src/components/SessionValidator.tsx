import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

/**
 * SessionValidator
 * 
 * This component handles "Single Session Enforcement" across different computers/browsers.
 * It checks the session validity whenever the user focuses the window or switches tabs.
 * If the user has signed in on another device, they are logged out here instantly.
 */
export const SessionValidator = () => {
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = async () => {
      try {
        await api.get('/auth/me');
      } catch (error: any) {
        // The axios interceptor will handle the logout if it's a SESSION_REVOKED error
        console.warn('Session validation check failed');
      }
    };

    // Check when user returns to the tab
    const handleFocus = () => {
      checkSession();
    };

    // Check periodically (every 1 minute) just in case
    const interval = setInterval(checkSession, 60000);

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [isAuthenticated, logout]);

  return null;
};
