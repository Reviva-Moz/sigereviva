import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Plus, Download, TrendingUp, Award, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { getGradeClassification } from '@/lib/validators/mozambique';
import { useEvaluations, useEvaluationStats, useDeleteEvaluation } from '@/hooks/useEvaluations';
import { EvaluationForm } from '@/components/evaluations/EvaluationForm';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Evaluations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTrimester, setSelectedTrimester] = useState<number | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<any>(null);

  // Buscar atribuições do professor
  const { data: teacherAssignments = [] } = useSupabaseQuery(
    ['teacher-assignments', user?.id],
    async () => {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select(`
          id,
          subjects(subject_name),
          turmas(turma_name)
        `);
      return { data, error };
    }
  );

  const { data: evaluations = [], isLoading } = useEvaluations({ trimester: selectedTrimester });
  const { data: stats } = useEvaluationStats({ trimester: selectedTrimester });
  const deleteEvaluation = useDeleteEvaluation();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta avaliação?')) {
      await deleteEvaluation.mutateAsync(id);
    }
  };

  return (
    <MainLayout title="Avaliações e Notas" subtitle="Sistema de avaliação moçambicano (0-20)">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Este trimestre</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.average.toFixed(1) || '0.0'}</div>
                <p className="text-xs text-muted-foreground">Escala 0-20</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.passRate.toFixed(1) || '0.0'}%</div>
                <p className="text-xs text-muted-foreground">{stats?.passed || 0} aprovados</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excelentes</CardTitle>
                <Award className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.excellent || 0}</div>
                <p className="text-xs text-muted-foreground">Notas ≥ 16</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select 
              value={selectedTrimester?.toString() || 'all'} 
              onValueChange={(value) => setSelectedTrimester(value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar trimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os trimestres</SelectItem>
                <SelectItem value="1">1º Trimestre</SelectItem>
                <SelectItem value="2">2º Trimestre</SelectItem>
                <SelectItem value="3">3º Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Pautas
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Lançar Nota
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <EvaluationForm
                  teacherAssignments={teacherAssignments}
                  onSuccess={() => setIsAddDialogOpen(false)}
                  onCancel={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabela de Avaliações */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : evaluations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma avaliação registada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Educando</TableHead>
                    <TableHead>Disciplina</TableHead>
                    <TableHead>Trimestre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.map((evaluation, index) => {
                    const classification = getGradeClassification(evaluation.grade);
                    return (
                      <motion.tr
                        key={evaluation.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="font-medium">
                          {evaluation.students?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {evaluation.teacher_assignments?.subjects?.subject_name || 'N/A'}
                        </TableCell>
                        <TableCell>{evaluation.trimester}º Trimestre</TableCell>
                        <TableCell>
                          <Badge variant="outline">{evaluation.evaluation_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${classification.color}`}>
                            {evaluation.grade.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={classification.passed ? 'default' : 'destructive'}
                            className={classification.passed ? 'bg-green-500' : ''}
                          >
                            {classification.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(evaluation.evaluation_date).toLocaleDateString('pt-MZ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingEvaluation(evaluation);
                                setIsAddDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(evaluation.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Legenda do Sistema de Avaliação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Sistema de Avaliação Moçambicano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="font-bold text-green-600 text-lg">16-20</div>
                <div className="text-sm text-muted-foreground">Excelente</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600 text-lg">14-15.5</div>
                <div className="text-sm text-muted-foreground">Bom</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600 text-lg">10-13.5</div>
                <div className="text-sm text-muted-foreground">Suficiente</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-600 text-lg">5-9.5</div>
                <div className="text-sm text-muted-foreground">Insuficiente</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600 text-lg">0-4.5</div>
                <div className="text-sm text-muted-foreground">Mau</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
