import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getGradeClassification } from '@/lib/validators/mozambique';
import { AlertCircle } from 'lucide-react';

interface GradeInputProps {
  label?: string;
  value: number | string;
  onChange: (value: number) => void;
  error?: string;
  showClassification?: boolean;
  disabled?: boolean;
}

export function GradeInput({
  label = 'Nota',
  value,
  onChange,
  error,
  showClassification = true,
  disabled = false,
}: GradeInputProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  const classification = getGradeClassification(numericValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(0);
      return;
    }

    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      // Limit to 0-20 range with one decimal
      const limited = Math.min(Math.max(num, 0), 20);
      onChange(Math.round(limited * 10) / 10);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label} (0-20)</Label>
        {showClassification && numericValue > 0 && (
          <Badge
            variant={classification.passed ? 'default' : 'destructive'}
            className={classification.passed ? 'bg-green-500' : ''}
          >
            {classification.label}
          </Badge>
        )}
      </div>
      
      <div className="relative">
        <Input
          type="number"
          min="0"
          max="20"
          step="0.5"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={error ? 'border-destructive pr-10' : 'pr-10'}
        />
        {numericValue > 0 && (
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${classification.color}`}>
            {numericValue.toFixed(1)}
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
      
      {showClassification && !error && numericValue === 0 && (
        <p className="text-xs text-muted-foreground">
          Sistema de avaliação moçambicano: 10 pontos = nota mínima de aprovação
        </p>
      )}
    </div>
  );
}
