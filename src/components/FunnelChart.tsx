"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FunnelStep {
  label: string;
  value: string;
  width: number;
}

interface FunnelChartProps {
  mainSteps: FunnelStep[];
  sideSteps: { label: string; value: string }[];
  bottomMetrics: { label: string; value: string }[];
}

export default function FunnelChart({ mainSteps, sideSteps, bottomMetrics }: FunnelChartProps) {
  return (
    <Card className="h-full bg-[#18191A] border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-center text-lg">Funil de Tráfego</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-full max-w-[300px] flex flex-col items-center gap-1">
          {mainSteps.map((step, index) => (
            <div
              key={index}
              className="relative flex items-center justify-center text-center transition-all"
              style={{
                width: `${step.width}%`,
                background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
                padding: '12px 4px',
                clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)',
                marginBottom: '-4px',
                zIndex: mainSteps.length - index,
              }}
            >
              <div>
                <p className="text-xs text-blue-200">{step.label}</p>
                <p className="text-lg font-bold">{step.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full mt-6 space-y-2">
          {sideSteps.map((step, index) => (
            <div key={index} className="flex justify-between items-center text-sm border-b border-gray-700 pb-1">
              <span className="text-gray-400">{step.label}</span>
              <span className="font-medium">{step.value}</span>
            </div>
          ))}
        </div>

        <div className="w-full mt-4 grid grid-cols-3 gap-2">
          {bottomMetrics.map((metric, index) => (
            <div key={index} className="bg-[#242526] p-2 rounded text-center">
              <p className="text-[10px] text-gray-400 uppercase">{metric.label}</p>
              <p className="font-bold text-sm">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}