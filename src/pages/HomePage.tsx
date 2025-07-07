import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/posts/PostCard';
import LatestComments from '../components/comments/LatestComments';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AIWritingAssistant from '../components/ai/AIWritingAssistant';

interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string | null;
  is_anonymous: boolean;
  created_at: string;
  criticism_level: string;
  comment_count: number;
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Get posts with comment counts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            author_name,
            criticism_level,
            is_anonymous,
            created_at
          `)
          .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        
        // Get comment counts for each post
        const postsWithCommentCounts = await Promise.all(
          postsData.map(async (post) => {
            const { count, error: countError } = await supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);
            
            if (countError) throw countError;
            
            return {
              ...post,
              comment_count: count || 0,
            };
          })
        );
        
        setPosts(postsWithCommentCounts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('حدث خطأ أثناء تحميل المنشورات. يرجى تحديث الصفحة.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  return (
    <div>
      <section className="mb-8 text-center">
        <h2 className="font-bold mb-2 text-gray-900 dark:text-white">منصة مذاقات أدبية</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          شارك إبداعاتك الأدبية وانقد وتعلم من النقد
        </p>
      </section>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="mb-8 text-center">
        {/* AI Writing Assistant */}
        <AIWritingAssistant />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Comments Section - First on mobile, right side on desktop */}
        <div className="lg:col-span-1 lg:order-2">
          <LatestComments />
        </div>
        
        {/* Posts Section - Second on mobile, left side on desktop */}
        <div className="lg:col-span-2 lg:order-1">
          {isLoading ? (
            <LoadingSpinner />
          ) : posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  author={post.author_name}
                  isAnonymous={post.is_anonymous}
                  criticismLevel={post.criticism_level}
                  createdAt={post.created_at}
                  commentCount={post.comment_count}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">لا توجد منشورات بعد. كن أول من يشارك!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;