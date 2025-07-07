import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { clsx } from 'clsx';
import { useUserContentStore } from '../../store/userContentStore';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string | null;
  isAnonymous: boolean;
  createdAt: string;
  criticismLevel: string;
  commentCount: number;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  content,
  author,
  isAnonymous,
  createdAt,
  criticismLevel,
  commentCount,
}) => {
  const { hasCreated } = useUserContentStore();
  const isUserPost = hasCreated('post', id);
  const hasUserComment = hasCreated('comment', id);

  // Get a preview of the content (first 150 characters)
  const contentPreview = content.length > 150 
    ? `${content.substring(0, 150)}...` 
    : content;
  
  // Format the date
  const formattedDate = format(new Date(createdAt), 'PPP', { locale: ar });
  
  return (
    <Link 
      to={`/post/${id}`}
      className={clsx(
        "block rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden paper-bg animate-fade-in",
        isUserPost 
          ? "bg-blue-50 dark:bg-blue-900/20"
          : hasUserComment
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-white dark:bg-gray-900"
      )}
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{title}</h2>
        
        <div className={clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3",
          {
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': criticismLevel === 'light',
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': criticismLevel === 'moderate',
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': criticismLevel === 'harsh',
          }
        )}>
          {criticismLevel === 'light' && 'نقد لطيف'}
          {criticismLevel === 'moderate' && 'نقد معتدل'}
          {criticismLevel === 'harsh' && 'نقد شديد'}
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">{contentPreview}</p>
        
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
          <div className="flex items-center mr-4 mb-2 sm:mb-0">
            <User size={16} className="ml-1" />
            <span>{isAnonymous ? 'مجهول' : author}</span>
          </div>
          
          <div className="flex items-center mr-4 mb-2 sm:mb-0">
            <Calendar size={16} className="ml-1" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <MessageSquare size={16} className="ml-1" />
            <span>{commentCount} تعليق</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;