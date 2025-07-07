import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { useUserContentStore } from '../../store/userContentStore';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import PasswordModal from '../auth/PasswordModal';

interface PostFormValues {
  title: string;
  content: string;
  authorName: string;
  criticismLevel: string;
  isAnonymous: boolean;
}

const PostForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addPost } = useUserContentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PostFormValues>({
    defaultValues: {
      isAnonymous: true,
      authorName: '',
      criticismLevel: 'moderate',
    }
  });
  
  const isAnonymous = watch('isAnonymous');
  
  const onSubmit = async (data: PostFormValues) => {
    if (!isAuthenticated) {
      setShowPasswordModal(true);
      return;
    }
    
    await submitPost(data);
  };
  
  const submitPost = async (data: PostFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: data.title,
          content: data.content,
          author_name: data.isAnonymous ? null : data.authorName,
          criticism_level: data.criticismLevel,
          is_anonymous: data.isAnonymous,
        })
        .select('id')
        .single();
      
      if (postError) throw postError;
      
      addPost(post.id);
      navigate(`/post/${post.id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('حدث خطأ أثناء نشر المقال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-4 rounded-md">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            العنوان
          </label>
          <input
            id="title"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            {...register('title', { required: 'العنوان مطلوب' })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            المحتوى
          </label>
          <textarea
            id="content"
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            {...register('content', { required: 'المحتوى مطلوب' })}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="criticismLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            مستوى النقد المطلوب
          </label>
          <select
            id="criticismLevel"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            {...register('criticismLevel', { required: 'مستوى النقد مطلوب' })}
          >
            <option value="light">نقد لطيف - تعليقات لطيفة وبناءة</option>
            <option value="moderate">نقد معتدل - تعليقات صريحة ومتوازنة</option>
            <option value="harsh">نقد شديد - تعليقات صريحة وحادة</option>
          </select>
          {errors.criticismLevel && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.criticismLevel.message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="isAnonymous"
            type="checkbox"
            className="h-4 w-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
            {...register('isAnonymous')}
          />
          <label htmlFor="isAnonymous" className="mr-2 block text-sm text-gray-700 dark:text-gray-300">
            نشر بدون اسم
          </label>
        </div>
        
        {!isAnonymous && (
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم الكاتب
            </label>
            <input
              id="authorName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              {...register('authorName', { 
                required: !isAnonymous ? 'اسم الكاتب مطلوب' : false 
              })}
            />
            {errors.authorName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.authorName.message}</p>
            )}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            نشر
          </Button>
        </div>
      </form>
      
      <PasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => handleSubmit(submitPost)()}
      />
    </>
  );
};

export default PostForm;