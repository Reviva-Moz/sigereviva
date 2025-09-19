import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Users, 
  MapPin,
  BookOpen,
  Calendar
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Turma = Tables<'turmas'> & {
  class?: Tables<'classes'>;
  academic_year?: Tables<'academic_years'>;
  enrollments?: Tables<'student_enrollments'>[];
};

interface TurmaCardProps {
  turma: Turma;
  onEdit?: (turma: Turma) => void;
  onDelete?: (id: string) => void;
  onView?: (turma: Turma) => void;
}

export function TurmaCard({ turma, onEdit, onDelete, onView }: TurmaCardProps) {
  const currentStudents = turma.enrollments?.length || turma.current_students || 0;
  const maxCapacity = turma.max_capacity || 30;
  const occupancyPercentage = (currentStudents / maxCapacity) * 100;

  const getOccupancyColor = () => {
    if (occupancyPercentage >= 90) return 'text-destructive';
    if (occupancyPercentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
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
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">
                {turma.turma_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {turma.class?.class_name} - {turma.class?.grade_level}ª classe
              </p>
            </div>
            <Badge variant="outline" className="ml-2">
              {turma.academic_year?.year_name}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className={getOccupancyColor()}>
                {currentStudents} / {maxCapacity} estudantes
              </span>
              <span className="text-xs text-muted-foreground">
                ({occupancyPercentage.toFixed(0)}%)
              </span>
            </div>
            
            {turma.classroom && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{turma.classroom}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{turma.class?.class_name}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{turma.academic_year?.year_name}</span>
              {turma.academic_year?.is_current && (
                <Badge variant="default" className="text-xs">
                  Atual
                </Badge>
              )}
            </div>
          </div>

          {/* Barra de ocupação */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Ocupação</div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  occupancyPercentage >= 90 
                    ? 'bg-destructive' 
                    : occupancyPercentage >= 75 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(turma)}
              className="flex-1 mr-2"
            >
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(turma)}
              className="mr-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(turma.id)}
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