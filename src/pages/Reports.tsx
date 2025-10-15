import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  GraduationCap,
  DollarSign,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useTurmas } from '@/hooks/useTurmas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatMZN } from '@/lib/validators/mozambique';

const COLORS = ['#2D5F3F', '#4A7C59', '#6B9B7F', '#8CBAA5'];

export default function Reports() {
  const [reportType, setReportType] = useState('academic');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: students = [] } = useStudents();
  const { data: teachers = [] } = useTeachers();
  const { data: turmas = [] } = useTurmas();

  // Dados para gráficos
  const studentsByStatus = [
    { name: 'Ativos', value: students.filter(s => s.status === 'ATIVO').length },
    { name: 'Inativos', value: students.filter(s => s.status === 'INATIVO').length },
    { name: 'Transferidos', value: students.filter(s => s.status === 'TRANSFERIDO').length },
    { name: 'Graduados', value: students.filter(s => s.status === 'GRADUADO').length },
  ];

  const turmasByCapacity = turmas.map(t => ({
    name: t.turma_name,
    ocupacao: ((t.current_students || 0) / (t.max_capacity || 30)) * 100,
    estudantes: t.current_students || 0,
    capacidade: t.max_capacity || 30,
  }));

  const monthlyData = [
    { mes: 'Jan', matriculas: 45, receita: 125000 },
    { mes: 'Fev', matriculas: 52, receita: 142000 },
    { mes: 'Mar', matriculas: 48, receita: 135000 },
    { mes: 'Abr', matriculas: 61, receita: 168000 },
    { mes: 'Mai', matriculas: 55, receita: 152000 },
    { mes: 'Jun', matriculas: 67, receita: 185000 },
  ];

  const reportTemplates = [
    {
      id: 'academic',
      title: 'Relatório Académico',
      description: 'Desempenho dos educandos, taxas de aprovação e frequência',
      icon: GraduationCap,
    },
    {
      id: 'financial',
      title: 'Relatório Financeiro',
      description: 'Receitas, despesas e situação de pagamentos',
      icon: DollarSign,
    },
    {
      id: 'enrollment',
      title: 'Relatório de Matrículas',
      description: 'Estatísticas de matrículas e evasão escolar',
      icon: Users,
    },
    {
      id: 'teachers',
      title: 'Relatório de Professores',
      description: 'Corpo docente, qualificações e distribuição',
      icon: Users,
    },
    {
      id: 'attendance',
      title: 'Relatório de Presenças',
      description: 'Frequência dos educandos e índices de absentismo',
      icon: Calendar,
    },
    {
      id: 'minedh',
      title: 'Relatório MINEDH',
      description: 'Relatório oficial para o Ministério da Educação',
      icon: FileText,
    },
  ];

  const handleGenerateReport = () => {
    // TODO: Implementar geração de relatório
    // Placeholder para desenvolvimento futuro
  };

  return (
    <MainLayout title="Relatórios" subtitle="Análises e relatórios estatísticos">
      <div className="space-y-6">
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Educandos</p>
                  <p className="text-3xl font-bold text-primary">{students.length}</p>
                </div>
                <Users className="h-12 w-12 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Professores</p>
                  <p className="text-3xl font-bold text-secondary">{teachers.length}</p>
                </div>
                <GraduationCap className="h-12 w-12 text-secondary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Turmas</p>
                  <p className="text-3xl font-bold text-accent">{turmas.length}</p>
                </div>
                <BarChart3 className="h-12 w-12 text-accent opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
                  <p className="text-3xl font-bold text-green-600">
                    {turmas.length > 0
                      ? Math.round(
                          (turmas.reduce((sum, t) => sum + (t.current_students || 0), 0) /
                            turmas.reduce((sum, t) => sum + (t.max_capacity || 30), 0)) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seleção de Relatório */}
        <Card>
          <CardHeader>
            <CardTitle>Gerar Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {reportTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      reportType === template.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setReportType(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <template.icon className="h-8 w-8 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">{template.title}</h3>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerateReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estudantes por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Educandos por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={studentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ocupação das Turmas */}
          <Card>
            <CardHeader>
              <CardTitle>Ocupação das Turmas (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={turmasByCapacity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'ocupacao') return `${value.toFixed(0)}%`;
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ocupacao" fill="#2D5F3F" name="Ocupação (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Evolução Mensal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolução Mensal - Matrículas e Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'receita') return formatMZN(value);
                      return value;
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="matriculas"
                    stroke="#2D5F3F"
                    strokeWidth={2}
                    name="Matrículas"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="receita"
                    stroke="#4A7C59"
                    strokeWidth={2}
                    name="Receita (MZN)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
