import { create } from 'zustand';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  avatar?: string;
  businessName?: string;
  businessType?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  setAuth: (user, accessToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  updateUser: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  updateProfile: async (updates) => {
    try {
      set({ isLoading: true });
      const response = await api.put('/auth/update-profile', updates);
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ isLoading: true });
      await api.post('/auth/change-password', { currentPassword, newPassword });
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error.response?.data?.message || 'Failed to change password';
    }
  },

  logout: () => {
    // Clear specific testimonial related keys manually to avoid circular dependency
    const currentUser = get().user;
    if (currentUser?.id) {
      localStorage.removeItem(`testimonial_history_${currentUser.id}`);
      localStorage.removeItem(`download_history_${currentUser.id}`);
      localStorage.removeItem(`recently_deleted_${currentUser.id}`);
    }
    
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
