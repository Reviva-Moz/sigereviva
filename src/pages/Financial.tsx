import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStudents } from '@/hooks/useStudents';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatMZN } from '@/lib/validators/mozambique';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Filter
} from 'lucide-react';

const financialSchema = z.object({
  student_id: z.string().min(1, 'Selecione um educando'),
  academic_year_id: z.string().min(1, 'Selecione um ano letivo'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que 0'),
  due_date: z.string().optional(),
  payment_date: z.string().optional(),
  payment_method: z.string().optional(),
  status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO']).default('PENDENTE'),
  notes: z.string().optional(),
});

type FinancialFormData = z.infer<typeof financialSchema>;

export default function Financial() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { data: students } = useStudents();

  const { data: financialRecords, isLoading } = useSupabaseQuery(
    ['financial_records'],
    async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .select(`
          *,
          student:students(*),
          academic_year:academic_years(*)
        `)
        .order('created_at', { ascending: false });
      return { data, error };
    }
  );

  const { data: academicYears } = useSupabaseQuery(
    ['academic_years'],
    async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('is_current', { ascending: false });
      return { data, error };
    }
  );

  const createRecord = useSupabaseMutation(
    async (recordData: any) => {
      const { data, error } = await supabase
        .from('financial_records')
        .insert(recordData)
        .select()
        .single();
      return { data, error };
    },
    {
      invalidateQueries: [['financial_records']],
    }
  );

  const form = useForm<FinancialFormData>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      status: 'PENDENTE',
    },
  });

  const filteredRecords = financialRecords?.filter((record) => {
    const matchesSearch = 
      record.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const statistics = useMemo(() => {
    const total = financialRecords?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
    const paid = financialRecords?.filter(r => r.status === 'PAGO').reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
    const pending = financialRecords?.filter(r => r.status === 'PENDENTE').reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
    const overdue = financialRecords?.filter(r => r.status === 'VENCIDO').reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
    
    return { total, paid, pending, overdue };
  }, [financialRecords]);

  const onSubmit = async (data: FinancialFormData) => {
    try {
      await createRecord.mutateAsync({
        student_id: data.student_id,
        academic_year_id: data.academic_year_id,
        description: data.description,
        amount: data.amount,
        due_date: data.due_date || null,
        payment_date: data.payment_date || null,
        payment_method: data.payment_method || null,
        status: data.status,
        notes: data.notes || null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });
      
      toast({
        title: 'Sucesso',
        description: 'Registo financeiro criado com sucesso',
      });
      
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao criar registo:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAGO':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDENTE':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'VENCIDO':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'PENDENTE':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'VENCIDO':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'CANCELADO':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <MainLayout title="Gestão Financeira" subtitle="Controlo de pagamentos e receitas">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{formatMZN(statistics.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Pago</p>
                  <p className="text-2xl font-bold text-green-600">{formatMZN(statistics.paid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Pendente</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatMZN(statistics.pending)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Vencido</p>
                  <p className="text-2xl font-bold text-red-600">{formatMZN(statistics.overdue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar registos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <Button variant="outline" className="flex-1 lg:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 lg:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Registo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Registo Financeiro</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="student_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Educando</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {students?.map((student) => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.full_name}
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
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {academicYears?.map((year) => (
                                  <SelectItem key={year.id} value={year.id}>
                                    {year.year_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Propina - 1º Trimestre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                value={field.value || 0}
                                onChange={field.onChange}
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
                                <SelectItem value="PENDENTE">Pendente</SelectItem>
                                <SelectItem value="PAGO">Pago</SelectItem>
                                <SelectItem value="VENCIDO">Vencido</SelectItem>
                                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Vencimento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="payment_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Pagamento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método de Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                              <SelectItem value="MPESA">M-Pesa</SelectItem>
                              <SelectItem value="EMOLA">E-Mola</SelectItem>
                              <SelectItem value="TRANSFERENCIA">Transferência Bancária</SelectItem>
                              <SelectItem value="DEPOSITO">Depósito Bancário</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createRecord.isPending}>
                        {createRecord.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de Registos */}
        {isLoading ? (
          <div className="text-center py-8">Carregando registos...</div>
        ) : filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum registo encontrado</h3>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Educando</th>
                      <th className="text-left p-4 font-medium">Descrição</th>
                      <th className="text-left p-4 font-medium">Valor</th>
                      <th className="text-left p-4 font-medium">Vencimento</th>
                      <th className="text-left p-4 font-medium">Pagamento</th>
                      <th className="text-left p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b hover:bg-muted/30"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{record.student?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              #{record.student?.student_number}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">{record.description}</td>
                        <td className="p-4 font-semibold">{formatMZN(Number(record.amount))}</td>
                        <td className="p-4">
                          {record.due_date ? 
                            new Date(record.due_date).toLocaleDateString('pt-MZ') : 
                            '-'
                          }
                        </td>
                        <td className="p-4">
                          {record.payment_date ? (
                            <div>
                              <p>{new Date(record.payment_date).toLocaleDateString('pt-MZ')}</p>
                              {record.payment_method && (
                                <p className="text-sm text-muted-foreground">{record.payment_method}</p>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status || 'PENDENTE')}
                            <Badge className={getStatusColor(record.status || 'PENDENTE')}>
                              {record.status}
                            </Badge>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
