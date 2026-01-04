-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create characters table
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  race TEXT NOT NULL DEFAULT 'Humano',
  class TEXT NOT NULL DEFAULT 'Guerrero',
  level INTEGER NOT NULL DEFAULT 1,
  health INTEGER NOT NULL DEFAULT 100,
  max_health INTEGER NOT NULL DEFAULT 100,
  strength INTEGER NOT NULL DEFAULT 10,
  dexterity INTEGER NOT NULL DEFAULT 10,
  constitution INTEGER NOT NULL DEFAULT 10,
  intelligence INTEGER NOT NULL DEFAULT 10,
  wisdom INTEGER NOT NULL DEFAULT 10,
  charisma INTEGER NOT NULL DEFAULT 10,
  experience INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 50,
  inventory JSONB DEFAULT '[]'::jsonb,
  background TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own characters" ON public.characters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters" ON public.characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" ON public.characters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters" ON public.characters
  FOR DELETE USING (auth.uid() = user_id);

-- Create adventures table
CREATE TABLE public.adventures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  setting TEXT NOT NULL DEFAULT 'Fantasía Medieval',
  current_scene TEXT,
  game_state JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.adventures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own adventures" ON public.adventures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own adventures" ON public.adventures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adventures" ON public.adventures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own adventures" ON public.adventures
  FOR DELETE USING (auth.uid() = user_id);

-- Create story_logs table for adventure history
CREATE TABLE public.story_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adventure_id UUID NOT NULL REFERENCES public.adventures(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  dice_roll JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.story_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs from their adventures" ON public.story_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.adventures 
      WHERE adventures.id = story_logs.adventure_id 
      AND adventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create logs in their adventures" ON public.story_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.adventures 
      WHERE adventures.id = story_logs.adventure_id 
      AND adventures.user_id = auth.uid()
    )
  );

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adventures_updated_at
  BEFORE UPDATE ON public.adventures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();