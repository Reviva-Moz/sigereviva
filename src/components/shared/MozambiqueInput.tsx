import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MASKS } from '@/lib/validators/mozambique';

type InputMask = 'BI' | 'NUIT' | 'PHONE' | 'POSTAL_CODE';

interface MozambiqueInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  mask: InputMask;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MozambiqueInput({
  label,
  mask,
  value,
  onChange,
  error,
  ...props
}: MozambiqueInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = MASKS[mask](rawValue);
    onChange(maskedValue);
  };

  const placeholders: Record<InputMask, string> = {
    BI: '##### ##### ###',
    NUIT: '#########X',
    PHONE: '+258 ## ### ####',
    POSTAL_CODE: '####',
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        placeholder={props.placeholder || placeholders[mask]}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
