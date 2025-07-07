import { create } from 'zustand';
import { verifyPassword } from '../lib/supabase';

interface DeleteAuthState {
  isDisabled: boolean;
  failedAttempts: number;
  authenticate: (password: string) => Promise<boolean>;
  checkIsDisabled: () => boolean;
}

export const useDeleteAuthStore = create<DeleteAuthState>((set) => ({
  isDisabled: false,
  failedAttempts: 0,
  authenticate: async (password: string) => {
    const isValid = await verifyPassword(password, 'delete');
    
    if (!isValid) {
      const newAttempts = useDeleteAuthStore.getState().failedAttempts + 1;
      set({ failedAttempts: newAttempts });
      
      if (newAttempts >= 3) {
        set({ isDisabled: true });
        localStorage.setItem('deleteAuthDisabled', 'true');
      }
      
      localStorage.setItem('deleteFailedAttempts', newAttempts.toString());
    }
    
    return isValid;
  },
  checkIsDisabled: () => {
    const disabled = localStorage.getItem('deleteAuthDisabled') === 'true';
    const attempts = parseInt(localStorage.getItem('deleteFailedAttempts') || '0', 10);
    set({ isDisabled: disabled, failedAttempts: attempts });
    return disabled;
  },
}));

// Initialize state from localStorage
if (typeof window !== 'undefined') {
  const storedDisabled = localStorage.getItem('deleteAuthDisabled') === 'true';
  const storedAttempts = parseInt(localStorage.getItem('deleteFailedAttempts') || '0', 10);
  
  if (storedDisabled || storedAttempts >= 3) {
    useDeleteAuthStore.setState({ isDisabled: true, failedAttempts: storedAttempts });
  }
}