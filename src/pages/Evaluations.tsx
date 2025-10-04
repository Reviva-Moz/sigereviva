import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Plus, Download, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { getGradeClassification } from '@/lib/validators/mozambique';

interface Evaluation {
  id: string;
  studentName: string;
  subject: string;
  trimester: number;
  grade: number;
  date: string;
}

// Mock data
const mockEvaluations: Evaluation[] = [
  { id: '1', studentName: 'Ana Maria Silva', subject: 'Matemática', trimester: 1, grade: 16.5, date: '2025-03-15' },
  { id: '2', studentName: 'Ana Maria Silva', subject: 'Português', trimester: 1, grade: 14.0, date: '2025-03-14' },
  { id: '3', studentName: 'Carlos Alberto Mendes', subject: 'Matemática', trimester: 1, grade: 12.5, date: '2025-03-15' },
  { id: '4', studentName: 'Carlos Alberto Mendes', subject: 'Biologia', trimester: 1, grade: 18.0, date: '2025-03-16' },
  { id: '5', studentName: 'Maria José Costa', subject: 'Física', trimester: 1, grade: 8.5, date: '2025-03-17' },
];

export default function Evaluations() {
  const [selectedTrimester, setSelectedTrimester] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    studentName: '',
    subject: '',
    trimester: '1',
    grade: '',
  });

  const filteredEvaluations = mockEvaluations.filter((evaluation) => {
    const matchesTrimester = selectedTrimester === 'all' || evaluation.trimester.toString() === selectedTrimester;
    const matchesSubject = selectedSubject === 'all' || evaluation.subject === selectedSubject;
    return matchesTrimester && matchesSubject;
  });

  // Calcular estatísticas
  const averageGrade = filteredEvaluations.length > 0
    ? filteredEvaluations.reduce((sum, e) => sum + e.grade, 0) / filteredEvaluations.length
    : 0;

  const passedCount = filteredEvaluations.filter(e => e.grade >= 10).length;
  const passRate = filteredEvaluations.length > 0
    ? (passedCount / filteredEvaluations.length) * 100
    : 0;

  const excellentCount = filteredEvaluations.filter(e => e.grade >= 16).length;

  return (
    <MainLayout title="Avaliações e Notas" subtitle="Sistema de avaliação moçambicano (0-20)">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredEvaluations.length}</div>
                <p className="text-xs text-muted-foreground">Este trimestre</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageGrade.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Escala 0-20</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{passRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{passedCount} aprovados</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excelentes</CardTitle>
                <Award className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{excellentCount}</div>
                <p className="text-xs text-muted-foreground">Notas ≥ 16</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar trimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os trimestres</SelectItem>
                <SelectItem value="1">1º Trimestre</SelectItem>
                <SelectItem value="2">2º Trimestre</SelectItem>
                <SelectItem value="3">3º Trimestre</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as disciplinas</SelectItem>
                <SelectItem value="Matemática">Matemática</SelectItem>
                <SelectItem value="Português">Português</SelectItem>
                <SelectItem value="Biologia">Biologia</SelectItem>
                <SelectItem value="Física">Física</SelectItem>
                <SelectItem value="Química">Química</SelectItem>
                <SelectItem value="História">História</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Pautas
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Lançar Nota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lançar Nova Avaliação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Educando</Label>
                    <Input
                      placeholder="Nome do educando"
                      value={newEvaluation.studentName}
                      onChange={(e) => setNewEvaluation({ ...newEvaluation, studentName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Disciplina</Label>
                    <Select
                      value={newEvaluation.subject}
                      onValueChange={(value) => setNewEvaluation({ ...newEvaluation, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Matemática">Matemática</SelectItem>
                        <SelectItem value="Português">Português</SelectItem>
                        <SelectItem value="Biologia">Biologia</SelectItem>
                        <SelectItem value="Física">Física</SelectItem>
                        <SelectItem value="Química">Química</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Trimestre</Label>
                    <Select
                      value={newEvaluation.trimester}
                      onValueChange={(value) => setNewEvaluation({ ...newEvaluation, trimester: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1º Trimestre</SelectItem>
                        <SelectItem value="2">2º Trimestre</SelectItem>
                        <SelectItem value="3">3º Trimestre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nota (0-20)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      placeholder="0.0"
                      value={newEvaluation.grade}
                      onChange={(e) => setNewEvaluation({ ...newEvaluation, grade: e.target.value })}
                    />
                  </div>
                  <Button className="w-full">Salvar Avaliação</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabela de Avaliações */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Educando</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Trimestre</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.map((evaluation, index) => {
                  const classification = getGradeClassification(evaluation.grade);
                  return (
                    <motion.tr
                      key={evaluation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="font-medium">{evaluation.studentName}</TableCell>
                      <TableCell>{evaluation.subject}</TableCell>
                      <TableCell>{evaluation.trimester}º Trimestre</TableCell>
                      <TableCell>
                        <span className={`font-bold ${classification.color}`}>
                          {evaluation.grade.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={classification.passed ? 'default' : 'destructive'}
                          className={classification.passed ? 'bg-green-500' : ''}
                        >
                          {classification.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(evaluation.date).toLocaleDateString('pt-MZ')}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Legenda do Sistema de Avaliação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Sistema de Avaliação Moçambicano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="font-bold text-green-600 text-lg">16-20</div>
                <div className="text-sm text-muted-foreground">Excelente</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600 text-lg">14-15.5</div>
                <div className="text-sm text-muted-foreground">Bom</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600 text-lg">10-13.5</div>
                <div className="text-sm text-muted-foreground">Suficiente</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-600 text-lg">5-9.5</div>
                <div className="text-sm text-muted-foreground">Insuficiente</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600 text-lg">0-4.5</div>
                <div className="text-sm text-muted-foreground">Mau</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
