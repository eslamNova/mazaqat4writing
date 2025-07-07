import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserContentState {
  posts: string[];
  comments: string[];
  addPost: (postId: string) => void;
  addComment: (commentId: string) => void;
  hasCreated: (type: 'post' | 'comment', id: string) => boolean;
}

export const useUserContentStore = create<UserContentState>()(
  persist(
    (set, get) => ({
      posts: [],
      comments: [],
      addPost: (postId) => set((state) => ({
        posts: [...state.posts, postId]
      })),
      addComment: (commentId) => set((state) => ({
        comments: [...state.comments, commentId]
      })),
      hasCreated: (type, id) => {
        const state = get();
        return type === 'post' 
          ? state.posts.includes(id)
          : state.comments.includes(id);
      }
    }),
    {
      name: 'user-content-storage'
    }
  )
);