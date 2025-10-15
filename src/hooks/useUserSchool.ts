import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserSchool() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-school', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Buscar school_id do professor associado ao usuário
      const { data: teacher } = await supabase
        .from('teachers')
        .select('school_id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (teacher?.school_id) {
        return teacher.school_id;
      }

      // Se não for professor, buscar a primeira escola (para DIRETORIA/SECRETARIA)
      const { data: school } = await supabase
        .from('schools')
        .select('id')
        .limit(1)
        .maybeSingle();

      return school?.id || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
