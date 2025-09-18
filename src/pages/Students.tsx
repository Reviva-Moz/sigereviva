import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StudentCard } from '@/components/students/StudentCard';
import { StudentForm } from '@/components/students/StudentForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStudents } from '@/hooks/useStudents';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/database';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Calendar,
  Grid,
  List,
  Download,
  Loader2,
  Edit
} from 'lucide-react';

// Mock data for demonstration
const mockStudents = [
  {
    id: '1',
    full_name: 'Ana Maria Silva',
    email: 'ana.silva@estudante.sge.mz',
    phone: '+258 84 123 4567',
    student_number: '250001',
    status: 'ATIVO',
    photo_url: null,
    enrollment_date: '2024-02-15',
    emergency_contact_name: 'João Silva',
    emergency_contact_phone: '+258 84 987 6543',
    date_of_birth: '2006-05-12',
    gender: 'FEMININO',
    id_number: '12345 67890 123',
    address: 'Rua das Flores, 123, Maputo',
    health_info: 'Alergia a amendoim',
    school_id: '00000000-0000-0000-0000-000000000000',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  } as Student,
  {
    id: '2',
    full_name: 'Carlos Alberto Mendes',
    email: 'carlos.mendes@estudante.sge.mz',
    phone: '+258 84 234 5678',
    student_number: '250002',
    status: 'ATIVO',
    photo_url: null,
    enrollment_date: '2024-01-20',
    emergency_contact_name: 'Maria Mendes',
    emergency_contact_phone: '+258 84 876 5432',
    date_of_birth: '2007-03-08',
    gender: 'MASCULINO',
    id_number: '23456 78901 234',
    address: 'Avenida Julius Nyerere, 456, Maputo',
    health_info: null,
    school_id: '00000000-0000-0000-0000-000000000000',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  } as Student,
];

export function Students() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  // Fetch students data
  const { data: studentsData, isLoading, error } = useStudents();
  
  // Use mock data as fallback or when no data
  const students = studentsData || mockStudents;

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.student_number.includes(searchTerm);
      
      const matchesClass = selectedClass === 'all' || true; // TODO: Add class filtering when class data is available
      const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
      
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, selectedClass, selectedStatus]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'ATIVO').length;
    const newThisMonth = students.filter(s => {
      const enrollmentDate = new Date(s.enrollment_date || '');
      const now = new Date();
      return enrollmentDate.getMonth() === now.getMonth() && 
             enrollmentDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      total: totalStudents,
      active: activeStudents,
      classes: 32, // Mock data
      newThisMonth
    };
  }, [students]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'INATIVO':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'TRANSFERIDO':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'GRADUADO':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const handleViewStudent = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
  };

  return (
    <MainLayout title="Gestão de Educandos" subtitle="Administrar estudantes da escola">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total de Educandos</p>
                    <p className="text-2xl font-bold text-foreground">{statistics.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Educandos Ativos</p>
                    <p className="text-2xl font-bold text-foreground">{statistics.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Turmas Ativas</p>
                    <p className="text-2xl font-bold text-foreground">{statistics.classes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Novos Este Mês</p>
                    <p className="text-2xl font-bold text-foreground">{statistics.newThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Header with Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar educandos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  <SelectItem value="10A">10ª Classe A</SelectItem>
                  <SelectItem value="10B">10ª Classe B</SelectItem>
                  <SelectItem value="11A">11ª Classe A</SelectItem>
                  <SelectItem value="12A">12ª Classe A</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INATIVO">Inativo</SelectItem>
                  <SelectItem value="TRANSFERIDO">Transferido</SelectItem>
                  <SelectItem value="GRADUADO">Graduado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" className="flex-1 lg:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 lg:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Educando
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <StudentForm
                  onSuccess={() => setIsAddDialogOpen(false)}
                  onCancel={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Students Content */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Carregando educandos...</p>
            </div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p>Erro ao carregar educandos: {error.message}</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum educando encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedClass !== 'all' || selectedStatus !== 'all'
                    ? 'Nenhum educando corresponde aos filtros aplicados.'
                    : 'Ainda não há educandos cadastrados no sistema.'}
                </p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Educando
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <StudentForm
                      onSuccess={() => setIsAddDialogOpen(false)}
                      onCancel={() => setIsAddDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map((student, index) => (
              <StudentCard
                key={student.id}
                student={student}
                onView={handleViewStudent}
                onEdit={handleEditStudent}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Educando</th>
                      <th className="text-left p-4 font-medium">Contacto</th>
                      <th className="text-left p-4 font-medium">Turma</th>
                      <th className="text-left p-4 font-medium">Encarregado</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="w-[50px] p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr 
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b hover:bg-muted/30 cursor-pointer"
                        onClick={() => handleViewStudent(student)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photo_url || ''} alt={student.full_name} />
                              <AvatarFallback className="text-xs">
                                {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-sm text-muted-foreground">#{student.student_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {student.phone && <p className="text-sm">{student.phone}</p>}
                            {student.email && <p className="text-sm text-muted-foreground truncate max-w-[200px]">{student.email}</p>}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">10ª Classe A</Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {student.emergency_contact_name && (
                              <p className="text-sm">{student.emergency_contact_name}</p>
                            )}
                            {student.emergency_contact_phone && (
                              <p className="text-sm text-muted-foreground">{student.emergency_contact_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(student.status || 'ATIVO')}>
                            {student.status || 'ATIVO'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStudent(student);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingStudent && (
            <StudentForm
              student={editingStudent}
              onSuccess={() => setEditingStudent(null)}
              onCancel={() => setEditingStudent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}