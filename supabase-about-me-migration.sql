-- Add "About Me" free-text field for AI personalization
ALTER TABLE public.users ADD COLUMN about_me TEXT DEFAULT NULL;
