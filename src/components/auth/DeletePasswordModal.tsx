import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDeleteAuthStore } from '../../store/deleteAuthStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface DeletePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: 'post' | 'comment';
}

const DeletePasswordModal: React.FC<DeletePasswordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemType,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate, isDisabled, failedAttempts, checkIsDisabled } = useDeleteAuthStore();
  
  React.useEffect(() => {
    if (isOpen) {
      checkIsDisabled();
    }
  }, [isOpen, checkIsDisabled]);
  
  if (isDisabled) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="تم تعطيل الحذف">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            تم تعطيل صلاحية الحذف بشكل دائم بسبب تجاوز عدد المحاولات المسموح به.
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
    
    const isValid = await authenticate(password);
    if (isValid) {
      onConfirm();
      onClose();
    } else {
      const remainingAttempts = 2 - failedAttempts;
      setError(`كلمة المرور غير صحيحة. ${remainingAttempts} محاولات متبقية`);
    }
    
    setIsLoading(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`حذف ${itemType === 'post' ? 'المقال' : 'التعليق'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            خاص بالإدارة فقط، أدخل الرمز
          </label>
          <input
            id="deletePassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="أدخل كلمة مرور الحذف"
            required
          />
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            حذف
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DeletePasswordModal;