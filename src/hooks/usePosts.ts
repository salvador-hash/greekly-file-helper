import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Post, PostLike, PostComment, Profile } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';

export interface PostWithDetails extends Post {
  author: Profile | null;
  likes: PostLike[];
  comments: (PostComment & { user: Profile | null })[];
}

export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch authors, likes, and comments for each post
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          // Get author
          const { data: author } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', post.author_id)
            .maybeSingle();

          // Get likes
          const { data: likes } = await supabase
            .from('post_likes')
            .select('*')
            .eq('post_id', post.id);

          // Get comments with user info
          const { data: comments } = await supabase
            .from('post_comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

          const commentsWithUsers = await Promise.all(
            (comments || []).map(async (comment) => {
              const { data: user } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', comment.user_id)
                .maybeSingle();
              return { ...comment, user };
            })
          );

          return {
            ...post,
            author,
            likes: likes || [],
            comments: commentsWithUsers,
          } as PostWithDetails;
        })
      );

      return postsWithDetails;
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
        return { liked: false };
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });
        
        if (error) throw error;
        return { liked: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
