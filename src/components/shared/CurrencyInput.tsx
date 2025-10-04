import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMZN } from '@/lib/validators/mozambique';

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function CurrencyInput({
  label = 'Valor',
  value,
  onChange,
  error,
  disabled = false,
  placeholder = '0.00',
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(value.toString());

  React.useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers and decimal point
    const sanitized = inputValue.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    const formatted = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : sanitized;
    
    setDisplayValue(formatted);
    
    const numValue = parseFloat(formatted);
    if (!isNaN(numValue)) {
      onChange(Math.round(numValue * 100) / 100);
    } else if (formatted === '') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    // Format on blur
    if (value > 0) {
      setDisplayValue(value.toFixed(2));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {value > 0 && (
          <span className="text-sm font-semibold text-green-600">
            {formatMZN(value)}
          </span>
        )}
      </div>
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          MT
        </span>
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`pl-12 ${error ? 'border-destructive' : ''}`}
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
