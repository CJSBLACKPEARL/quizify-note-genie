-- Fix critical security vulnerabilities - RLS policies only

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