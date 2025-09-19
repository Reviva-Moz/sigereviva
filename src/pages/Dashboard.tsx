import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, School } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useTurmas } from '@/hooks/useTurmas';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { data: students } = useStudents();
  const { data: teachers } = useTeachers();
  const { data: turmas } = useTurmas();

  // Buscar dados financeiros
  const { data: financialData } = useSupabaseQuery(
    ['financial_summary'],
    async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .select('amount, status')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      return { data, error };
    }
  );

  // Calcular métricas
  const totalStudents = students?.length || 0;
  const activeTeachers = teachers?.filter(t => t.status === 'ATIVO').length || 0;
  const totalTurmas = turmas?.length || 0;
  const monthlyRevenue = financialData?.filter(f => f.status === 'PAGO')
    .reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
    }).format(value);
  };

  return (
    <MainLayout title="Dashboard" subtitle="Visão geral do sistema SGE REVIVA">
      <div className="space-y-6">
        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Educandos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Estudantes matriculados
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Professores Ativos
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  Corpo docente ativo
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Turmas
                </CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalTurmas}</div>
                <p className="text-xs text-muted-foreground">
                  Turmas organizadas
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Mensal
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(monthlyRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pagamentos recebidos este mês
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Resumo de atividades recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumo Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estudantes Ativos</span>
                  <span className="font-semibold">{students?.filter(s => s.status === 'ATIVO').length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Professores Ativos</span>
                  <span className="font-semibold">{activeTeachers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Turmas com Vagas</span>
                  <span className="font-semibold">
                    {turmas?.filter(t => (t.current_students || 0) < (t.max_capacity || 0)).length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taxa de Ocupação Média</span>
                  <span className="font-semibold">
                    {turmas && turmas.length > 0 
                      ? ((turmas.reduce((acc, t) => acc + (t.current_students || 0), 0) / 
                         turmas.reduce((acc, t) => acc + (t.max_capacity || 1), 0)) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Estudantes Ativos</span>
                    <span>{students?.filter(s => s.status === 'ATIVO').length || 0}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${totalStudents > 0 
                          ? ((students?.filter(s => s.status === 'ATIVO').length || 0) / totalStudents) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Estudantes Inativos</span>
                    <span>{students?.filter(s => s.status === 'INATIVO').length || 0}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ 
                        width: `${totalStudents > 0 
                          ? ((students?.filter(s => s.status === 'INATIVO').length || 0) / totalStudents) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Professores Ativos</span>
                    <span>{activeTeachers}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(teachers?.length || 0) > 0 
                          ? (activeTeachers / (teachers?.length || 1)) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}