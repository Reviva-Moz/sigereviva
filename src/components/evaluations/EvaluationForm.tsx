import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GradeInput } from '@/components/shared/GradeInput';
import { useCreateEvaluation, useUpdateEvaluation, Evaluation } from '@/hooks/useEvaluations';
import { useStudents } from '@/hooks/useStudents';
import { Loader2, Save } from 'lucide-react';

const evaluationSchema = z.object({
  student_id: z.string().uuid('Selecione um educando'),
  teacher_assignment_id: z.string().uuid('Selecione uma disciplina'),
  trimester: z.number().int().min(1).max(3),
  grade: z.number().min(0).max(20, 'Nota deve estar entre 0 e 20'),
  evaluation_type: z.string().min(1),
  evaluation_date: z.string().optional(),
  notes: z.string().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

interface EvaluationFormProps {
  evaluation?: Evaluation;
  teacherAssignments: Array<{
    id: string;
    subjects?: { subject_name: string };
    turmas?: { turma_name: string };
  }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EvaluationForm({ evaluation, teacherAssignments, onSuccess, onCancel }: EvaluationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: students = [] } = useStudents();
  const createEvaluation = useCreateEvaluation();
  const updateEvaluation = useUpdateEvaluation();

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      student_id: evaluation?.student_id || '',
      teacher_assignment_id: evaluation?.teacher_assignment_id || '',
      trimester: evaluation?.trimester || 1,
      grade: evaluation?.grade || 0,
      evaluation_type: evaluation?.evaluation_type || 'EXAME',
      evaluation_date: evaluation?.evaluation_date || new Date().toISOString().split('T')[0],
      notes: evaluation?.notes || '',
    },
  });

  const onSubmit = async (data: EvaluationFormData) => {
    setIsLoading(true);
    try {
      if (evaluation) {
        await updateEvaluation.mutateAsync({ id: evaluation.id, ...data } as any);
      } else {
        await createEvaluation.mutateAsync(data as any);
      }
      onSuccess?.();
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{evaluation ? 'Editar Avaliação' : 'Lançar Nova Avaliação'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educando</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar educando" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.full_name} - {student.student_number}
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
                  name="teacher_assignment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina / Turma</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar disciplina" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teacherAssignments.map((assignment) => (
                            <SelectItem key={assignment.id} value={assignment.id}>
                              {assignment.subjects?.subject_name} - {assignment.turmas?.turma_name}
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
                  name="trimester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trimestre</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1º Trimestre</SelectItem>
                          <SelectItem value="2">2º Trimestre</SelectItem>
                          <SelectItem value="3">3º Trimestre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evaluation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Avaliação</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EXAME">Exame</SelectItem>
                          <SelectItem value="MAC">MAC (Mini Avaliação Contínua)</SelectItem>
                          <SelectItem value="TESTE">Teste</SelectItem>
                          <SelectItem value="TRABALHO">Trabalho</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Nota (0-20)</FormLabel>
                      <FormControl>
                        <GradeInput
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evaluation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Avaliação</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações sobre a avaliação..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 justify-end">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  {evaluation ? 'Atualizar' : 'Registar'} Avaliação
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
