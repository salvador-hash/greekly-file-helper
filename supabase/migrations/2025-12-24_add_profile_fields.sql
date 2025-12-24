-- Add new profile fields: major, varsity_sport, clubs (text array)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS major text,
  ADD COLUMN IF NOT EXISTS varsity_sport text,
  ADD COLUMN IF NOT EXISTS clubs text[];
