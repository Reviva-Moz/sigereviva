import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  }[];
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Pesquisar...',
  filters = [],
}: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <Label className="text-sm text-muted-foreground mb-2">Pesquisa</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {filters.map((filter, index) => (
        <div key={index} className="w-full sm:w-48">
          <Label className="text-sm text-muted-foreground mb-2">{filter.label}</Label>
          <Select value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
