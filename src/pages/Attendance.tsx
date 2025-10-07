import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAttendance, useAttendanceByDate } from '@/hooks/useAttendance';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PRESENTE':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'AUSENTE':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'JUSTIFICADO':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'ATRASADO':
      return <Clock className="h-5 w-5 text-orange-500" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
    PRESENTE: 'default',
    AUSENTE: 'destructive',
    JUSTIFICADO: 'secondary',
    ATRASADO: 'outline',
  };
  
  return (
    <Badge variant={variants[status] || 'default'} className="capitalize">
      {status.toLowerCase()}
    </Badge>
  );
};

export default function Attendance() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  const { data: allAttendance = [], isLoading: isLoadingAll } = useAttendance();
  const { data: dateAttendance = [], isLoading: isLoadingDate } = useAttendanceByDate(selectedDate);

  // Calcular estatísticas
  const todayAttendance = allAttendance.filter(
    a => a.attendance_date === today
  );
  
  const presentes = todayAttendance.filter(a => a.status === 'PRESENTE').length;
  const ausentes = todayAttendance.filter(a => a.status === 'AUSENTE').length;
  const justificados = todayAttendance.filter(a => a.status === 'JUSTIFICADO').length;
  const atrasados = todayAttendance.filter(a => a.status === 'ATRASADO').length;

  const displayAttendance = selectedDate === today ? todayAttendance : dateAttendance;

  return (
    <MainLayout title="Presenças" subtitle="Registo de presenças dos educandos">
      <div className="space-y-6">
        {/* Estatísticas de Hoje */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Presentes</p>
                  <p className="text-3xl font-bold text-green-600">{presentes}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ausentes</p>
                  <p className="text-3xl font-bold text-red-600">{ausentes}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Justificados</p>
                  <p className="text-3xl font-bold text-yellow-600">{justificados}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Atrasados</p>
                  <p className="text-3xl font-bold text-orange-600">{atrasados}</p>
                </div>
                <Clock className="h-12 w-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtro de Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtrar por Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full max-w-xs"
              />
              {selectedDate !== today && (
                <button
                  onClick={() => setSelectedDate(today)}
                  className="text-sm text-primary hover:underline"
                >
                  Voltar para hoje
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Presenças */}
        {isLoadingAll || isLoadingDate ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : displayAttendance.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum registo de presença para esta data
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayAttendance.map((attendance, index) => (
              <motion.div
                key={attendance.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(attendance.status)}
                        <div>
                          <p className="font-medium">
                            {attendance.student?.full_name || 'Educando não identificado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attendance.attendance_date).toLocaleDateString('pt-MZ', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          {attendance.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Observação: {attendance.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(attendance.status)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
