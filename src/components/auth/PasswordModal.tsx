import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate, isDisabled, failedAttempts, checkIsDisabled } = useAuthStore();
  
  React.useEffect(() => {
    if (isOpen) {
      checkIsDisabled();
    }
  }, [isOpen, checkIsDisabled]);
  
  if (isDisabled) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="تم تعطيل الوصول">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            تم تعطيل الوصول بشكل دائم بسبب تجاوز عدد المحاولات المسموح به.
          </p>
          <Button onClick={onClose} className="w-full">إغلاق</Button>
        </div>
      </Modal>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const isValid = await authenticate(password);
      if (isValid) {
        onSuccess();
        onClose();
      } else {
        const remainingAttempts = 2 - failedAttempts;
        setError(`كلمة المرور غير صحيحة. ${remainingAttempts} محاولات متبقية`);
      }
    } catch (err) {
      setError('حدث خطأ ما، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل الدخول">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="أدخل كلمة المرور"
            required
          />
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            دخول
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordModal;