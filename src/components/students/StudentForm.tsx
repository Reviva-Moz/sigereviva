import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/types/database';
import { useCreateStudent, useUpdateStudent } from '@/hooks/useStudents';
import { MozambiqueInput } from '@/components/shared/MozambiqueInput';
import { biValidator, phoneValidator } from '@/lib/validators/mozambique';
import { useUserSchool } from '@/hooks/useUserSchool';

const studentSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['MASCULINO', 'FEMININO']).optional(),
  id_number: biValidator,
  phone: phoneValidator,
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: phoneValidator,
  health_info: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(student?.photo_url || '');
  const [isUploading, setIsUploading] = useState(false);

  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const { data: userSchoolId, isLoading: isLoadingSchool } = useUserSchool();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: student?.full_name || '',
      date_of_birth: student?.date_of_birth || '',
      gender: student?.gender as 'MASCULINO' | 'FEMININO' || undefined,
      id_number: student?.id_number || '',
      phone: student?.phone || '',
      email: student?.email || '',
      address: student?.address || '',
      emergency_contact_name: student?.emergency_contact_name || '',
      emergency_contact_phone: student?.emergency_contact_phone || '',
      health_info: student?.health_info || '',
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'A foto deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File, studentId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}.${fileExt}`;
    const filePath = `students/${fileName}`;

    const { error } = await supabase.storage
      .from('student-photos')
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload da foto',
        variant: 'destructive',
      });
      return null;
    }

    const { data } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const generateStudentNumber = async (schoolId: string): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_student_number', {
      school_id_param: schoolId
    });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar número de educando',
        variant: 'destructive',
      });
      return Date.now().toString(); // Fallback
    }

    return data;
  };

  const onSubmit = async (data: StudentFormData) => {
    if (!userSchoolId) {
      toast({
        title: 'Erro',
        description: 'Não foi possível identificar a escola do usuário',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      let photoUrl = student?.photo_url || '';

      if (student) {
        // Update existing student
        if (photoFile) {
          const uploadedUrl = await uploadPhoto(photoFile, student.id);
          if (uploadedUrl) photoUrl = uploadedUrl;
        }

        await updateStudentMutation.mutateAsync({
          id: student.id,
          updates: { ...data, photo_url: photoUrl }
        });

        toast({
          title: 'Sucesso',
          description: 'Educando atualizado com sucesso',
        });
      } else {
        // Create new student
        const studentNumber = await generateStudentNumber(userSchoolId);

        const newStudent = await createStudentMutation.mutateAsync({
          full_name: data.full_name,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender || null,
          id_number: data.id_number || null,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          health_info: data.health_info || null,
          student_number: studentNumber,
          school_id: userSchoolId,
          photo_url: '',
          status: 'ATIVO',
          enrollment_date: new Date().toISOString().split('T')[0],
        });

        if (photoFile && newStudent) {
          const uploadedUrl = await uploadPhoto(photoFile, newStudent.id);
          if (uploadedUrl) {
            await updateStudentMutation.mutateAsync({
              id: newStudent.id,
              updates: { photo_url: uploadedUrl }
            });
          }
        }

        toast({
          title: 'Sucesso',
          description: 'Educando cadastrado com sucesso',
        });
      }

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar educando',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {student ? 'Editar Educando' : 'Cadastrar Novo Educando'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview} alt="Foto do educando" />
              <AvatarFallback className="text-lg">
                {form.watch('full_name')?.split(' ').map(n => n[0]).join('').toUpperCase() || 'FE'}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Alterar Foto
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Informações Pessoais</h3>
              
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  {...form.register('full_name')}
                  placeholder="Nome completo do educando"
                />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...form.register('date_of_birth')}
                />
              </div>

              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select value={form.watch('gender')} onValueChange={(value) => form.setValue('gender', value as 'MASCULINO' | 'FEMININO')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <MozambiqueInput
                  id="id_number"
                  label="Número do BI"
                  mask="BI"
                  value={form.watch('id_number') || ''}
                  onChange={(value) => form.setValue('id_number', value)}
                  error={form.formState.errors.id_number?.message}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Informações de Contacto</h3>
              
              <div>
                <MozambiqueInput
                  id="phone"
                  label="Telefone"
                  mask="PHONE"
                  value={form.watch('phone') || ''}
                  onChange={(value) => form.setValue('phone', value)}
                  error={form.formState.errors.phone?.message}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="email@exemplo.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  {...form.register('address')}
                  placeholder="Endereço completo"
                  rows={3}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Contacto de Emergência</h3>
              
              <div>
                <Label htmlFor="emergency_contact_name">Nome do Encarregado</Label>
                <Input
                  id="emergency_contact_name"
                  {...form.register('emergency_contact_name')}
                  placeholder="Nome do encarregado de educação"
                />
              </div>

              <div>
                <MozambiqueInput
                  id="emergency_contact_phone"
                  label="Telefone do Encarregado"
                  mask="PHONE"
                  value={form.watch('emergency_contact_phone') || ''}
                  onChange={(value) => form.setValue('emergency_contact_phone', value)}
                  error={form.formState.errors.emergency_contact_phone?.message}
                />
              </div>
            </div>

            {/* Health Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Informações de Saúde</h3>
              
              <div>
                <Label htmlFor="health_info">Observações Médicas</Label>
                <Textarea
                  id="health_info"
                  {...form.register('health_info')}
                  placeholder="Alergias, medicamentos, condições especiais..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="submit"
              disabled={isUploading || createStudentMutation.isPending || updateStudentMutation.isPending || isLoadingSchool}
              className="sm:ml-auto"
            >
              {(isUploading || createStudentMutation.isPending || updateStudentMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              {student ? 'Atualizar' : 'Cadastrar'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}