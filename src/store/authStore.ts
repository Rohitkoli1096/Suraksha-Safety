import { create } from 'zustand';
import { UserProfile, EmergencyContact } from '../types';
import { api } from '../api/client';
import { offlineEmergencyCache } from '../utils/offlineEmergencyCache';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string; phone: string; role?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>;
  addEmergencyContact: (contact: { name: string; phone: string; relationship: string; notifyOnSOS: boolean }) => Promise<{ success: boolean; message?: string }>;
  removeEmergencyContact: (id: string) => Promise<{ success: boolean; message?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: offlineEmergencyCache.getCachedUserProfile(),
  token: localStorage.getItem('suraksha_access_token'),
  isLoading: true,
  error: null,

  initialize: async () => {
    const token = localStorage.getItem('suraksha_access_token');
    const cachedUser = offlineEmergencyCache.getCachedUserProfile();

    if (!token) {
      set({ user: cachedUser, isLoading: false });
      return;
    }

    try {
      const res = await api.get<UserProfile>('/auth/me');
      if (res.success && res.data) {
        offlineEmergencyCache.saveUserProfile(res.data);
        set({ user: res.data, token, isLoading: false, error: null });
      } else {
        // If server responded with failure, but we have offline cached user and might be in offline mode
        if (cachedUser) {
          set({ user: cachedUser, token, isLoading: false });
        } else {
          api.clearTokens();
          set({ user: null, token: null, isLoading: false });
        }
      }
    } catch (err: any) {
      // Network failed or offline: keep cached user and emergency contacts active!
      if (cachedUser) {
        set({ user: cachedUser, token, isLoading: false, error: null });
      } else {
        api.clearTokens();
        set({ user: null, token: null, isLoading: false, error: err.message });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const res = await api.post('/auth/login', { email, password });

    if (res.success && res.data) {
      localStorage.setItem('suraksha_access_token', res.data.accessToken);
      localStorage.setItem('suraksha_refresh_token', res.data.refreshToken);
      offlineEmergencyCache.saveUserProfile(res.data.user);
      set({ user: res.data.user, token: res.data.accessToken, isLoading: false, error: null });
      return { success: true };
    } else {
      set({ isLoading: false, error: res.message || 'Login failed' });
      return { success: false, message: res.message || 'Login failed' };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    const res = await api.post('/auth/register', userData);

    if (res.success && res.data) {
      localStorage.setItem('suraksha_access_token', res.data.accessToken);
      localStorage.setItem('suraksha_refresh_token', res.data.refreshToken);
      offlineEmergencyCache.saveUserProfile(res.data.user);
      set({ user: res.data.user, token: res.data.accessToken, isLoading: false, error: null });
      return { success: true };
    } else {
      set({ isLoading: false, error: res.message || 'Registration failed' });
      return { success: false, message: res.message || 'Registration failed' };
    }
  },

  logout: () => {
    api.clearTokens();
    set({ user: null, token: null, error: null });
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    const res = await api.put<UserProfile>('/user/profile', data);
    if (res.success && res.data) {
      offlineEmergencyCache.saveUserProfile(res.data);
      set({ user: res.data, isLoading: false });
      return { success: true, message: 'Profile updated' };
    }
    set({ isLoading: false });
    return { success: false, message: res.message };
  },

  addEmergencyContact: async (contact) => {
    try {
      const res = await api.post<EmergencyContact[]>('/user/emergency-contacts', contact);
      if (res.success && res.data) {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, emergencyContacts: res.data };
          offlineEmergencyCache.saveUserProfile(updatedUser);
          set({ user: updatedUser });
        }
        return { success: true };
      }
    } catch {
      // Offline fallback: save contact locally in cache so emergency triggers know this contact
    }

    // Offline fallback addition
    const currentUser = get().user;
    if (currentUser) {
      const newContact: EmergencyContact = {
        id: `offline_contact_${Date.now()}`,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        notifyOnSOS: contact.notifyOnSOS,
      };
      const updatedContacts = [...(currentUser.emergencyContacts || []), newContact];
      const updatedUser = { ...currentUser, emergencyContacts: updatedContacts };
      offlineEmergencyCache.saveUserProfile(updatedUser);
      set({ user: updatedUser });
      return { success: true, message: 'Saved to local offline emergency cache' };
    }

    return { success: false, message: 'Failed to add contact' };
  },

  removeEmergencyContact: async (id) => {
    try {
      const res = await api.delete<EmergencyContact[]>(`/user/emergency-contacts/${id}`);
      if (res.success && res.data) {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, emergencyContacts: res.data };
          offlineEmergencyCache.saveUserProfile(updatedUser);
          set({ user: updatedUser });
        }
        return { success: true };
      }
    } catch {}

    const currentUser = get().user;
    if (currentUser) {
      const updatedContacts = (currentUser.emergencyContacts || []).filter((c) => c.id !== id);
      const updatedUser = { ...currentUser, emergencyContacts: updatedContacts };
      offlineEmergencyCache.saveUserProfile(updatedUser);
      set({ user: updatedUser });
      return { success: true };
    }

    return { success: false, message: 'Failed to remove contact' };
  },
}));
