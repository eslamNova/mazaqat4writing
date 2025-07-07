import React, { useState } from 'react';
import { User, Calendar, MessageCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import Button from '../ui/Button';
import CommentForm from './CommentForm';
import DeletePasswordModal from '../auth/DeletePasswordModal';
import { supabase } from '../../lib/supabase';

interface CommentProps {
  id: string;
  postId: string;
  content: string;
  authorName: string | null;
  isAnonymous: boolean;
  createdAt: string;
  replies: CommentProps[];
  onCommentAdded: () => void;
}

const Comment: React.FC<CommentProps> = ({
  id,
  postId,
  content,
  authorName,
  isAnonymous,
  createdAt,
  replies,
  onCommentAdded,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Format the date with validation
  const formattedDate = (() => {
    if (!createdAt || typeof createdAt !== 'string') {
      return 'تاريخ غير معروف';
    }
    
    try {
      const date = parseISO(createdAt);
      if (!isValid(date)) {
        return 'تاريخ غير معروف';
      }
      return format(date, 'PPP', { locale: ar });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير معروف';
    }
  })();
  
  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };
  
  const handleCommentAdded = () => {
    setShowReplyForm(false);
    onCommentAdded();
  };
  
  const handleDelete = async () => {
    try {
      console.log('Starting comment deletion process...');
      
      // Then attempt to delete the comment
      console.log('Attempting to delete comment...');
      const { data: deleteData, error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .select();
      
      if (deleteError) {
        console.error('Error deleting comment:', deleteError);
        throw deleteError;
      }
      console.log('Comment deleted successfully:', deleteData);
      
      onCommentAdded();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('حدث خطأ أثناء حذف التعليق. يرجى المحاولة مرة أخرى.');
    }
  };
  
  return (
    <div className="mb-4 relative">
      <div className="bg-white rounded-lg shadow-sm p-4 paper-bg">
        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <div className="flex items-center ml-4">
              <User size={14} className="ml-1" />
              <span className="dark:text-gray-400">{isAnonymous ? 'مجهول' : authorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="ml-1" />
              <span className="dark:text-gray-400">{formattedDate}</span>
            </div>
          </div>
          <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{content}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
          >
            <Trash2 size={16} />
            <span>حذف</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleReplyForm}
            className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
          >
            <MessageCircle size={16} />
            <span>رد</span>
          </Button>
          
          {replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
            >
              {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>{replies.length} {replies.length === 1 ? 'رد' : 'ردود'}</span>
            </Button>
          )}
          
        </div>
      </div>
      
      {showReplyForm && (
        <div className="mt-2 mr-8">
          <CommentForm
            postId={postId}
            parentCommentId={id}
            onCommentAdded={handleCommentAdded}
            placeholder="اكتب ردك هنا..."
          />
        </div>
      )}
      
      {replies.length > 0 && showReplies && (
        <div className="mr-8 mt-2 relative">
          <div className="comment-thread-line"></div>
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              id={reply.id}
              postId={postId}
              content={reply.content}
              authorName={reply.author_name}
              isAnonymous={reply.is_anonymous}
              createdAt={reply.created_at}
              replies={reply.replies || []}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
      
      <DeletePasswordModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemType="comment"
      />
    </div>
  );
};

export default Comment;