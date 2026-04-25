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
      const val = d.type === 'expense' ? -d.amount : d.amount;
      userTotals[d.who].total += val;
    });

    const users = Object.values(userTotals).sort((a, b) => b.total - a.total);
    
    // Ensure we have at least two users for the UI, even if empty
    if (users.length === 0) {
      users.push({ name: 'Jogador 1', total: 0 }, { name: 'Jogador 2', total: 0 });
    } else if (users.length === 1) {
      users.push({ name: 'Jogador 2', total: 0 });
    }

    const total = Math.max(0, users[0].total) + Math.max(0, users[1].total);
    const p1Percentage = total > 0 ? (Math.max(0, users[0].total) / total) * 100 : 50;
    const p2Percentage = total > 0 ? (Math.max(0, users[1].total) / total) * 100 : 50;

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
            const val = d.type === 'expense' ? -(d.amount || 0) : (d.amount || 0);
            if (d.who === Object.keys(deposits.reduce((acc: any, dep: any) => {
              if (!acc[dep.who]) acc[dep.who] = dep.whoName;
              return acc;
            }, {}))[0]) {
              p1Total += val;
            } else {
              p2Total += val;
            }
          }
        }
      });
      
      weeks.push({ label: `Sem ${w + 1}`, p1: Math.max(0, p1Total), p2: Math.max(0, p2Total) });
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
      <div className="bg-cookbook-battle border border-cookbook-border rounded-xl p-5">
        <div className="flex justify-between font-sans text-[10px] uppercase tracking-widest font-bold mb-4">
          <span className="text-cookbook-primary">{users[0].name}</span>
          <span className="text-cookbook-text/30">VS</span>
          <span className="text-cookbook-text">{users[1].name}</span>
        </div>
        
        {/* Scores */}
        <div className="flex justify-between items-baseline mb-4">
          <span className="font-serif text-2xl text-cookbook-primary">
            {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[0].total)}
          </span>
          <span className="font-serif text-2xl text-cookbook-text">
            {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[1].total)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-3 bg-cookbook-border rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-cookbook-primary to-cookbook-primary/70 transition-all duration-1000 ease-out rounded-l-full"
            style={{ width: `${p1Percentage}%` }}
          />
          <div 
            className="h-full bg-gradient-to-l from-cookbook-text to-cookbook-text/70 transition-all duration-1000 ease-out rounded-r-full"
            style={{ width: `${p2Percentage}%` }}
          />
        </div>
        
        {/* Percentage labels */}
        <div className="flex justify-between mt-2">
          <span className="font-sans text-[9px] text-cookbook-primary font-bold">{p1Percentage.toFixed(0)}%</span>
          <span className="font-sans text-[9px] text-cookbook-text/60 font-bold">{p2Percentage.toFixed(0)}%</span>
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
        <div className="bg-white border border-cookbook-border rounded-xl p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-30" />
          
          <div className="w-14 h-14 mx-auto bg-cookbook-bg rounded-full flex items-center justify-center mb-4 border border-cookbook-border">
            <Trophy size={22} className="text-cookbook-primary" />
          </div>
          
          <h3 className="font-serif italic text-lg text-cookbook-text mb-2">Liderança Atual</h3>
          <p className="font-sans text-xs uppercase tracking-widest text-cookbook-primary font-bold mb-1">
            {users[0].name} está na frente!
          </p>
          <p className="font-sans text-[10px] text-cookbook-text/50 leading-relaxed mb-4">
            Se o mês acabasse hoje, {users[1].name} pagaria a recompensa.
          </p>

          <button 
            onClick={() => {
              // Trigger a funny buzz/vibrate if available
              if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate([200, 100, 200]);
              }
              alert(`Você apertou o botão do orgulho! Lembre ${users[1].name} de que você está na liderança e mande ele(a) ir aquecendo pra pagar o castigo!`);
            }}
            className="w-full bg-cookbook-bg border border-cookbook-border text-cookbook-primary hover:bg-cookbook-primary/10 transition-colors font-sans text-[10px] uppercase tracking-widest py-3 rounded-lg font-bold"
          >
            Notificar Vantagem (Físico)
          </button>
          
          <div className="mt-4 pt-4 border-t border-cookbook-border">
            <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40 font-bold">
              Diferença: {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[0].total - users[1].total)}
            </span>
          </div>
        </div>
      )}

      {/* Weekly breakdown */}
      <div className="bg-white border border-cookbook-border rounded-xl p-5 space-y-4">
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
        <div className="text-center py-6 px-4 bg-white border border-dashed border-cookbook-border rounded-xl">
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
