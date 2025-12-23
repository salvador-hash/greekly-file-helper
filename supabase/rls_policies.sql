-- =========================================
-- GreekLink - Complete RLS Policies
-- Run this in your Supabase SQL Editor
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =========================================
-- PROFILES POLICIES
-- =========================================

-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (profile_visibility = 'public' OR auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for trigger)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =========================================
-- POSTS POLICIES
-- =========================================

-- Authenticated users can view all posts
CREATE POLICY "Authenticated users can view posts"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- Users can create their own posts
CREATE POLICY "Users can create own posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =========================================
-- POST_LIKES POLICIES
-- =========================================

-- Authenticated users can view all likes
CREATE POLICY "Authenticated users can view likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);

-- Users can create their own likes
CREATE POLICY "Users can create own likes"
ON public.post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
ON public.post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =========================================
-- POST_COMMENTS POLICIES
-- =========================================

-- Authenticated users can view all comments
CREATE POLICY "Authenticated users can view comments"
ON public.post_comments FOR SELECT
TO authenticated
USING (true);

-- Users can create their own comments
CREATE POLICY "Users can create own comments"
ON public.post_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.post_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.post_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =========================================
-- CONNECTIONS POLICIES
-- =========================================

-- Users can view connections where they are involved
CREATE POLICY "Users can view own connections"
ON public.connections FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Users can create connections (for accepting requests)
CREATE POLICY "Users can create connections"
ON public.connections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Users can delete their connections
CREATE POLICY "Users can delete own connections"
ON public.connections FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- =========================================
-- CONNECTION_REQUESTS POLICIES
-- =========================================

-- Users can view requests sent to them or by them
CREATE POLICY "Users can view own connection requests"
ON public.connection_requests FOR SELECT
TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can send connection requests
CREATE POLICY "Users can send connection requests"
ON public.connection_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = from_user_id);

-- Users can update requests sent to them (accept/reject)
CREATE POLICY "Users can update received requests"
ON public.connection_requests FOR UPDATE
TO authenticated
USING (auth.uid() = to_user_id)
WITH CHECK (auth.uid() = to_user_id);

-- Users can delete their own sent requests
CREATE POLICY "Users can delete own sent requests"
ON public.connection_requests FOR DELETE
TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- =========================================
-- MESSAGES POLICIES
-- =========================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON public.messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can delete their own sent messages
CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

-- =========================================
-- NOTIFICATIONS POLICIES
-- =========================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can create notifications for any user
CREATE POLICY "Authenticated can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =========================================
-- REALTIME CONFIGURATION
-- =========================================

-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add messages to realtime publication (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END
$$;

-- =========================================
-- STORAGE BUCKET FOR AVATARS
-- =========================================

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================
-- HANDLE NEW USER TRIGGER (if not exists)
-- =========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, university, fraternity, industry, grad_year)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'university',
    new.raw_user_meta_data ->> 'fraternity',
    new.raw_user_meta_data ->> 'industry',
    (new.raw_user_meta_data ->> 'grad_year')::integer
  );
  RETURN new;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
