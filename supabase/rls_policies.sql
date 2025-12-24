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

-- =========================================
-- HANDLE NEW USER TRIGGER (if not exists)
-- =========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    university,
    fraternity,
    industry,
    grad_year,
    major,
    varsity_sport,
    clubs
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'university',
    new.raw_user_meta_data ->> 'fraternity',
    new.raw_user_meta_data ->> 'industry',
    NULLIF(new.raw_user_meta_data ->> 'grad_year', '')::integer,
    new.raw_user_meta_data ->> 'major',
    new.raw_user_meta_data ->> 'varsity_sport',
    (SELECT array_agg(x)
     FROM jsonb_array_elements_text(new.raw_user_meta_data -> 'clubs') AS x
    )
  );
  RETURN new;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- (rest of file unchanged)
