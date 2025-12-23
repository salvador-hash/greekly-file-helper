import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');

  const handlePost = () => {
    if (!newPost.trim() || !profile) return;
    const post = {
      id: String(Date.now()),
      authorId: profile.id,
      content: newPost,
      createdAt: new Date(),
      likes: [],
      comments: [],
      author: profile,
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId && profile) {
        const liked = post.likes.includes(profile.id);
        return {
          ...post,
          likes: liked 
            ? post.likes.filter((id: string) => id !== profile.id)
            : [...post.likes, profile.id]
        };
      }
      return post;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Home Feed</h1>
        <p className="text-muted-foreground">See what's happening in your Greek network</p>
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
              <Button onClick={handlePost} disabled={!newPost.trim()} className="rounded-xl">
                <Send className="h-4 w-4 mr-2" /> Post
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map((post, i) => {
            const isLiked = profile && post.likes.includes(profile.id);
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
                    <AvatarImage src={post.author?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">{post.author?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{post.author?.name}</p>
                    <p className="text-sm text-muted-foreground">{post.author?.fraternity} · {post.author?.university}</p>
                  </div>
                </div>
                <p className="text-foreground mb-4">{post.content}</p>
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => toggleLike(post.id)} className={isLiked ? 'text-destructive' : 'text-muted-foreground'}>
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} /> {post.likes.length}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="h-4 w-4 mr-1" /> {post.comments.length}
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;