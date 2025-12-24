import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts, useCreatePost, useToggleLike, useAddComment } from '@/hooks/usePosts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const Home = () => {
  const { profile, user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const { data: posts, isLoading } = usePosts();
  const createPost = useCreatePost();
  const toggleLike = useToggleLike();
  const addComment = useAddComment();

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      await createPost.mutateAsync(newPost);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike.mutateAsync(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    
    try {
      await addComment.mutateAsync({ postId, content });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Home</h1>
        <p className="text-muted-foreground">See what's happening on your network</p>
      </div>

      {/* Create Post */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary">{profile?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share something with your network..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px] bg-secondary/30 border-0 resize-none"
            />
            <div className="flex justify-end mt-3">
              <Button 
                onClick={handlePost} 
                disabled={!newPost.trim() || createPost.isPending} 
                className="rounded-xl"
              >
                {createPost.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-premium p-5">
                <div className="flex gap-3 mb-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post, i) => {
            const isLiked = user && post.likes.some(like => like.user_id === user.id);
            const showComments = expandedComments[post.id];
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-premium p-5"
              >
                <div className="flex gap-3 mb-3">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={post.author?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">{post.author?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link 
                      to={`/profile/${post.author_id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {post.author?.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {post.author?.fraternity} · {format(new Date(post.created_at), 'dd MMM, HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
                <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLike(post.id)} 
                    className={isLiked ? 'text-destructive' : 'text-muted-foreground'}
                    disabled={toggleLike.isPending}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} /> 
                    {post.likes.length}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" /> {post.comments.length}
                  </Button>
                </div>

                {/* Comments Section */}
                {showComments && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {/* Existing Comments */}
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {comment.user?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-secondary/30 rounded-lg px-3 py-2">
                          <Link 
                            to={`/profile/${comment.user_id}`}
                            className="font-medium text-sm text-foreground hover:text-primary"
                          >
                            {comment.user?.name}
                          </Link>
                          <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {profile?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        placeholder="Share something with your network..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComment(post.id);
                          }
                        }}
                        className="flex-1 h-8 text-sm bg-secondary/30"
                      />
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim() || addComment.isPending}
                      >
                        {addComment.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
