import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PostForm from '../components/posts/PostForm';
import PasswordModal from '../components/auth/PasswordModal';

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDisabled, checkIsDisabled } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated && !isDisabled) {
      checkIsDisabled();
      setShowPasswordModal(true);
    } else if (isDisabled) {
      navigate('/');
    }
  }, [isAuthenticated, isDisabled, checkIsDisabled, navigate]);
  
  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
  };
  
  const handlePasswordCancel = () => {
    navigate('/');
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">نص جديد</h1>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 md:p-8 border dark:border-gray-800">
        <PostForm />
      </div>
      
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordCancel}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
};

export default CreatePostPage;