import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressItem {
  label: string;
  value: number;
  max: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

interface ProgressCardProps {
  title: string;
  icon?: LucideIcon;
  items: ProgressItem[];
}

export function ProgressCard({ title, icon: Icon, items }: ProgressCardProps) {
  const getProgressColor = (color?: string) => {
    const colors: Record<string, string> = {
      primary: '[&>div]:bg-primary',
      secondary: '[&>div]:bg-secondary',
      success: '[&>div]:bg-green-600',
      warning: '[&>div]:bg-yellow-600',
      error: '[&>div]:bg-red-600',
    };
    return colors[color || 'primary'] || colors.primary;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const percentage = (item.value / item.max) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">
                    {item.value}/{item.max} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className={getProgressColor(item.color)}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
