import React, { useState } from 'react';
import { Student } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { StudentForm } from './StudentForm';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Heart, 
  Edit,
  Download,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StudentProfileProps {
  student: Student;
}

export function StudentProfile({ student }: StudentProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'INATIVO':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'TRANSFERIDO':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'GRADUADO':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const InfoItem = ({ icon: Icon, label, value, className = "" }: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
    className?: string;
  }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-card/50 ${className}`}>
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground mt-1 break-words">
          {value || 'Não informado'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 mx-auto sm:mx-0">
              <AvatarImage src={student.photo_url || ''} alt={student.full_name} />
              <AvatarFallback className="text-lg">
                {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{student.full_name}</h1>
                <p className="text-muted-foreground">Número do Educando: {student.student_number}</p>
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge className={getStatusColor(student.status || 'ATIVO')}>
                  {student.status || 'ATIVO'}
                </Badge>
                {student.enrollment_date && (
                  <Badge variant="outline">
                    Matriculado em {format(new Date(student.enrollment_date), 'dd/MM/yyyy')}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <StudentForm
                    student={student}
                    onSuccess={() => setIsEditDialogOpen(false)}
                    onCancel={() => setIsEditDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoItem
              icon={Calendar}
              label="Data de Nascimento"
              value={student.date_of_birth ? format(new Date(student.date_of_birth), 'dd/MM/yyyy', { locale: ptBR }) : undefined}
            />
            <InfoItem
              icon={User}
              label="Gênero"
              value={student.gender}
            />
            <InfoItem
              icon={FileText}
              label="Número do BI"
              value={student.id_number}
            />
            <InfoItem
              icon={MapPin}
              label="Endereço"
              value={student.address}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoItem
              icon={Phone}
              label="Telefone"
              value={student.phone}
            />
            <InfoItem
              icon={Mail}
              label="Email"
              value={student.email}
            />
            <Separator className="my-4" />
            <InfoItem
              icon={UserPlus}
              label="Encarregado de Educação"
              value={student.emergency_contact_name}
            />
            <InfoItem
              icon={Phone}
              label="Telefone do Encarregado"
              value={student.emergency_contact_phone}
            />
          </CardContent>
        </Card>

        {/* Health Information */}
        {student.health_info && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Informações de Saúde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-card/50 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {student.health_info}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Academic Information - Placeholder for future implementation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Académicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Informações académicas serão exibidas aqui</p>
              <p className="text-sm">Turmas, disciplinas, notas e frequência</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}