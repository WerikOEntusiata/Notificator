import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string;
  change?: { value: string; positive: boolean };
  icon: React.ReactNode;
}

export default function MetricCard({ title, value, change, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${change.positive ? 'text-green-500' : 'text-red-500'} mt-1`}>
            {change.positive ? '↑' : '↓'} {change.value} vs período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}