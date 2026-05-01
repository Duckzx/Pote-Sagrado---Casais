import React, { useMemo, useRef, useState } from "react";
import { Trophy, Share2, Zap, Target, Shield, Swords, Sparkles, TrendingUp, Crown } from "lucide-react";
import domtoimage from "dom-to-image-more";
import { motion, AnimatePresence } from "motion/react";
import { getDateObj } from "../lib/utils";

interface DisputaTabProps {
  deposits: any[];
  prize?: string;
  addToast: (title: string, msg: string, type?: "info" | "success" | "milestone") => void;
}
export const DisputaTab: React.FC<DisputaTabProps> = ({ deposits, prize, addToast }) => {
  const leaderBannerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyDeposits = deposits.filter((d) => {
      const date = getDateObj(d.createdAt);
      if (!date) return false;
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    const userTotals: Record<string, { name: string; total: number; count: number; maxHit: number; expenses: number }> = {};

    monthlyDeposits.forEach((d) => {
      if (!userTotals[d.who]) {
        userTotals[d.who] = { name: d.whoName, total: 0, count: 0, maxHit: 0, expenses: 0 };
      }

      if (d.type === "expense") {
        userTotals[d.who].expenses += d.amount;
        return;
      }

      userTotals[d.who].total += d.amount;
      userTotals[d.who].count += 1;
      if (d.amount > userTotals[d.who].maxHit) {
        userTotals[d.who].maxHit = d.amount;
      }
    });

    const users = Object.values(userTotals).sort((a, b) => b.total - a.total);
    /* Ensure we have at least two users for the UI, even if empty */ if (
      users.length === 0
    ) {
      users.push(
        { name: "Jogador 1", total: 0, count: 0, maxHit: 0, expenses: 0 },
        { name: "Jogador 2", total: 0, count: 0, maxHit: 0, expenses: 0 },
      );
    } else if (users.length === 1) {
      users.push({ name: "Jogador 2", total: 0, count: 0, maxHit: 0, expenses: 0 });
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
          const date = getDateObj(d.createdAt);
          if (!date) return;
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
      if (d.type === "expense") return;
      const date = getDateObj(d.createdAt);
      if (!date) return;
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
    }).sort((a, b) => b.label.localeCompare(a.label)); // simple string sort for now
  }, [deposits]);

  const handleExportShare = async () => {
    if (!leaderBannerRef.current) return;
    try {
      setIsExporting(true);
      if (window.navigator?.vibrate) window.navigator.vibrate([20, 20]);
      await new Promise((resolve) => setTimeout(resolve, 100)); // allow states to settle

      // Filter out elements with data-html2canvas-ignore
      const filter = (node: HTMLElement) => {
        return !node.hasAttribute || !node.hasAttribute('data-html2canvas-ignore');
      };

      const blob = await domtoimage.toBlob(leaderBannerRef.current, {
        bgcolor: 'transparent',
        scale: 2,
        filter: filter,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      if (!blob) {
        setIsExporting(false);
        return;
      }
      const file = new File([blob], "batalha_pote.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "A Grande Batalha",
          text: "Olha quem tá ganhando a disputa deste mês no Pote Sagrado!",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "lideranca_pote.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
      {" "}
      <div className="text-center relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Swords size={20} className="text-cookbook-primary/80" />
            <h2 className="font-serif text-2xl text-cookbook-text">A Grande Batalha</h2>
            <Swords size={20} className="text-cookbook-primary/80" />
          </div>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-cookbook-text/50 font-bold">Quem domina o mês?</p>
        </motion.div>
      </div>

      {/* Dynamic Battle Arena */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
        className="bg-cookbook-bg/80 backdrop-blur-3xl border border-cookbook-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-cookbook-primary/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

        {/* Versus Elements */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex flex-col items-center relative gap-2">
            {users[0].total > users[1].total && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1, rotate: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute -top-4 -right-2 text-cookbook-gold z-20"
              >
                <Trophy size={18} className="drop-shadow-md fill-cookbook-gold" />
              </motion.div>
            )}
            <div className={`w-16 h-16 rounded-full border-2 p-1 flex items-center justify-center transition-all duration-700
               ${users[0].total > users[1].total ? "bg-gradient-to-tr from-cookbook-primary/30 to-cookbook-primary/10 border-cookbook-primary scale-110 shadow-[0_0_15px_rgba(var(--color-cookbook-primary),0.3)]" : "bg-gradient-to-tr from-cookbook-text/10 to-cookbook-text/5 border-cookbook-border"}`}>
              <div className={`w-full h-full rounded-full flex items-center justify-center font-serif text-2xl transition-colors
                  ${users[0].total > users[1].total ? "bg-cookbook-primary/20 text-cookbook-primary" : "bg-cookbook-text/5 text-cookbook-text/70"}`}>
                {users[0].name.charAt(0)}
              </div>
            </div>
            <span className={`font-sans text-[10px] uppercase tracking-widest font-bold ${users[0].total > users[1].total ? "text-cookbook-primary" : "text-cookbook-text"}`}>
              {users[0].name}
            </span>
            <span className={`font-serif text-xl sm:text-2xl leading-none mt-1 ${users[0].total > users[1].total ? "text-cookbook-primary" : "text-cookbook-text"}`}>
              {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(users[0].total)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-2">
            <div className="w-8 h-8 rounded-full bg-cookbook-bg border border-cookbook-border flex items-center justify-center shadow-inner relative z-20 -mt-10">
              <span className="font-sans text-[9px] uppercase tracking-widest font-bold text-cookbook-text/40">vs</span>
            </div>
          </div>

          <div className="flex flex-col items-center relative gap-2">
            {users[1].total > users[0].total && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1, rotate: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute -top-4 -left-2 text-cookbook-gold z-20"
              >
                <Trophy size={18} className="drop-shadow-md fill-cookbook-gold" />
              </motion.div>
            )}
            <div className={`w-16 h-16 rounded-full border-2 p-1 flex items-center justify-center transition-all duration-700
               ${users[1].total > users[0].total ? "bg-gradient-to-tr from-emerald-500/30 to-emerald-500/10 border-emerald-500 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-gradient-to-tr from-cookbook-text/10 to-cookbook-text/5 border-cookbook-border"}`}>
              <div className={`w-full h-full rounded-full flex items-center justify-center font-serif text-2xl transition-colors
                  ${users[1].total > users[0].total ? "bg-emerald-500/20 text-emerald-500" : "bg-cookbook-text/5 text-cookbook-text/70"}`}>
                {users[1].name.charAt(0)}
              </div>
            </div>
            <span className={`font-sans text-[10px] uppercase tracking-widest font-bold ${users[1].total > users[0].total ? "text-emerald-500" : "text-cookbook-text"}`}>
              {users[1].name}
            </span>
            <span className={`font-serif text-xl sm:text-2xl leading-none mt-1 ${users[1].total > users[0].total ? "text-emerald-500" : "text-cookbook-text"}`}>
              {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(users[1].total)}
            </span>
          </div>
        </div>

        {/* Tug of War Component */}
        <div className="relative mt-8 mb-4">
          <div className="h-4 bg-cookbook-text/10 rounded-full overflow-hidden flex shadow-inner border border-cookbook-border/50 relative">
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: `${p1Percentage}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-cookbook-primary/80 to-cookbook-primary"
            />
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: `${p2Percentage}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="h-full bg-gradient-to-l from-emerald-500/80 to-emerald-500"
            />

            {/* The Clashing Center Node */}
            <motion.div
              initial={{ left: "50%" }}
              animate={{ left: `${p1Percentage}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-cookbook-bg border-2 border-cookbook-text/20 shadow-md rounded-full flex items-center justify-center z-10"
            >
              <div className="w-2 h-2 rounded-full bg-cookbook-text/20" />
            </motion.div>
          </div>

          <div className="flex justify-between mt-3 px-1">
            <span className="font-sans text-[10px] text-cookbook-primary font-bold tracking-wider">
              {p1Percentage.toFixed(1)}%
            </span>
            <span className="font-sans text-[10px] text-emerald-500 font-bold tracking-wider">
              {p2Percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </motion.div>
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
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
          ref={leaderBannerRef}
          className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-30" />
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-14 h-14 mx-auto bg-gradient-to-br from-cookbook-primary/10 to-transparent rounded-full flex items-center justify-center mb-4 border border-cookbook-primary/20 shadow-sm relative"
          >
            <div className="absolute inset-0 rounded-full animate-ping bg-cookbook-primary/20 opacity-20" style={{ animationDuration: '3s' }}></div>
            <Crown size={22} className="text-cookbook-primary drop-shadow-sm" />
          </motion.div>
          <h3 className="font-serif text-lg text-cookbook-text mb-2 font-medium">
            Liderança Atual
          </h3>
          <p className="font-sans text-[11px] uppercase tracking-widest text-cookbook-primary font-bold mb-1">
            {users[0].name} está dominando!
          </p>
          <p className="font-sans text-[10px] text-cookbook-text/50 leading-relaxed mb-5 px-4">
            {users[0].total - users[1].total > 100
              ? `Que surra! Se o mês acabasse hoje, ${users[1].name} pagaria a recompensa fácil.`
              : `Disputa acirrada! Mas se o mês acabasse hoje, ${users[1].name} pagaria a recompensa.`}
          </p>

          {/* Prevent buttons from being exported when we make the screenshot */}
          <div data-html2canvas-ignore className="flex gap-2">
            <button
              onClick={() => {
                if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
                addToast("Mentalizado!", `Você enviou ondas neurais de provocação para o adversário!`, "success");
              }}
              className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-primary hover:bg-cookbook-primary/10 hover:border-cookbook-primary/30 transition-all font-sans text-[10px] uppercase tracking-widest py-3 rounded-full font-bold shadow-sm active:scale-95 text-center flex items-center justify-center gap-2 group"
            >
              <Sparkles size={14} className="text-cookbook-primary/50 group-hover:text-cookbook-primary transition-colors" />
              Provocar
            </button>
            <button
              onClick={handleExportShare}
              disabled={isExporting}
              className="px-4 bg-cookbook-primary/10 border border-cookbook-primary/20 text-cookbook-primary hover:bg-cookbook-primary/20 transition-all rounded-full flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-50"
              title="Compartilhar Vitória"
            >
              <Share2 size={16} />
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-cookbook-border/30">
            <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-medium">
              Vantagem Atual:{" "}
              <span className="text-cookbook-primary font-bold">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(users[0].total - users[1].total)}
              </span>
            </span>
          </div>
        </motion.div>
      )}
      {/* Weekly breakdown */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 font-medium text-center">
          Desempenho Semanal
        </h3>
        <div className="space-y-4">
          {weeklyData.map((week, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-medium">
                <span>{week.label}</span>
                <span className="flex gap-4">
                  <span className="text-cookbook-primary">
                    {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(week.p1)}
                  </span>
                  <span className="text-emerald-500">
                    {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(week.p2)}
                  </span>
                </span>
              </div>
              <div className="flex h-2.5 gap-1 rounded-full overflow-hidden bg-cookbook-bg/50">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(week.p1 / maxWeeklyValue) * 50}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="bg-cookbook-primary/80 border border-cookbook-primary/20 rounded-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(week.p2 / maxWeeklyValue) * 50}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="bg-emerald-500/80 border border-emerald-500/20 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      {/* Advanced Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 font-medium text-center mb-5">
          Estatísticas Avançadas
        </h3>

        <div className="space-y-4">
          {/* Golpe Crítico */}
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-3 bg-cookbook-text/5 rounded-2xl border border-cookbook-border/30 group hover:border-cookbook-primary/20 transition-colors cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                <Zap size={14} />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold mb-0.5">Golpe Crítico</p>
                <p className="font-serif text-xs text-cookbook-text">Maior depósito único</p>
              </div>
            </div>
            <div className="text-right">
              {users[0].maxHit >= users[1].maxHit && users[0].maxHit > 0 ? (
                <>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold mb-0.5">{users[0].name}</p>
                  <p className="font-serif text-sm text-cookbook-primary">{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[0].maxHit)}</p>
                </>
              ) : users[1].maxHit > 0 ? (
                <>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-0.5">{users[1].name}</p>
                  <p className="font-serif text-sm text-emerald-500">{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[1].maxHit)}</p>
                </>
              ) : (
                <span className="font-serif text-xs text-cookbook-text/40">--</span>
              )}
            </div>
          </motion.div>

          {/* Ataque Rápido */}
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-3 bg-cookbook-text/5 rounded-2xl border border-cookbook-border/30 group hover:border-cookbook-primary/20 transition-colors cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <Target size={14} />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold mb-0.5">Ataque Rápido</p>
                <p className="font-serif text-xs text-cookbook-text">Mais depósitos feitos</p>
              </div>
            </div>
            <div className="text-right">
              {users[0].count >= users[1].count && users[0].count > 0 ? (
                <>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold mb-0.5">{users[0].name}</p>
                  <p className="font-serif text-sm text-cookbook-primary">{users[0].count}x</p>
                </>
              ) : users[1].count > 0 ? (
                <>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-0.5">{users[1].name}</p>
                  <p className="font-serif text-sm text-emerald-500">{users[1].count}x</p>
                </>
              ) : (
                <span className="font-serif text-xs text-cookbook-text/40">--</span>
              )}
            </div>
          </motion.div>

          {/* Escudo Forte */}
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-3 bg-cookbook-text/5 rounded-2xl border border-cookbook-border/30 group hover:border-cookbook-primary/20 transition-colors cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <Shield size={14} />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold mb-0.5">Escudo Forte</p>
                <p className="font-serif text-xs text-cookbook-text">Menos gastos no mês</p>
              </div>
            </div>
            <div className="text-right">
              {users[0].expenses <= users[1].expenses ? (
                <>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold mb-0.5">{users[0].name}</p>
                  <p className="font-serif text-sm text-cookbook-primary">- {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[0].expenses)}</p>
                </>
              ) : (
                <>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-0.5">{users[1].name}</p>
                  <p className="font-serif text-sm text-emerald-500">- {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[1].expenses)}</p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Historical Battles */}
      {pastStats.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-cookbook-text/40 font-bold mb-6 flex items-center justify-center gap-2">
            <Trophy size={12} className="text-cookbook-text/30" /> Histórico de Batalhas <Trophy size={12} className="text-cookbook-text/30" />
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pastStats.map((stat, idx) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={idx}
                className="bg-cookbook-bg/80 backdrop-blur-md border border-cookbook-border rounded-[2rem] p-5 flex flex-col shadow-sm relative overflow-hidden group transition-transform"
              >
                {/* Shiny gradient overlay */}
                {stat.winner && <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cookbook-gold/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>}

                <div className="text-center relative z-10 mb-3">
                  <div className="inline-block px-3 py-1 bg-cookbook-text/5 rounded-full font-sans text-[9px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-2">
                    {stat.label}
                  </div>
                </div>

                {stat.winner ? (
                  <div className="flex flex-col items-center justify-center relative z-10 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-cookbook-gold/20 to-cookbook-gold/5 rounded-full flex items-center justify-center mb-2 border border-cookbook-gold/30 shadow-inner">
                      <Trophy size={20} className="text-cookbook-gold drop-shadow-sm" />
                    </div>
                    <div className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text font-bold mb-1 text-center truncate w-full">
                      {stat.winner.name}
                    </div>
                    <div className="font-serif text-sm text-cookbook-text/80 tracking-tight">
                      {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(stat.u1.total - stat.u2.total))} <span className="text-cookbook-text/30 text-[9px] font-sans">dif</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center relative z-10 flex-1 opacity-50">
                    <div className="w-12 h-12 bg-cookbook-text/5 rounded-full flex items-center justify-center mb-2 border border-cookbook-text/10">
                      <span className="font-serif italic text-sm">--</span>
                    </div>
                    <div className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text font-bold">
                      Empate
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
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
