import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, Clock, FileText, Trash2, Edit } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { Tables } from '@/integrations/supabase/types';

const subjectSchema = z.object({
  subject_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  subject_code: z.string().optional(),
  description: z.string().optional(),
  weekly_hours: z.number().min(1).max(20).default(2),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function Subjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Tables<'subjects'> | null>(null);
  
  const { data: subjects = [], isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const { toast } = useToast();

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      subject_name: '',
      subject_code: '',
      description: '',
      weekly_hours: 2,
    },
  });

  const filteredSubjects = subjects.filter(subject =>
    subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subject_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (subject?: Tables<'subjects'>) => {
    if (subject) {
      setEditingSubject(subject);
      form.reset({
        subject_name: subject.subject_name,
        subject_code: subject.subject_code || '',
        description: subject.description || '',
        weekly_hours: subject.weekly_hours || 2,
      });
    } else {
      setEditingSubject(null);
      form.reset({
        subject_name: '',
        subject_code: '',
        description: '',
        weekly_hours: 2,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: SubjectFormData) => {
    try {
      const defaultSchoolId = '00000000-0000-0000-0000-000000000000';
      
      const subjectData = {
        subject_name: data.subject_name,
        subject_code: data.subject_code || null,
        description: data.description || null,
        weekly_hours: data.weekly_hours,
        school_id: defaultSchoolId,
      };

      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          updates: subjectData,
        });
        toast({
          title: 'Sucesso',
          description: 'Disciplina atualizada com sucesso',
        });
      } else {
        await createSubject.mutateAsync(subjectData);
        toast({
          title: 'Sucesso',
          description: 'Disciplina criada com sucesso',
        });
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar disciplina',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta disciplina?')) {
      try {
        await deleteSubject.mutateAsync(id);
        toast({
          title: 'Sucesso',
          description: 'Disciplina eliminada com sucesso',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao eliminar disciplina',
          variant: 'destructive',
        });
      }
    }
  };

  const totalHours = filteredSubjects.reduce((sum, s) => sum + (s.weekly_hours || 0), 0);

  return (
    <MainLayout title="Disciplinas" subtitle="Gestão de disciplinas escolares">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Disciplinas</p>
                  <p className="text-3xl font-bold text-primary">{filteredSubjects.length}</p>
                </div>
                <BookOpen className="h-12 w-12 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Horas Semanais</p>
                  <p className="text-3xl font-bold text-secondary">{totalHours}h</p>
                </div>
                <Clock className="h-12 w-12 text-secondary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média Horas/Disciplina</p>
                  <p className="text-3xl font-bold text-accent">
                    {filteredSubjects.length > 0 
                      ? (totalHours / filteredSubjects.length).toFixed(1) 
                      : 0}h
                  </p>
                </div>
                <FileText className="h-12 w-12 text-accent opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar disciplinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Disciplina
          </Button>
        </div>

        {/* Lista de Disciplinas */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : filteredSubjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma disciplina encontrada' : 'Nenhuma disciplina cadastrada'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{subject.subject_name}</CardTitle>
                        {subject.subject_code && (
                          <Badge variant="outline" className="text-xs">
                            {subject.subject_code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(subject)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(subject.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {subject.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">{subject.weekly_hours || 2}h semanais</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dialog de Formulário */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Editar Disciplina' : 'Nova Disciplina'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Disciplina *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Matemática" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: MAT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weekly_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas Semanais</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição da disciplina..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createSubject.isPending || updateSubject.isPending}>
                    {createSubject.isPending || updateSubject.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
