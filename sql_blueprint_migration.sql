-- Create user_exam_blueprints table
CREATE TABLE IF NOT EXISTS public.user_exam_blueprints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_exam_blueprints ENABLE ROW LEVEL SECURITY;

-- Create policies for user_exam_blueprints
CREATE POLICY "Users can manage their own blueprints"
    ON public.user_exam_blueprints
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create blueprint_seen_questions junction table
CREATE TABLE IF NOT EXISTS public.blueprint_seen_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blueprint_id UUID NOT NULL REFERENCES public.user_exam_blueprints(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blueprint_id, question_id)
);

-- Enable RLS
ALTER TABLE public.blueprint_seen_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for blueprint_seen_questions
CREATE POLICY "Users can manage their own seen questions"
    ON public.blueprint_seen_questions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
