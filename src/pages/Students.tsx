import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Download, MoreVertical } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Dados simulados de estudantes
const mockStudents = [
  {
    id: '1',
    name: 'Ana Maria Silva',
    email: 'ana.silva@estudante.sge.mz',
    phone: '+258 84 123 4567',
    class: '12ª Classe',
    section: 'A',
    status: 'ativo',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ana Silva',
    enrollmentDate: '2024-02-15',
    guardian: 'João Silva'
  },
  {
    id: '2',
    name: 'Carlos Alberto Mendes',
    email: 'carlos.mendes@estudante.sge.mz',
    phone: '+258 84 234 5678',
    class: '11ª Classe',
    section: 'B',
    status: 'ativo',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Carlos Mendes',
    enrollmentDate: '2024-01-20',
    guardian: 'Maria Mendes'
  },
  {
    id: '3',
    name: 'Beatriz Santos',
    email: 'beatriz.santos@estudante.sge.mz',
    phone: '+258 84 345 6789',
    class: '10ª Classe',
    section: 'A',
    status: 'suspenso',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Beatriz Santos',
    enrollmentDate: '2024-03-10',
    guardian: 'Pedro Santos'
  },
  {
    id: '4',
    name: 'David Mucavel',
    email: 'david.mucavel@estudante.sge.mz',
    phone: '+258 84 456 7890',
    class: '12ª Classe',
    section: 'B',
    status: 'ativo',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=David Mucavel',
    enrollmentDate: '2024-01-05',
    guardian: 'Isabel Mucavel'
  },
  {
    id: '5',
    name: 'Esperança Chissano',
    email: 'esperanca.chissano@estudante.sge.mz',
    phone: '+258 84 567 8901',
    class: '11ª Classe',
    section: 'A',
    status: 'ativo',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Esperança Chissano',
    enrollmentDate: '2024-02-28',
    guardian: 'Manuel Chissano'
  }
];

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesStatus = !selectedStatus || student.status === selectedStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'suspenso':
        return 'bg-red-100 text-red-800';
      case 'inativo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout 
      title="Gestão de Estudantes"
      subtitle="Gerir estudantes, matrículas e informações académicas"
    >
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="surface-card">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <p className="text-sm text-muted-foreground">Total de Estudantes</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="surface-card">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-foreground">1,205</div>
                <p className="text-sm text-muted-foreground">Estudantes Ativos</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="surface-card">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-foreground">32</div>
                <p className="text-sm text-muted-foreground">Turmas Ativas</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="surface-card">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-foreground">42</div>
                <p className="text-sm text-muted-foreground">Novos Este Mês</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filtros e ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="surface-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-foreground">Lista de Estudantes</CardTitle>
                  <CardDescription>
                    Gerir e visualizar informações dos estudantes
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                  <Button className="btn-hero gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Estudante
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Barra de pesquisa e filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              </div>

              {/* Tabela de estudantes */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Estudante</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Encarregado</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-foreground">{student.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium text-foreground">{student.class}</p>
                            <p className="text-muted-foreground">Turma {student.section}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-foreground">{student.guardian}</p>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${getStatusColor(student.status)} capitalize`}
                            variant="secondary"
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Histórico</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Suspender
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredStudents.length} de {mockStudents.length} estudantes
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm">
                    Próximo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}