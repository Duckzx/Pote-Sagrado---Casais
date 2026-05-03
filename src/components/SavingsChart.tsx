import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavingsChartProps {
  deposits: any[];
  goalAmount: number;
}

export const SavingsChart: React.FC<SavingsChartProps> = ({ deposits, goalAmount }) => {
  const data = useMemo(() => {
    const sortedDeposits = [...deposits].sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });

    let cumulative = 0;
    const dailyData: Record<string, number> = {};

    sortedDeposits.forEach((d) => {
      const date = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const amount = d.type === 'expense' ? -d.amount : d.amount;
      cumulative += amount;
      dailyData[dateStr] = cumulative;
    });

    return Object.entries(dailyData).map(([date, total]) => ({
      date,
      displayDate: format(new Date(date + 'T12:00:00'), 'dd/MM', { locale: ptBR }),
      total: Math.max(0, total),
    })).slice(-15); // Show last 15 days
  }, [deposits]);

  if (data.length < 2) {
    return (
      <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
        <p className="font-serif italic text-cookbook-text/50 text-sm">
          Continue poupando para ver o gráfico crescer! 📈
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-64 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-sm text-cookbook-text font-medium">Evolução do Pote</h3>
        <span className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/40 font-bold">Últimos 15 lançamentos</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8E7F6D" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8E7F6D" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4D9" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#8E7F6D', opacity: 0.6 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#8E7F6D', opacity: 0.6 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FDFBF7', 
              border: '1px solid #E8E4D9',
              borderRadius: '12px',
              fontSize: '10px',
              fontFamily: 'serif'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#8E7F6D" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
