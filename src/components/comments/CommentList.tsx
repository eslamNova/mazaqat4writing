import React from 'react';
import Comment from './Comment';
import CommentForm from './CommentForm';
import LoadingSpinner from '../ui/LoadingSpinner';

export interface CommentType {
  id: string;
  post_id: string;
  content: string;
  author_name: string | null;
  is_anonymous: boolean;
  parent_comment_id: string | null;
  created_at: string;
  replies?: CommentType[];
}

interface CommentListProps {
  postId: string;
  comments: CommentType[];
  isLoading: boolean;
  onCommentAdded: () => void;
}

const CommentList: React.FC<CommentListProps> = ({
  postId,
  comments,
  isLoading,
  onCommentAdded,
}) => {
  // Organize comments into a tree structure
  const buildCommentTree = (comments: CommentType[]): CommentType[] => {
    const commentMap = new Map<string, CommentType>();
    const rootComments: CommentType[] = [];
    
    // First, add all comments to a map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Then, organize them into a tree
    comments.forEach(comment => {
      const mappedComment = commentMap.get(comment.id)!;
      
      if (comment.parent_comment_id === null) {
        // This is a root comment
        rootComments.push(mappedComment);
      } else {
        // This is a reply
        const parentComment = commentMap.get(comment.parent_comment_id);
        if (parentComment) {
          parentComment.replies = parentComment.replies || [];
          parentComment.replies.push(mappedComment);
        } else {
          // If parent doesn't exist for some reason, add to root
          rootComments.push(mappedComment);
        }
      }
    });
    
    return rootComments;
  };

  const commentTree = buildCommentTree(comments);
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">التعليقات</h2>
      
      <CommentForm postId={postId} onCommentAdded={onCommentAdded} />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : commentTree.length > 0 ? (
        <div>
          {commentTree.map((comment) => (
            <Comment
              key={comment.id}
              id={comment.id}
              postId={comment.post_id}
              content={comment.content}
              authorName={comment.author_name}
              isAnonymous={comment.is_anonymous}
              createdAt={comment.created_at}
              replies={comment.replies || []}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center p-6">لا توجد تعليقات بعد. كن أول من يعلق!</p>
      )}
    </div>
  );
};

export default CommentList;