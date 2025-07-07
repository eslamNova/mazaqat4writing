import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, Share2, Check, Trash2 } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import CommentList, { CommentType } from '../components/comments/CommentList';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DeletePasswordModal from '../components/auth/DeletePasswordModal';

interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string | null;
  criticism_level: string;
  is_anonymous: boolean;
  created_at: string;
}

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const { data, error: postError } = await supabase
          .from('posts')
          .select()
          .eq('id', id)
          .single();
        
        if (postError) {
          if (postError.code === 'PGRST116') {
            navigate('/not-found');
            return;
          }
          throw postError;
        }
        
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('حدث خطأ أثناء تحميل المقال. يرجى تحديث الصفحة.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [id, navigate]);
  
  const fetchComments = async () => {
    if (!id) return;
    
    setIsCommentsLoading(true);
    try {
      const { data, error: commentsError } = await supabase
        .from('comments')
        .select()
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      
      if (commentsError) throw commentsError;
      
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      // Don't set an error here to avoid blocking the post view
    } finally {
      setIsCommentsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [id]);
  
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleDelete = async () => {
    try {
      console.log('Starting post deletion process...');
      
      // Then attempt to delete the post
      console.log('Attempting to delete post...');
      const { data: deleteData, error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .select();
      
      if (deleteError) {
        console.error('Error deleting post:', deleteError);
        throw deleteError;
      }
      console.log('Post deleted successfully:', deleteData);
      
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('حدث خطأ أثناء حذف المقال. يرجى المحاولة مرة أخرى.');
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">لم يتم العثور على المقال.</p>
      </div>
    );
  }
  
  // Format the date with validation
  const formattedDate = (() => {
    try {
      const date = parseISO(post.created_at);
      if (!isValid(date)) {
        return 'تاريخ غير معروف';
      }
      return format(date, 'PPP', { locale: ar });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير معروف';
    }
  })();
  
  return (
    <div className="max-w-3xl mx-auto">
      <article className="bg-white rounded-lg shadow-sm p-6 md:p-8 paper-bg">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">{post.title}</h1>
          
          <div className={clsx(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4",
            {
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': post.criticism_level === 'light',
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': post.criticism_level === 'moderate',
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': post.criticism_level === 'harsh',
            }
          )}>
            <div className="flex items-center gap-2">
              {post.criticism_level === 'light' && (
                <>
                  <span>نقد لطيف</span>
                  <span className="text-xs">- تعليقات لطيفة وبناءة</span>
                </>
              )}
              {post.criticism_level === 'moderate' && (
                <>
                  <span>نقد معتدل</span>
                  <span className="text-xs">- تعليقات صريحة ومتوازنة</span>
                </>
              )}
              {post.criticism_level === 'harsh' && (
                <>
                  <span>نقد شديد</span>
                  <span className="text-xs">- تعليقات صريحة وحادة</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center mb-2 sm:mb-0">
              <User size={16} className="ml-1" />
              <span>{post.is_anonymous ? 'مجهول' : post.author_name}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar size={16} className="ml-1" />
              <span>{formattedDate}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="mr-auto mt-2 sm:mt-0"
            >
              {copied ? (
                <>
                  <Check size={16} className="ml-1" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Share2 size={16} className="ml-1" />
                  <span>مشاركة</span>
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 size={16} />
              <span>حذف</span>
            </Button>
          </div>
        </header>
        
        <div className="article-content">
          {post.content}
        </div>
      </article>
      
      <CommentList
        postId={post.id}
        comments={comments}
        isLoading={isCommentsLoading}
        onCommentAdded={fetchComments}
      />
      
      <DeletePasswordModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemType="post"
      />
    </div>
  );
};

export default PostPage;