-- SupabaseのSQLエディタで以下のクエリを実行してください。

-- 1. notesテーブルの作成
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS（Row Level Security）の有効化
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 3. ポリシーの作成
-- 参照ポリシー：自分のプロジェクトに関連するノートのみ参照可能
CREATE POLICY "Users can view notes in their projects"
ON public.notes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = notes.project_id
        AND (projects.owner_id = auth.uid() OR projects.partner_id = auth.uid())
    )
);

-- 挿入ポリシー：自分のプロジェクトにのみ追加可能
CREATE POLICY "Users can insert notes to their projects"
ON public.notes FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = notes.project_id
        AND (projects.owner_id = auth.uid() OR projects.partner_id = auth.uid())
    )
);

-- 更新ポリシー：自分のノートのみ更新可能
CREATE POLICY "Users can update their own notes"
ON public.notes FOR UPDATE
USING (user_id = auth.uid());

-- 削除ポリシー：自分のノートのみ削除可能
CREATE POLICY "Users can delete their own notes"
ON public.notes FOR DELETE
USING (user_id = auth.uid());

