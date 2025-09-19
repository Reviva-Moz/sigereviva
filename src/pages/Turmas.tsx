import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { TurmaCard } from '@/components/turmas/TurmaCard';
import { TurmaForm } from '@/components/turmas/TurmaForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTurmas, useDeleteTurma } from '@/hooks/useTurmas';
import { useClasses } from '@/hooks/useClasses';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Turma = Tables<'turmas'> & {
  class?: Tables<'classes'>;
  academic_year?: Tables<'academic_years'>;
  enrollments?: Tables<'student_enrollments'>[];
};

export default function Turmas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  
  const { toast } = useToast();
  const { data: turmas, isLoading } = useTurmas();
  const { data: classes } = useClasses();
  const deleteTurma = useDeleteTurma();

  // Buscar anos letivos para o formulário
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

  const filteredTurmas = turmas?.filter((turma) =>
    turma.turma_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.class?.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.classroom?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (turma: Turma) => {
    setSelectedTurma(turma);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      try {
        await deleteTurma.mutateAsync(id);
        toast({
          title: 'Sucesso',
          description: 'Turma excluída com sucesso',
        });
      } catch (error) {
        console.error('Erro ao excluir turma:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedTurma(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedTurma(null);
  };

  // Calcular estatísticas
  const totalStudents = turmas?.reduce((sum, turma) => 
    sum + (turma.enrollments?.length || turma.current_students || 0), 0
  ) || 0;

  const totalCapacity = turmas?.reduce((sum, turma) => 
    sum + (turma.max_capacity || 0), 0
  ) || 0;

  const averageOccupancy = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

  return (
    <MainLayout title="Turmas" subtitle="Gestão de turmas e salas de aula">
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar turmas..."
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
              Nova Turma
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {turmas?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total de Turmas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {totalStudents}
              </div>
              <p className="text-sm text-muted-foreground">Total de Estudantes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {totalCapacity}
              </div>
              <p className="text-sm text-muted-foreground">Capacidade Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {averageOccupancy.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Ocupação Média</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de turmas */}
        {isLoading ? (
          <div className="text-center py-8">Carregando turmas...</div>
        ) : filteredTurmas.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, staggerChildren: 0.1 }}
          >
            {filteredTurmas.map((turma) => (
              <TurmaCard
                key={turma.id}
                turma={turma}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Dialog do formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTurma ? 'Editar Turma' : 'Nova Turma'}
            </DialogTitle>
          </DialogHeader>
          <TurmaForm
            turma={selectedTurma || undefined}
            classes={classes || []}
            academicYears={academicYears || []}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}