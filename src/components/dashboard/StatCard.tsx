import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  value: string | number;
  label: string;
  fullWidth?: boolean;
}

const StatCard = ({
  icon: Icon,
  iconBgColor,
  iconColor,
  value,
  label,
  fullWidth = false,
}: StatCardProps) => {
  return (
    <Card className={cn(
      "bg-card rounded-2xl shadow-sm p-4 flex items-center gap-4",
      fullWidth && "col-span-2"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        iconBgColor
      )}>
        <Icon className={cn("w-6 h-6", iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground truncate">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
};

export default StatCard;
