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
import { Textarea } from '@/components/ui/textarea';
import { useCreateTeacher, useUpdateTeacher } from '@/hooks/useTeachers';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import { CurrencyInput } from '@/components/shared/CurrencyInput';

const teacherSchema = z.object({
  profile_id: z.string().min(1, 'Perfil é obrigatório'),
  school_id: z.string().min(1, 'Escola é obrigatória'),
  employee_number: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  hire_date: z.string().optional(),
  salary: z.string().optional(),
  status: z.string().default('ATIVO'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  teacher?: Tables<'teachers'>;
  profiles: Tables<'profiles'>[];
  schools: Tables<'schools'>[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TeacherForm({ teacher, profiles, schools, onSuccess, onCancel }: TeacherFormProps) {
  const { toast } = useToast();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      profile_id: teacher?.profile_id || '',
      school_id: teacher?.school_id || '',
      employee_number: teacher?.employee_number || '',
      qualification: teacher?.qualification || '',
      specialization: teacher?.specialization || '',
      hire_date: teacher?.hire_date || '',
      salary: teacher?.salary ? teacher.salary.toString() : '',
      status: teacher?.status || 'ATIVO',
    },
  });

  const onSubmit = async (data: TeacherFormData) => {
    try {
      const teacherData = {
        profile_id: data.profile_id,
        school_id: data.school_id,
        employee_number: data.employee_number || null,
        qualification: data.qualification || null,
        specialization: data.specialization || null,
        salary: data.salary ? parseFloat(String(data.salary)) : null,
        hire_date: data.hire_date || null,
        status: data.status || 'ATIVO',
      };

      if (teacher) {
        await updateTeacher.mutateAsync({
          id: teacher.id,
          updates: teacherData,
        });
        toast({
          title: 'Sucesso',
          description: 'Professor atualizado com sucesso',
        });
      } else {
        await createTeacher.mutateAsync(teacherData);
        toast({
          title: 'Sucesso',
          description: 'Professor criado com sucesso',
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
    }
  };

  const isLoading = createTeacher.isPending || updateTeacher.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {teacher ? 'Editar Professor' : 'Novo Professor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.full_name}
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
                  name="school_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escola</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma escola" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
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
                  name="employee_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Funcionário</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: PROF001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Contratação</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salário (MZN)</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={String(field.value || '')}
                          onChange={(value) => field.onChange(value)}
                          placeholder="0,00 MZN"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ATIVO">Ativo</SelectItem>
                          <SelectItem value="INATIVO">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualificação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Licenciatura em Matemática..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialização</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Metodologias de Ensino..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
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
                  {isLoading ? 'Salvando...' : teacher ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}