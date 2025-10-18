-- Criar tabela de avaliações (evaluations)
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_assignment_id UUID NOT NULL REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
  trimester INTEGER NOT NULL CHECK (trimester BETWEEN 1 AND 3),
  grade NUMERIC(4,2) NOT NULL CHECK (grade >= 0 AND grade <= 20),
  evaluation_type TEXT NOT NULL DEFAULT 'EXAME',
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_student_subject_trimester UNIQUE (student_id, teacher_assignment_id, trimester, evaluation_type)
);

-- Habilitar RLS
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para avaliações
CREATE POLICY "Professores podem gerenciar avaliações de suas turmas"
ON public.evaluations FOR ALL
USING (
  user_has_role('DIRETORIA'::app_role) OR 
  user_has_role('SECRETARIA'::app_role) OR
  (user_has_role('PROFESSOR'::app_role) AND teacher_assignment_id IN (
    SELECT assignment_id FROM get_teacher_assignment_ids(auth.uid())
  ))
)
WITH CHECK (
  user_has_role('DIRETORIA'::app_role) OR 
  user_has_role('SECRETARIA'::app_role) OR
  (user_has_role('PROFESSOR'::app_role) AND teacher_assignment_id IN (
    SELECT assignment_id FROM get_teacher_assignment_ids(auth.uid())
  ))
);

-- Política de visualização para professores
CREATE POLICY "Usuários podem ver avaliações baseado em permissões"
ON public.evaluations FOR SELECT
USING (
  user_has_role('DIRETORIA'::app_role) OR 
  user_has_role('SECRETARIA'::app_role) OR
  (user_has_role('PROFESSOR'::app_role) AND teacher_assignment_id IN (
    SELECT assignment_id FROM get_teacher_assignment_ids(auth.uid())
  ))
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_evaluations_updated_at
BEFORE UPDATE ON public.evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_evaluations_student ON public.evaluations(student_id);
CREATE INDEX idx_evaluations_assignment ON public.evaluations(teacher_assignment_id);
CREATE INDEX idx_evaluations_trimester ON public.evaluations(trimester);
CREATE INDEX idx_evaluations_date ON public.evaluations(evaluation_date);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificações
CREATE POLICY "Usuários veem suas próprias notificações"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "DIRETORIA pode criar notificações"
ON public.notifications FOR INSERT
WITH CHECK (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

CREATE POLICY "Usuários podem atualizar suas notificações"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas notificações"
ON public.notifications FOR DELETE
USING (user_id = auth.uid());

-- Criar índices
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);