"use client";

import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color: string;
}

export default function SparklineChart({ data, color }: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  if (data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">-</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <YAxis domain={['auto', 'auto']} hide />
        <defs>
          <linearGradient id={`sparkline-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#sparkline-${color.replace('#', '')})`}
          strokeWidth={1.5}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}