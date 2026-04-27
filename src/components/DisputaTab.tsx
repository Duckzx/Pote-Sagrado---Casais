import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';

interface DisputaTabProps {
  deposits: any[];
  prize?: string;
}

export const DisputaTab: React.FC<DisputaTabProps> = ({ deposits, prize }) => {
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyDeposits = deposits.filter(d => {
      if (!d.createdAt?.toDate) return false;
      const date = d.createdAt.toDate();
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const userTotals: Record<string, { name: string, total: number }> = {};
    
    monthlyDeposits.forEach(d => {
      if (!userTotals[d.who]) {
        userTotals[d.who] = { name: d.whoName, total: 0 };
      }
      // Only income counts for the battle score
      if (d.type !== 'expense') {
        userTotals[d.who].total += d.amount;
      }
    });

    const users = Object.values(userTotals).sort((a, b) => b.total - a.total);
    
    // Ensure we have at least two users for the UI, even if empty
    if (users.length === 0) {
      users.push({ name: 'Jogador 1', total: 0 }, { name: 'Jogador 2', total: 0 });
    } else if (users.length === 1) {
      users.push({ name: 'Jogador 2', total: 0 });
    }

    const total = users[0].total + users[1].total;
    const p1Percentage = total > 0 ? (users[0].total / total) * 100 : 50;
    const p2Percentage = total > 0 ? (users[1].total / total) * 100 : 50;

    return { users, total, p1Percentage, p2Percentage };
  }, [deposits]);

  const { users, p1Percentage, p2Percentage } = stats;

  // Monthly breakdown for chart-like display
  const weeklyData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const weeks: { label: string; p1: number; p2: number }[] = [];
    
    for (let w = 0; w < 4; w++) {
      const weekStart = new Date(currentYear, currentMonth, 1 + w * 7);
      const weekEnd = new Date(currentYear, currentMonth, Math.min(8 + w * 7, new Date(currentYear, currentMonth + 1, 0).getDate()));
      
      let p1Total = 0;
      let p2Total = 0;
      
      deposits.forEach(d => {
        if (!d.createdAt?.toDate) return;
        const date = d.createdAt.toDate();
        if (date >= weekStart && date < weekEnd && date.getMonth() === currentMonth) {
          if (users.length >= 2) {
            if (d.who === Object.keys(deposits.reduce((acc: any, dep: any) => {
              if (!acc[dep.who]) acc[dep.who] = dep.whoName;
              return acc;
            }, {}))[0]) {
              p1Total += d.amount || 0;
            } else {
              p2Total += d.amount || 0;
            }
          }
        }
      });
      
      weeks.push({ label: `Sem ${w + 1}`, p1: p1Total, p2: p2Total });
    }
    
    return weeks;
  }, [deposits, users]);

  const maxWeeklyValue = Math.max(...weeklyData.map(w => Math.max(w.p1, w.p2)), 1);

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-cookbook-text mb-1">A Grande Batalha</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Quem economiza mais este mês?
        </p>
      </div>

      {/* Battle Box */}
      <div className="bg-cookbook-battle border border-cookbook-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <div className="flex justify-between items-center font-sans text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
          <div className="flex flex-col items-start">
            <span className="text-cookbook-primary mb-1">{users[0].name}</span>
            <span className="font-serif text-xl text-cookbook-primary">
              {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[0].total)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-cookbook-bg border border-cookbook-border flex items-center justify-center shadow-inner z-10">
            <span className="text-cookbook-text/30 italic text-xs">vs</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-cookbook-text/60 mb-1">{users[1].name}</span>
            <span className="font-serif text-xl text-cookbook-text">
              {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[1].total)}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-4 bg-cookbook-bg border border-cookbook-border rounded-full overflow-hidden flex shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-cookbook-primary to-cookbook-primary/60 transition-all duration-1000 ease-out relative"
            style={{ width: `${p1Percentage}%` }}
          >
            {p1Percentage > 15 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-white font-bold">{p1Percentage.toFixed(0)}%</span>
            )}
          </div>
          <div 
            className="h-full bg-gradient-to-l from-cookbook-text/40 to-cookbook-text/20 transition-all duration-1000 ease-out relative"
            style={{ width: `${p2Percentage}%` }}
          >
            {p2Percentage > 15 && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-cookbook-text/60 font-bold">{p2Percentage.toFixed(0)}%</span>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/40 font-bold">
            {users[0].total === users[1].total ? 'Empate técnico!' : `${users[0].name} está dominando!`}
          </p>
        </div>
      </div>

      {/* Prize */}
      <div className="bg-cookbook-mural border border-cookbook-gold/20 rounded-xl p-4 text-center">
        <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-gold font-bold">◈ Recompensa do Mês</span>
        <p className="font-serif italic text-sm text-cookbook-text mt-1">
          {prize || 'Quem juntar menos paga um jantar!'}
        </p>
      </div>

      {/* Leader Banner */}
      {users[0].total > users[1].total && (
        <div className="bg-cookbook-bg border border-cookbook-border rounded-xl p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-30" />
          
          <div className="w-14 h-14 mx-auto bg-cookbook-bg rounded-full flex items-center justify-center mb-4 border border-cookbook-border">
            <Trophy size={22} className="text-cookbook-primary" />
          </div>
          
          <h3 className="font-serif italic text-lg text-cookbook-text mb-2">Liderança Atual</h3>
          <p className="font-sans text-xs uppercase tracking-widest text-cookbook-primary font-bold mb-1">
            {users[0].name} está na frente!
          </p>
          <p className="font-sans text-[10px] text-cookbook-text/50 leading-relaxed">
            Se o mês acabasse hoje, {users[1].name} pagaria a recompensa.
          </p>
          
          <div className="mt-4 pt-4 border-t border-cookbook-border">
            <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40 font-bold">
              Diferença: {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[0].total - users[1].total)}
            </span>
          </div>
        </div>
      )}

      {/* Weekly breakdown */}
      <div className="bg-cookbook-bg border border-cookbook-border rounded-xl p-5 space-y-4">
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 font-bold text-center">
          Desempenho Semanal
        </h3>
        <div className="space-y-3">
          {weeklyData.map((week, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-bold">
                <span>{week.label}</span>
                <span className="flex gap-3">
                  <span className="text-cookbook-primary">R$ {week.p1.toFixed(0)}</span>
                  <span>R$ {week.p2.toFixed(0)}</span>
                </span>
              </div>
              <div className="flex h-2 gap-0.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cookbook-primary/60 rounded-l-full transition-all duration-500"
                  style={{ width: `${(week.p1 / maxWeeklyValue) * 50}%` }}
                />
                <div 
                  className="bg-cookbook-text/40 rounded-r-full transition-all duration-500"
                  style={{ width: `${(week.p2 / maxWeeklyValue) * 50}%` }}
                />
                <div className="flex-1 bg-cookbook-border/30" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational note */}
      {users[0].total === 0 && users[1].total === 0 && (
        <div className="text-center py-6 px-4 bg-cookbook-bg border border-dashed border-cookbook-border rounded-xl">
          <span className="text-3xl block mb-3">⚔️</span>
          <p className="font-serif italic text-cookbook-text/60 text-sm mb-1">
            A batalha ainda não começou!
          </p>
          <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">
            Vá em Missões e complete a primeira economia do mês.
          </p>
        </div>
      )}
    </div>
  );
};
