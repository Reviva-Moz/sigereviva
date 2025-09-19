import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  GraduationCap,
  Calendar
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Teacher = Tables<'teachers'> & {
  profile?: Tables<'profiles'>;
};

interface TeacherCardProps {
  teacher: Teacher;
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (id: string) => void;
  onView?: (teacher: Teacher) => void;
}

export function TeacherCard({ teacher, onEdit, onDelete, onView }: TeacherCardProps) {
  const profile = teacher.profile;
  const initials = profile?.full_name
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || 'PR';

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-MZ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">
                {profile?.full_name || 'Nome não informado'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {teacher.employee_number || 'Sem número'}
              </p>
              <Badge 
                variant={teacher.status === 'ATIVO' ? 'default' : 'secondary'}
                className="mt-1"
              >
                {teacher.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {profile?.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}
            
            {teacher.qualification && (
              <div className="flex items-center space-x-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{teacher.qualification}</span>
              </div>
            )}
            
            {teacher.hire_date && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Contratado em {formatDate(teacher.hire_date)}</span>
              </div>
            )}
          </div>

          {teacher.salary && (
            <div className="text-sm">
              <span className="font-medium">Salário: </span>
              <span className="text-primary font-semibold">
                {formatCurrency(teacher.salary)}
              </span>
            </div>
          )}

          {teacher.specialization && (
            <div className="text-sm">
              <span className="font-medium">Especialização:</span>
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                {teacher.specialization}
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(teacher)}
              className="flex-1 mr-2"
            >
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(teacher)}
              className="mr-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(teacher.id)}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}