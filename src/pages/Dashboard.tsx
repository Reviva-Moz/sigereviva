import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, School } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useTurmas } from '@/hooks/useTurmas';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatMZN } from '@/lib/validators/mozambique';
import { StatsCard } from '@/components/shared/StatsCard';

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

  // Dados para gráficos
  const enrollmentByProvince = [
    { name: 'Maputo Cidade', total: 450 },
    { name: 'Maputo Província', total: 320 },
    { name: 'Gaza', total: 180 },
    { name: 'Inhambane', total: 210 },
    { name: 'Sofala', total: 290 },
  ];

  const statusDistribution = [
    { name: 'Ativos', value: students?.filter(s => s.status === 'ATIVO').length || 0, color: 'hsl(142 53% 42%)' },
    { name: 'Inativos', value: students?.filter(s => s.status === 'INATIVO').length || 0, color: 'hsl(0 84% 60%)' },
    { name: 'Transferidos', value: students?.filter(s => s.status === 'TRANSFERIDO').length || 0, color: 'hsl(213 94% 68%)' },
    { name: 'Graduados', value: students?.filter(s => s.status === 'GRADUADO').length || 0, color: 'hsl(280 60% 60%)' },
  ];

  return (
    <MainLayout title="Dashboard" subtitle="Visão geral do sistema SGE REVIVA">
      <div className="space-y-6">
        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Educandos"
            value={totalStudents}
            icon={Users}
            color="primary"
            index={0}
          />
          
          <StatsCard
            title="Professores Ativos"
            value={activeTeachers}
            icon={GraduationCap}
            color="success"
            index={1}
          />
          
          <StatsCard
            title="Total de Turmas"
            value={totalTurmas}
            icon={School}
            color="info"
            index={2}
          />
          
          <StatsCard
            title="Receita Mensal"
            value={formatMZN(monthlyRevenue)}
            icon={DollarSign}
            color="warning"
            index={3}
          />
        </div>

        {/* Gráficos Visuais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Matrículas por Província */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Matrículas por Província
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentByProvince}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Distribuição por Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de atividades */}
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
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Receita do Mês</span>
                  <span className="font-semibold text-green-600">{formatMZN(monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pagamentos Pendentes</span>
                  <span className="font-semibold text-yellow-600">
                    {financialData?.filter(f => f.status === 'PENDENTE').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pagamentos Vencidos</span>
                  <span className="font-semibold text-red-600">
                    {financialData?.filter(f => f.status === 'VENCIDO').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taxa de Cobrança</span>
                  <span className="font-semibold">
                    {financialData && financialData.length > 0
                      ? ((financialData.filter(f => f.status === 'PAGO').length / financialData.length) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}