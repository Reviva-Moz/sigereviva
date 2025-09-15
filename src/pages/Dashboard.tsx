import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  Calendar,
  TrendingUp,
  UserCheck,
  ClipboardCheck,
  BarChart3,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';

// Dados simulados para o dashboard
const dashboardStats = {
  DIRETORIA: [
    { title: 'Total de Estudantes', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Total de Professores', value: '89', change: '+3%', icon: UserCheck, color: 'text-green-600' },
    { title: 'Classes Ativas', value: '32', change: '0%', icon: GraduationCap, color: 'text-purple-600' },
    { title: 'Receita Mensal', value: '2.4M MT', change: '+8%', icon: DollarSign, color: 'text-primary' },
  ],
  SECRETARIA: [
    { title: 'Estudantes Ativos', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Professores', value: '89', change: '+3%', icon: UserCheck, color: 'text-green-600' },
    { title: 'Classes', value: '32', change: '0%', icon: GraduationCap, color: 'text-purple-600' },
    { title: 'Avaliações Pendentes', value: '156', change: '-5%', icon: ClipboardCheck, color: 'text-orange-600' },
  ],
  FINANCEIRO: [
    { title: 'Receita Mensal', value: '2.4M MT', change: '+8%', icon: DollarSign, color: 'text-primary' },
    { title: 'Pagamentos Pendentes', value: '89', change: '-12%', icon: Calendar, color: 'text-red-600' },
    { title: 'Taxa de Cobrança', value: '92%', change: '+2%', icon: TrendingUp, color: 'text-green-600' },
    { title: 'Devedores', value: '156', change: '-8%', icon: Users, color: 'text-orange-600' },
  ],
  PROFESSOR: [
    { title: 'Minhas Turmas', value: '5', change: '0%', icon: GraduationCap, color: 'text-purple-600' },
    { title: 'Estudantes', value: '127', change: '+2%', icon: Users, color: 'text-blue-600' },
    { title: 'Aulas Esta Semana', value: '18', change: '0%', icon: Calendar, color: 'text-green-600' },
    { title: 'Avaliações Pendentes', value: '12', change: '-3%', icon: ClipboardCheck, color: 'text-orange-600' },
  ],
};

const recentActivities = [
  { id: 1, type: 'student', message: 'Novo estudante matriculado: João Silva', time: '2 min atrás' },
  { id: 2, type: 'payment', message: 'Pagamento recebido de Maria Santos', time: '5 min atrás' },
  { id: 3, type: 'evaluation', message: 'Avaliação de Matemática criada', time: '10 min atrás' },
  { id: 4, type: 'attendance', message: 'Presenças da 10ª Classe registradas', time: '15 min atrás' },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;

  const stats = dashboardStats[user.role];
  const greeting = getGreeting();

  return (
    <MainLayout 
      title={`${greeting}, ${user.name}!`}
      subtitle={`Bem-vindo ao SGE REVIVA - ${getRoleDisplayName(user.role)}`}
    >
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="surface-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Badge 
                      variant={stat.change.startsWith('+') ? 'default' : stat.change.startsWith('-') ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                    <span>desde o mês passado</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atividades recentes */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="text-foreground">Atividades Recentes</CardTitle>
                <CardDescription>
                  Últimas atividades no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ações rápidas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso rápido às principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getQuickActions(user.role).map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={action.onClick}
                      >
                        <action.icon className="w-4 h-4" />
                        {action.title}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getRoleDisplayName(role: string) {
  const roles = {
    DIRETORIA: 'Diretoria',
    SECRETARIA: 'Secretaria Académica',
    FINANCEIRO: 'Departamento Financeiro',
    PROFESSOR: 'Professor'
  };
  return roles[role as keyof typeof roles] || role;
}

function getActivityColor(type: string) {
  const colors = {
    student: 'bg-blue-100 text-blue-600',
    payment: 'bg-green-100 text-green-600',
    evaluation: 'bg-purple-100 text-purple-600',
    attendance: 'bg-orange-100 text-orange-600'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
}

function getActivityIcon(type: string) {
  const icons = {
    student: <Users className="w-4 h-4" />,
    payment: <DollarSign className="w-4 h-4" />,
    evaluation: <ClipboardCheck className="w-4 h-4" />,
    attendance: <Calendar className="w-4 h-4" />
  };
  return icons[type as keyof typeof icons] || <Users className="w-4 h-4" />;
}

function getQuickActions(role: string) {
  const actions = {
    DIRETORIA: [
      { title: 'Ver Relatórios', icon: BarChart3, onClick: () => console.log('Relatórios') },
      { title: 'Gerir Professores', icon: UserCheck, onClick: () => console.log('Professores') },
      { title: 'Configurações', icon: Settings, onClick: () => console.log('Configurações') },
    ],
    SECRETARIA: [
      { title: 'Registrar Estudante', icon: Users, onClick: () => console.log('Novo estudante') },
      { title: 'Criar Turma', icon: GraduationCap, onClick: () => console.log('Nova turma') },
      { title: 'Agendar Avaliação', icon: ClipboardCheck, onClick: () => console.log('Nova avaliação') },
    ],
    FINANCEIRO: [
      { title: 'Registrar Pagamento', icon: DollarSign, onClick: () => console.log('Pagamento') },
      { title: 'Ver Devedores', icon: Users, onClick: () => console.log('Devedores') },
      { title: 'Relatório Financeiro', icon: BarChart3, onClick: () => console.log('Relatório') },
    ],
    PROFESSOR: [
      { title: 'Registrar Presenças', icon: Calendar, onClick: () => console.log('Presenças') },
      { title: 'Criar Avaliação', icon: ClipboardCheck, onClick: () => console.log('Avaliação') },
      { title: 'Ver Minhas Turmas', icon: GraduationCap, onClick: () => console.log('Turmas') },
    ]
  };
  
  return actions[role as keyof typeof actions] || [];
}