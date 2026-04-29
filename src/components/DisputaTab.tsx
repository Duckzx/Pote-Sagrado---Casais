import React, { useMemo } from "react";
import { Trophy } from "lucide-react";
interface DisputaTabProps {
  deposits: any[];
  prize?: string;
}
export const DisputaTab: React.FC<DisputaTabProps> = ({ deposits, prize }) => {
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyDeposits = deposits.filter((d) => {
      if (!d.createdAt?.toDate) return false;
      const date = d.createdAt.toDate();
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });
    const userTotals: Record<string, { name: string; total: number }> = {};
    monthlyDeposits.forEach((d) => {
      // Ignore expenses as per roadmap instruction
      if (d.type === "expense") return;
      
      if (!userTotals[d.who]) {
        userTotals[d.who] = { name: d.whoName, total: 0 };
      }
      userTotals[d.who].total += d.amount;
    });
    const users = Object.values(userTotals).sort((a, b) => b.total - a.total);
    /* Ensure we have at least two users for the UI, even if empty */ if (
      users.length === 0
    ) {
      users.push(
        { name: "Jogador 1", total: 0 },
        { name: "Jogador 2", total: 0 },
      );
    } else if (users.length === 1) {
      users.push({ name: "Jogador 2", total: 0 });
    }
    const total = Math.max(0, users[0].total) + Math.max(0, users[1].total);
    const p1Percentage =
      total > 0 ? (Math.max(0, users[0].total) / total) * 100 : 50;
    const p2Percentage =
      total > 0 ? (Math.max(0, users[1].total) / total) * 100 : 50;
    return { users, total, p1Percentage, p2Percentage };
  }, [deposits]);
  const { users, p1Percentage, p2Percentage } = stats;
  /* Monthly breakdown for chart-like display */ const weeklyData =
    useMemo(() => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const weeks: { label: string; p1: number; p2: number }[] = [];
      for (let w = 0; w < 4; w++) {
        const weekStart = new Date(currentYear, currentMonth, 1 + w * 7);
        const weekEnd = new Date(
          currentYear,
          currentMonth,
          Math.min(
            8 + w * 7,
            new Date(currentYear, currentMonth + 1, 0).getDate(),
          ),
        );
        let p1Total = 0;
        let p2Total = 0;
        deposits.forEach((d) => {
          if (!d.createdAt?.toDate) return;
          const date = d.createdAt.toDate();
          if (
            date >= weekStart &&
            date < weekEnd &&
            date.getMonth() === currentMonth
          ) {
            if (users.length >= 2) {
              const val =
                d.type === "expense" ? -(d.amount || 0) : d.amount || 0;
              if (
                d.who ===
                Object.keys(
                  deposits.reduce((acc: any, dep: any) => {
                    if (!acc[dep.who]) acc[dep.who] = dep.whoName;
                    return acc;
                  }, {}),
                )[0]
              ) {
                p1Total += val;
              } else {
                p2Total += val;
              }
            }
          }
        });
        weeks.push({
          label: `Sem ${w + 1}`,
          p1: Math.max(0, p1Total),
          p2: Math.max(0, p2Total),
        });
      }
      return weeks;
    }, [deposits, users]);
  const maxWeeklyValue = Math.max(
    ...weeklyData.map((w) => Math.max(w.p1, w.p2)),
    1,
  );
  
  const MONTHS_PT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const pastStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const pastMonths: Record<string, { p1: { name: string, total: number }, p2: { name: string, total: number } }> = {};
    
    deposits.forEach((d) => {
      if (!d.createdAt?.toDate || d.type === "expense") return;
      const date = d.createdAt.toDate();
      const m = date.getMonth();
      const y = date.getFullYear();
      
      // Skip current month
      if (m === currentMonth && y === currentYear) return;
      
      const key = `${MONTHS_PT[m]} ${y}`;
      if (!pastMonths[key]) {
        pastMonths[key] = { p1: { name: "", total: 0 }, p2: { name: "", total: 0 } };
      }
      
      // We will map users based on who they are to keep consistent mapping 
      // For simplicity, we just add totals to whoever is the first seen or second seen
      if (!pastMonths[key].p1.name) {
         pastMonths[key].p1.name = d.whoName;
         pastMonths[key].p1.total += d.amount;
      } else if (pastMonths[key].p1.name === d.whoName) {
         pastMonths[key].p1.total += d.amount;
      } else if (!pastMonths[key].p2.name) {
         pastMonths[key].p2.name = d.whoName;
         pastMonths[key].p2.total += d.amount;
      } else if (pastMonths[key].p2.name === d.whoName) {
         pastMonths[key].p2.total += d.amount;
      }
    });

    return Object.entries(pastMonths).map(([label, data]) => {
       const u1 = data.p1;
       const u2 = data.p2 || { name: "Jogador 2", total: 0 };
       const winner = u1.total > u2.total ? u1 : (u2.total > u1.total ? u2 : null);
       return { label, u1, u2, winner };
    }).sort((a,b) => b.label.localeCompare(a.label)); // simple string sort for now
  }, [deposits]);
  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
      {" "}
      <div className="text-center">
        {" "}
        <h2 className="font-serif text-2xl text-cookbook-text mb-1">
          {" "}
          A Grande Batalha{" "}
        </h2>{" "}
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          {" "}
          Quem economiza mais este mês?{" "}
        </p>{" "}
      </div>{" "}
      {/* Battle Box */}{" "}
      <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {" "}
        <div className="flex justify-between font-sans text-[10px] uppercase tracking-widest font-bold mb-4">
          {" "}
          <span className="text-cookbook-primary">{users[0].name}</span>{" "}
          <span className="text-cookbook-text/30">VS</span>{" "}
          <span className="text-cookbook-text">{users[1].name}</span>{" "}
        </div>{" "}
        {/* Scores */}{" "}
        <div className="flex justify-between items-baseline mb-4">
          {" "}
          <span className="font-serif text-2xl text-cookbook-primary">
            {" "}
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(users[0].total)}{" "}
          </span>{" "}
          <span className="font-serif text-2xl text-cookbook-text">
            {" "}
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(users[1].total)}{" "}
          </span>{" "}
        </div>{" "}
        {/* Progress bar */}{" "}
        <div className="relative h-3 bg-cookbook-bg/50 rounded-full overflow-hidden flex shadow-inner">
          {" "}
          <div
            className="h-full bg-gradient-to-r from-cookbook-primary to-cookbook-primary/70 transition-all duration-1000 ease-out rounded-l-full"
            style={{ width: `${p1Percentage}%` }}
          />{" "}
          <div
            className="h-full bg-gradient-to-l from-cookbook-text to-cookbook-text/70 transition-all duration-1000 ease-out rounded-r-full"
            style={{ width: `${p2Percentage}%` }}
          />{" "}
        </div>{" "}
        {/* Percentage labels */}{" "}
        <div className="flex justify-between mt-3">
          {" "}
          <span className="font-sans text-[9px] text-cookbook-primary font-bold">
            {" "}
            {p1Percentage.toFixed(0)}%{" "}
          </span>{" "}
          <span className="font-sans text-[9px] text-cookbook-text/60 font-bold">
            {" "}
            {p2Percentage.toFixed(0)}%{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Prize */}{" "}
      <div className="bg-gradient-to-br from-cookbook-gold/10 to-cookbook-mural/30 border border-cookbook-gold/20 rounded-3xl p-5 text-center shadow-sm">
        {" "}
        <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-gold font-bold">
          {" "}
          ◈ Recompensa do Mês{" "}
        </span>{" "}
        <p className="font-serif italic text-sm text-cookbook-text mt-1">
          {" "}
          {prize || "Quem juntar menos paga um jantar!"}{" "}
        </p>{" "}
      </div>{" "}
      {/* Leader Banner */}
      {users[0].total > 0 && users[0].total > users[1].total && (
        <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          {" "}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-30" />{" "}
          <div className="w-14 h-14 mx-auto bg-cookbook-bg rounded-full flex items-center justify-center mb-4 border border-cookbook-border shadow-sm transition-transform group-hover:scale-110">
            {" "}
            <Trophy size={22} className="text-cookbook-primary" />{" "}
          </div>{" "}
          <h3 className="font-serif text-lg text-cookbook-text mb-2 font-medium">
            {" "}
            Liderança Atual{" "}
          </h3>{" "}
          <p className="font-sans text-[11px] uppercase tracking-widest text-cookbook-primary font-medium mb-1">
            {" "}
            {users[0].name} está na frente!{" "}
          </p>{" "}
          <p className="font-sans text-[10px] text-cookbook-text/50 leading-relaxed mb-5">
            {" "}
            {users[0].total - users[1].total > 100 
              ? `Que surra! Se o mês acabasse hoje, ${users[1].name} pagaria a recompensa fácil.`
              : `Disputa acirrada! Mas se o mês acabasse hoje, ${users[1].name} pagaria a recompensa.`}
          </p>{" "}
          <button
            onClick={() => {
              /* Trigger a funny buzz/vibrate if available */ if (
                window.navigator &&
                window.navigator.vibrate
              ) {
                window.navigator.vibrate([200, 100, 200]);
              }
              alert(
                `Aviso enviado (mentalmente)! Lembre ${users[1].name} que você está liderando com segurança.`,
              );
            }}
            className="w-full bg-cookbook-bg border border-cookbook-border text-cookbook-primary hover:bg-cookbook-primary/10 transition-colors font-sans text-[10px] uppercase tracking-widest py-3 rounded-full font-medium shadow-sm active:scale-95"
          >
            {" "}
            Notificar Vantagem{" "}
          </button>{" "}
          <div className="mt-5 pt-4 border-t border-cookbook-border/30">
            {" "}
            <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-medium">
              {" "}
              Diferença:{" "}
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(users[0].total - users[1].total)}{" "}
            </span>{" "}
          </div>{" "}
        </div>
      )}
      {/* Weekly breakdown */}{" "}
      <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {" "}
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 font-medium text-center">
          {" "}
          Desempenho Semanal{" "}
        </h3>{" "}
        <div className="space-y-4">
          {" "}
          {weeklyData.map((week, i) => (
            <div key={i} className="space-y-2">
              {" "}
              <div className="flex justify-between font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-medium">
                {" "}
                <span>{week.label}</span>{" "}
                <span className="flex gap-4">
                  {" "}
                  <span className="text-cookbook-primary">
                    {" "}
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(week.p1)}{" "}
                  </span>{" "}
                  <span>
                    {" "}
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(week.p2)}{" "}
                  </span>{" "}
                </span>{" "}
              </div>{" "}
              <div className="flex h-2.5 gap-0.5 rounded-full overflow-hidden shadow-inner bg-cookbook-bg/50 border border-cookbook-border/30">
                {" "}
                <div
                  className="bg-cookbook-primary/70 transition-all duration-500"
                  style={{ width: `${(week.p1 / maxWeeklyValue) * 50}%` }}
                />{" "}
                <div
                  className="bg-cookbook-text/50 transition-all duration-500"
                  style={{ width: `${(week.p2 / maxWeeklyValue) * 50}%` }}
                />{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {/* Historical Battles */}
      {pastStats.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 font-medium text-center">
            {" "}
            Histórico de Batalhas{" "}
          </h3>{" "}
          <div className="grid gap-3">
            {pastStats.map((stat, idx) => (
              <div key={idx} className="bg-cookbook-bg/60 backdrop-blur-md border border-cookbook-border rounded-3xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
                 {stat.winner && <div className="absolute top-0 right-0 w-32 h-32 bg-cookbook-gold/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 opacity-50 group-hover:opacity-100 transition-opacity"></div>}
                 
                 <div className="flex-1">
                   <div className="font-serif text-sm text-cookbook-text mb-1 flex items-center gap-2">
                     {stat.label} 
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-sans font-medium text-cookbook-text/60">
                      {stat.u1.name} <span className="text-[8px] text-cookbook-text/30 mx-0.5">vs</span> {stat.u2.name}
                   </div>
                 </div>

                 <div className="flex flex-col items-end justify-center relative z-10">
                   {stat.winner ? (
                     <>
                        <div className="flex items-center gap-1.5 text-cookbook-primary font-bold text-[10px] uppercase tracking-widest mb-0.5">
                          {stat.winner.name} 
                          <Trophy size={11} className="text-cookbook-gold" /> 
                        </div>
                        <div className="font-serif text-xs text-cookbook-text/80">
                           {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(Math.abs(stat.u1.total - stat.u2.total))} <span className="text-cookbook-text/30 text-[9px] font-sans ml-1">dif</span>
                        </div>
                     </>
                   ) : (
                     <div className="text-[10px] uppercase tracking-widest font-medium text-cookbook-text/50">
                       EMPATE
                     </div>
                   )}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational note */}{" "}
      {users[0].total === 0 && users[1].total === 0 && (
        <div className="text-center py-8 px-4 bg-cookbook-bg/90 backdrop-blur-md border-2 border-dashed border-cookbook-border rounded-3xl shadow-sm">
          {" "}
          <span className="text-4xl block mb-3 opacity-50 text-cookbook-primary grayscale">
            {" "}
            ⚔️{" "}
          </span>{" "}
          <p className="font-serif italic text-cookbook-text/60 text-sm mb-1">
            {" "}
            A batalha ainda não começou!{" "}
          </p>{" "}
          <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold mt-2">
            {" "}
            Complete a primeira economia do mês.{" "}
          </p>{" "}
        </div>
      )}{" "}
    </div>
  );
};
