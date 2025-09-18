-- Fix critical security vulnerabilities

-- 1. Add RLS policies for missing tables
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Quizzes" ENABLE ROW LEVEL SECURITY;

-- RLS policies for progress table
CREATE POLICY "Users can view their own progress" 
ON public.progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for subscription table
CREATE POLICY "Users can view their own subscription" 
ON public.subscription 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.subscription 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
ON public.subscription 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for users table
CREATE POLICY "Users can view their own user record" 
ON public.users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user record" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for Quizzes table (legacy)
CREATE POLICY "Users can view their own quizzes legacy" 
ON public."Quizzes" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quizzes legacy" 
ON public."Quizzes" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes legacy" 
ON public."Quizzes" 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes legacy" 
ON public."Quizzes" 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Add foreign key constraints for data integrity
-- Note: We cannot add foreign keys to auth.users directly, but we can add them to profiles
ALTER TABLE public.flashcards 
ADD CONSTRAINT flashcards_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.quizzes 
ADD CONSTRAINT quizzes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 3. Fix nullable user_id fields that should be NOT NULL for security
ALTER TABLE public.progress 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.subscription 
ALTER COLUMN user_id SET NOT NULL;

-- 4. Add triggers for automatic timestamp updates on missing tables
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_updated_at
  BEFORE UPDATE ON public.subscription
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();