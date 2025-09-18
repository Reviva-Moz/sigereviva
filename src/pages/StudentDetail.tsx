import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StudentProfile } from '@/components/students/StudentProfile';
import { useStudent } from '@/hooks/useStudents';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading, error } = useStudent(id!);

  if (isLoading) {
    return (
      <MainLayout title="Carregando..." subtitle="Obtendo dados do educando">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando dados do educando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !student) {
    return (
      <MainLayout title="Erro" subtitle="Educando não encontrado">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">
                {error?.message || 'Educando não encontrado'}
              </p>
              <Button onClick={() => navigate('/students')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={student.full_name}
      subtitle={`Perfil do Educando #${student.student_number}`}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/students')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <StudentProfile student={student} />
      </div>
    </MainLayout>
  );
}