import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEnrollments, useCreateEnrollment, useDeleteEnrollment } from '@/hooks/useEnrollments';
import { useStudents } from '@/hooks/useStudents';
import { useTurmas } from '@/hooks/useTurmas';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Search, 
  UserPlus, 
  GraduationCap, 
  Users,
  Calendar,
  Filter,
  Download,
  Trash2
} from 'lucide-react';

const enrollmentSchema = z.object({
  student_id: z.string().min(1, 'Selecione um educando'),
  turma_id: z.string().min(1, 'Selecione uma turma'),
  academic_year_id: z.string().min(1, 'Selecione um ano letivo'),
  enrollment_date: z.string().optional(),
  status: z.string().default('ATIVO'),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export default function Enrollments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { data: enrollments, isLoading } = useEnrollments();
  const { data: students } = useStudents();
  const { data: turmas } = useTurmas();
  const createEnrollment = useCreateEnrollment();
  const deleteEnrollment = useDeleteEnrollment();

  const { data: academicYears } = useSupabaseQuery(
    ['academic_years'],
    async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('is_current', { ascending: false })
        .order('year_name', { ascending: false });
      return { data, error };
    }
  );

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      status: 'ATIVO',
      enrollment_date: new Date().toISOString().split('T')[0],
    },
  });

  const filteredEnrollments = enrollments?.filter((enrollment) => {
    const matchesSearch = 
      enrollment.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student?.student_number?.includes(searchTerm);
    const matchesTurma = selectedTurma === 'all' || enrollment.turma_id === selectedTurma;
    const matchesYear = selectedYear === 'all' || enrollment.academic_year_id === selectedYear;
    
    return matchesSearch && matchesTurma && matchesYear;
  }) || [];

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      await createEnrollment.mutateAsync({
        student_id: data.student_id,
        turma_id: data.turma_id,
        academic_year_id: data.academic_year_id,
        enrollment_date: data.enrollment_date || new Date().toISOString().split('T')[0],
        status: data.status,
      });
      
      toast({
        title: 'Sucesso',
        description: 'Matrícula realizada com sucesso',
      });
      
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta matrícula?')) {
      try {
        await deleteEnrollment.mutateAsync(id);
        toast({
          title: 'Sucesso',
          description: 'Matrícula cancelada com sucesso',
        });
      } catch (error) {
        console.error('Erro ao deletar matrícula:', error);
      }
    }
  };

  const currentYearEnrollments = enrollments?.filter(e => 
    e.academic_year?.is_current && e.status === 'ATIVO'
  ).length || 0;

  const totalActive = enrollments?.filter(e => e.status === 'ATIVO').length || 0;
  const totalInactive = enrollments?.filter(e => e.status === 'INATIVO').length || 0;

  return (
    <MainLayout title="Matrículas" subtitle="Gestão de matrículas e inscrições de educandos">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 text-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Total de Matrículas</p>
                  <p className="text-2xl font-bold">{enrollments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-4 w-4 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Ano Letivo Atual</p>
                  <p className="text-2xl font-bold">{currentYearEnrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Matrículas Ativas</p>
                  <p className="text-2xl font-bold">{totalActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Matrículas Inativas</p>
                  <p className="text-2xl font-bold">{totalInactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar educandos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {turmas?.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.turma_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ano Letivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <Button variant="outline" className="flex-1 lg:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 lg:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Matrícula
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nova Matrícula</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="student_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Educando</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um educando" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {students?.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.full_name} (#{student.student_number})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="turma_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Turma</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma turma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {turmas?.map((turma) => (
                                <SelectItem key={turma.id} value={turma.id}>
                                  {turma.turma_name} - {turma.class?.class_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="academic_year_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano Letivo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um ano letivo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {academicYears?.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.year_name} {year.is_current && '(Atual)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enrollment_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Matrícula</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createEnrollment.isPending}>
                        {createEnrollment.isPending ? 'Salvando...' : 'Matricular'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de Matrículas */}
        {isLoading ? (
          <div className="text-center py-8">Carregando matrículas...</div>
        ) : filteredEnrollments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma matrícula encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedTurma !== 'all' || selectedYear !== 'all'
                    ? 'Nenhuma matrícula corresponde aos filtros aplicados.'
                    : 'Ainda não há matrículas cadastradas.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Educando</th>
                      <th className="text-left p-4 font-medium">Turma</th>
                      <th className="text-left p-4 font-medium">Ano Letivo</th>
                      <th className="text-left p-4 font-medium">Data Matrícula</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="w-[50px] p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrollments.map((enrollment, index) => (
                      <motion.tr
                        key={enrollment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b hover:bg-muted/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={enrollment.student?.photo_url || ''} />
                              <AvatarFallback className="text-xs">
                                {enrollment.student?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{enrollment.student?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                #{enrollment.student?.student_number}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {enrollment.turma?.turma_name}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span>{enrollment.academic_year?.year_name}</span>
                            {enrollment.academic_year?.is_current && (
                              <Badge variant="default" className="text-xs">Atual</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {enrollment.enrollment_date ? 
                            new Date(enrollment.enrollment_date).toLocaleDateString('pt-MZ') : 
                            '-'
                          }
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={enrollment.status === 'ATIVO' ? 'default' : 'secondary'}
                            className={
                              enrollment.status === 'ATIVO' 
                                ? 'bg-green-500/10 text-green-700 border-green-200' 
                                : 'bg-gray-500/10 text-gray-700 border-gray-200'
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(enrollment.id)}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
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
    </MainLayout>
  );
}
