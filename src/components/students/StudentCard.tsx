import React from 'react';
import { Student } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, MoreHorizontal, Phone, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentCardProps {
  student: Student;
  onView?: (student: Student) => void;
  onEdit?: (student: Student) => void;
  index?: number;
}

export function StudentCard({ student, onView, onEdit, index = 0 }: StudentCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group" onClick={() => onView?.(student)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={student.photo_url || ''} alt={student.full_name} />
                <AvatarFallback className="text-sm">
                  {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {student.full_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  #{student.student_number}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onView?.(student);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(student);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2 mb-4">
            {student.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span className="truncate">{student.phone}</span>
              </div>
            )}
            {student.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{student.email}</span>
              </div>
            )}
            {student.emergency_contact_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate">{student.emergency_contact_name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(student.status || 'ATIVO')}>
              {student.status || 'ATIVO'}
            </Badge>
            
            {student.enrollment_date && (
              <span className="text-xs text-muted-foreground">
                Desde {new Date(student.enrollment_date).toLocaleDateString('pt-MZ')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}