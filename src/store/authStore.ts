import { create } from 'zustand';
import { verifyPassword } from '../lib/supabase';

interface AuthState {
  isAuthenticated: boolean;
  isDisabled: boolean;
  failedAttempts: number;
  authenticate: (password: string) => Promise<boolean>;
  checkIsDisabled: () => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isDisabled: false,
  failedAttempts: 0,
  authenticate: async (password: string) => {
    const isValid = await verifyPassword(password, 'auth');
    
    if (isValid) {
      set({ isAuthenticated: true });
      sessionStorage.setItem('isAuthenticated', 'true');
    } else {
      const newAttempts = useAuthStore.getState().failedAttempts + 1;
      set({ failedAttempts: newAttempts });
      
      if (newAttempts >= 3) {
        set({ isDisabled: true });
        localStorage.setItem('authDisabled', 'true');
      }
      
      localStorage.setItem('failedAttempts', newAttempts.toString());
    }
    
    return isValid;
  },
  checkIsDisabled: () => {
    const disabled = localStorage.getItem('authDisabled') === 'true';
    const attempts = parseInt(localStorage.getItem('failedAttempts') || '0', 10);
    set({ isDisabled: disabled, failedAttempts: attempts });
    return disabled;
  },
}));

// Initialize auth state from session storage
if (typeof window !== 'undefined') {
  const storedAuth = sessionStorage.getItem('isAuthenticated');
  const storedDisabled = localStorage.getItem('authDisabled') === 'true';
  const storedAttempts = parseInt(localStorage.getItem('failedAttempts') || '0', 10);
  
  if (storedAuth === 'true') {
    useAuthStore.setState({ isAuthenticated: true });
  }
  if (storedDisabled || storedAttempts >= 3) {
    useAuthStore.setState({ isDisabled: true, failedAttempts: storedAttempts });
  }
}