import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTurma, useUpdateTurma } from '@/hooks/useTurmas';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

const turmaSchema = z.object({
  turma_name: z.string().min(1, 'Nome da turma é obrigatório'),
  class_id: z.string().min(1, 'Classe é obrigatória'),
  academic_year_id: z.string().min(1, 'Ano letivo é obrigatório'),
  classroom: z.string().optional(),
  max_capacity: z.number().min(1, 'Capacidade deve ser maior que 0').max(100, 'Capacidade máxima de 100 estudantes'),
});

type TurmaFormData = z.infer<typeof turmaSchema>;

interface TurmaFormProps {
  turma?: Tables<'turmas'>;
  classes: Tables<'classes'>[];
  academicYears: Tables<'academic_years'>[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TurmaForm({ turma, classes, academicYears, onSuccess, onCancel }: TurmaFormProps) {
  const { toast } = useToast();
  const createTurma = useCreateTurma();
  const updateTurma = useUpdateTurma();

  const form = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      turma_name: turma?.turma_name || '',
      class_id: turma?.class_id || '',
      academic_year_id: turma?.academic_year_id || '',
      classroom: turma?.classroom || '',
      max_capacity: turma?.max_capacity || 30,
    },
  });

  const onSubmit = async (data: TurmaFormData) => {
    try {
      const turmaData = {
        turma_name: data.turma_name,
        class_id: data.class_id,
        academic_year_id: data.academic_year_id,
        classroom: data.classroom || null,
        max_capacity: data.max_capacity,
      };

      if (turma) {
        await updateTurma.mutateAsync({
          id: turma.id,
          updates: turmaData,
        });
        toast({
          title: 'Sucesso',
          description: 'Turma atualizada com sucesso',
        });
      } else {
        await createTurma.mutateAsync(turmaData);
        toast({
          title: 'Sucesso',
          description: 'Turma criada com sucesso',
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
    }
  };

  const isLoading = createTurma.isPending || updateTurma.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {turma ? 'Editar Turma' : 'Nova Turma'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="turma_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Turma</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 10ª A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma classe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((classe) => (
                          <SelectItem key={classe.id} value={classe.id}>
                            {classe.class_name} ({classe.grade_level}ª classe)
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
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.year_name}
                            {year.is_current && ' (Atual)'}
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
                name="classroom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala de Aula</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sala 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade Máxima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : turma ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}