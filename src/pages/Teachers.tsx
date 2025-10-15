import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { TeacherCard } from '@/components/teachers/TeacherCard';
import { TeacherForm } from '@/components/teachers/TeacherForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTeachers, useDeleteTeacher } from '@/hooks/useTeachers';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Teacher = Tables<'teachers'> & {
  profile?: Tables<'profiles'>;
};

export default function Teachers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  const { toast } = useToast();
  const { data: teachers, isLoading } = useTeachers();
  const deleteTeacher = useDeleteTeacher();

  // Buscar perfis para o formulário
  const { data: profiles } = useSupabaseQuery(
    ['profiles'],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      return { data, error };
    }
  );

  const { data: schools } = useSupabaseQuery(
    ['schools'],
    async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      return { data, error };
    }
  );

  const filteredTeachers = teachers?.filter((teacher) =>
    teacher.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.qualification?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este professor?')) {
      try {
        await deleteTeacher.mutateAsync(id);
        toast({
          title: 'Sucesso',
          description: 'Professor excluído com sucesso',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao excluir professor',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedTeacher(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedTeacher(null);
  };

  return (
    <MainLayout title="Professores" subtitle="Gestão do corpo docente">
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar professores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Professor
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {teachers?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total de Professores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {teachers?.filter(t => t.status === 'ATIVO').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Professores Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {teachers?.filter(t => t.status === 'INATIVO').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Professores Inativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {teachers?.filter(t => t.salary).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Com Salário Definido</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de professores */}
        {isLoading ? (
          <div className="text-center py-8">Carregando professores...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, staggerChildren: 0.1 }}
          >
            {filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Dialog do formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTeacher ? 'Editar Professor' : 'Novo Professor'}
            </DialogTitle>
          </DialogHeader>
          <TeacherForm
            teacher={selectedTeacher || undefined}
            profiles={profiles || []}
            schools={schools || []}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}