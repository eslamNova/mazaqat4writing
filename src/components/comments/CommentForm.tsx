import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUserContentStore } from '../../store/userContentStore';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import PasswordModal from '../auth/PasswordModal';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string | null;
  onCommentAdded: () => void;
  placeholder?: string;
}

interface CommentFormValues {
  content: string;
  authorName: string;
  isAnonymous: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentCommentId = null,
  onCommentAdded,
  placeholder = 'أضف تعليقك هنا...',
}) => {
  const { isAuthenticated } = useAuthStore();
  const { addComment } = useUserContentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CommentFormValues>({
    defaultValues: {
      isAnonymous: true,
      authorName: '',
    }
  });
  
  const isAnonymous = watch('isAnonymous');
  
  const onSubmit = async (data: CommentFormValues) => {
    if (!isAuthenticated) {
      setShowPasswordModal(true);
      return;
    }
    
    await submitComment(data);
  };
  
  const submitComment = async (data: CommentFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    if (!postId) {
      setError('خطأ في معرف المقال');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: postId.toString(),
          parent_comment_id: parentCommentId,
          content: data.content,
          author_name: data.isAnonymous ? null : data.authorName,
          is_anonymous: data.isAnonymous,
        })
        .select('id')
        .single();
      
      if (commentError) throw commentError;
      
      addComment(comment.id);
      reset({ content: '', authorName: '', isAnonymous: true });
      onCommentAdded();
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('حدث خطأ أثناء نشر التعليق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-2 rounded-md mb-3 text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-3">
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder={placeholder}
            {...register('content', { required: 'المحتوى مطلوب' })}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <input
              id={`isAnonymous${parentCommentId || 'main'}`}
              type="checkbox"
              className="h-4 w-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
              {...register('isAnonymous')}
            />
            <label htmlFor={`isAnonymous${parentCommentId || 'main'}`} className="mr-2 block text-sm text-gray-700 dark:text-gray-300">
              تعليق بدون اسم
            </label>
          </div>
          
          {!isAnonymous && (
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="اسمك"
                {...register('authorName', { 
                  required: !isAnonymous ? 'اسم الكاتب مطلوب' : false 
                })}
              />
              {errors.authorName && (
                <p className="mt-1 text-xs text-red-600">{errors.authorName.message}</p>
              )}
            </div>
          )}
          
          <div className="mr-auto">
            <Button
              type="submit"
              isLoading={isSubmitting}
              size="sm"
              className="flex items-center gap-1"
            >
              <MessageSquare size={16} />
              <span>تعليق</span>
            </Button>
          </div>
        </div>
      </form>
      
      <PasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => handleSubmit(submitComment)()}
      />
    </>
  );
};

export default CommentForm;