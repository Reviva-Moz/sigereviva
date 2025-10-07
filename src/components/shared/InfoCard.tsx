import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InfoCardProps {
  title: string;
  items: {
    label: string;
    value: string | number;
    icon?: LucideIcon;
  }[];
}

export function InfoCard({ title, items }: InfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
