import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ATIVO: 'default',
      PRESENTE: 'default',
      PAGO: 'default',
      
      INATIVO: 'secondary',
      AUSENTE: 'destructive',
      JUSTIFICADO: 'secondary',
      ATRASADO: 'outline',
      
      PENDENTE: 'outline',
      VENCIDO: 'destructive',
      CANCELADO: 'secondary',
      
      TRANSFERIDO: 'outline',
      GRADUADO: 'default',
    };
    
    return statusMap[status] || 'outline';
  };

  const getLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      ATIVO: 'Ativo',
      INATIVO: 'Inativo',
      TRANSFERIDO: 'Transferido',
      GRADUADO: 'Graduado',
      
      PRESENTE: 'Presente',
      AUSENTE: 'Ausente',
      JUSTIFICADO: 'Justificado',
      ATRASADO: 'Atrasado',
      
      PAGO: 'Pago',
      PENDENTE: 'Pendente',
      VENCIDO: 'Vencido',
      CANCELADO: 'Cancelado',
    };
    
    return labelMap[status] || status;
  };

  return (
    <Badge variant={getVariant(status)}>
      {getLabel(status)}
    </Badge>
  );
}
