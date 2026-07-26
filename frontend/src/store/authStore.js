import { create } from 'zustand';

const API_URL = import.meta.env.DEV ? 'http://localhost:8080/api' : (import.meta.env.VITE_API_URL || '/api');

const useAuthStore = create((set, get) => {
  const session = JSON.parse(localStorage.getItem('jt_session'));
  let currentUser = session ? session.user : null;

  return {
    user: currentUser,
    login: async (email, password) => {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('jt_session', JSON.stringify({ token: data.token, user: data.user }));
          set({ user: data.user });
          return { success: true };
        }
        return { success: false, error: data.error || 'Login failed' };
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    },
    register: async (name, email, password) => {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('jt_session', JSON.stringify({ token: data.token, user: data.user }));
          set({ user: data.user });
          return { success: true };
        }
        return { success: false, error: data.error || 'Registration failed' };
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    },
    logout: () => {
      localStorage.removeItem('jt_session');
      set({ user: null });
    },
    updateProfile: async (data) => {
      const currentUser = get().user;
      if (!currentUser) return;
      try {
        const res = await fetch(`${API_URL}/auth/profile/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const updatedUser = await res.json();
          const session = JSON.parse(localStorage.getItem('jt_session'));
          if (session) {
            session.user = updatedUser;
            localStorage.setItem('jt_session', JSON.stringify(session));
          }
          set({ user: updatedUser });
        }
      } catch (error) {
        console.error('Update profile failed', error);
      }
    },
    forgotPassword: async (email) => {
      try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
          return { success: true, token: data.token };
        }
        return { success: false, error: data.error || 'Email verification failed' };
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    },
    resetPassword: async (token, password) => {
      try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password })
        });
        const data = await res.json();
        if (data.success) {
          return { success: true };
        }
        return { success: false, error: data.error || 'Password reset failed' };
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    }
  };
});

export default useAuthStore;
