import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, Clock } from 'lucide-react';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../ui/LoadingSpinner';

interface LatestComment {
  id: string;
  content: string;
  author_name: string | null;
  is_anonymous: boolean;
  created_at: string;
  posts: {
    id: string;
    title: string;
  };
}

const LatestComments: React.FC = () => {
  const [comments, setComments] = useState<LatestComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestComments = async () => {
      setIsLoading(true);
      try {
        const { data, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            author_name,
            is_anonymous,
            created_at,
            posts!inner (
              id,
              title
            )
          `)
          .order('created_at', { ascending: false })
          .limit(7);

        if (commentsError) throw commentsError;

        setComments(data || []);
      } catch (err) {
        console.error('Error fetching latest comments:', err);
        setError('حدث خطأ أثناء تحميل التعليقات الأخيرة');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestComments();
  }, []);

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'منذ وقت غير معروف';
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'منذ وقت غير معروف';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800 max-h-[33vh] overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={20} />
          <span>أحدث التعليقات</span>
        </h2>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Link
                key={comment.id}
                to={`/post/${comment.posts.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700"
              >
                <div className="space-y-2">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {truncateText(comment.content)}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{comment.is_anonymous ? 'مجهول' : comment.author_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatRelativeTime(comment.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                      في: {truncateText(comment.posts.title, 50)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-gray-400 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">لا توجد تعليقات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestComments;