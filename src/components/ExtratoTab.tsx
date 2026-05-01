import React, { useState, useMemo } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Pencil,
  Trash2,
  X,
  Calendar,
  User,
  Utensils,
  Car,
  ShoppingCart,
  Smartphone,
  Plus,
  Download,
  MoreVertical,
  Heart
} from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { playSuccessSound, vibrate } from "../lib/audio";
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getDateObj } from "../lib/utils";
interface ExtratoTabProps {
  deposits: any[];
  addToast: (
    title: string,
    message: string,
    type: "info" | "success" | "milestone",
  ) => void;
}
type FilterType = "todos" | "depositos" | "gastos";
const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
export const ExtratoTab: React.FC<ExtratoTabProps> = ({
  deposits,
  addToast,
}) => {
  const [filter, setFilter] = useState<FilterType>("todos");
  const [filterUser, setFilterUser] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(-1); // -1 = Todos os meses
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  );
  /* Edit state */ const [editing, setEditing] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editAction, setEditAction] = useState("");
  const [editDate, setEditDate] = useState("");
  /* Delete state */ const [deleting, setDeleting] = useState<any | null>(null);
  /* Get unique users */ const users = useMemo(() => {
    const map = new Map<string, string>();
    deposits.forEach((d) => {
      if (d.who && d.whoName && !map.has(d.who)) {
        map.set(d.who, d.whoName);
      }
    });
    return Array.from(map.entries());
  }, [deposits]);

  /* Filtered and sorted deposits */ const filteredDeposits = useMemo(() => {
    return deposits
      .filter((d) => {
        const dDate = getDateObj(d.createdAt);
        /* Month filter */ if (selectedMonth !== -1 && dDate) {
          if (
            dDate.getMonth() !== selectedMonth ||
            dDate.getFullYear() !== selectedYear
          )
            return false;
        }
        /* Type filter */ if (filter === "depositos" && d.type === "expense")
          return false;
        if (filter === "gastos" && d.type !== "expense") return false;
        /* User filter */ if (filterUser !== "todos" && d.who !== filterUser)
          return false;
        /* Search Query Filter */ if (searchQuery.trim() !== "") {
          const textMatches = (d.action || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (d.whoName || "").toLowerCase().includes(searchQuery.toLowerCase());
          if (!textMatches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aTime = getDateObj(a.createdAt) || new Date(0);
        const bTime = getDateObj(b.createdAt) || new Date(0);
        return sortAsc ? aTime.getTime() - bTime.getTime() : bTime.getTime() - aTime.getTime();
      });
  }, [deposits, filter, filterUser, selectedMonth, selectedYear, searchQuery, sortAsc]);
  /* Totals */ const totals = useMemo(() => {
    let depositos = 0;
    let gastos = 0;
    filteredDeposits.forEach((d) => {
      if (d.type === "expense") gastos += d.amount;
      else depositos += d.amount;
    });
    return { depositos, gastos, saldo: depositos - gastos };
  }, [filteredDeposits]);
  /* User Contributions */ const userContributions = useMemo(() => {
    const contributionMap: Record<string, { name: string; amount: number }> = {};
    filteredDeposits.forEach((d) => {
      if (d.type !== "expense" && d.who && d.whoName) {
        if (!contributionMap[d.who]) {
          contributionMap[d.who] = { name: d.whoName.split(' ')[0], amount: 0 };
        }
        contributionMap[d.who].amount += d.amount;
      }
    });
    return Object.values(contributionMap).sort((a, b) => b.amount - a.amount);
  }, [filteredDeposits]);

  /* Group by date */ const groupedByDate = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredDeposits.forEach((d) => {
      const date = getDateObj(d.createdAt);
      const key = date
        ? date.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })
        : "Sem data";
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return groups;
  }, [filteredDeposits]);
  /* Navigate months */ const goMonth = (dir: number) => {
    let m = selectedMonth;
    let y = selectedYear;
    
    if (m === -1) {
       const now = new Date();
       if (dir < 0) {
         m = now.getMonth();
         y = now.getFullYear();
       } else {
         m = 0;
         y = now.getFullYear();
       }
    } else {
       m += dir;
       if (m < -1) { m = 11; y--; }
       else if (m > 11) { m = -1; y++; }
    }
    
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  /* Insights */
  const insights = useMemo(() => {
    if (deposits.length === 0) return null;
    const dp = filteredDeposits.filter(d => d.type !== 'expense');
    const ex = filteredDeposits.filter(d => d.type === 'expense');

    const biggestDeposit = dp.length > 0 ? dp.reduce((prev, current) => (prev.amount > current.amount) ? prev : current) : null;
    const biggestExpense = ex.length > 0 ? ex.reduce((prev, current) => (prev.amount > current.amount) ? prev : current) : null;
    
    return { biggestDeposit, biggestExpense };
  }, [filteredDeposits]);
  
  /* Chart Data */
  const chartData = useMemo(() => {
    if (selectedMonth === -1) {
      const monthlyStats: Record<string, { label: string; index: number; Entradas: number; Saídas: number }> = {};
      deposits.forEach(d => {
        const date = getDateObj(d.createdAt);
        if (!date) return;
        const m = date.getMonth();
        const y = date.getFullYear();
        const key = `${y}-${m}`;
        if (!monthlyStats[key]) {
           monthlyStats[key] = { label: `${MONTHS_PT[m].slice(0, 3)}/${y.toString().slice(-2)}`, index: y * 12 + m, Entradas: 0, Saídas: 0 };
        }
        if (d.type === 'expense') monthlyStats[key].Saídas += d.amount;
        else monthlyStats[key].Entradas += d.amount;
      });
      return Object.values(monthlyStats).sort((a,b) => a.index - b.index);
    } else {
      const dailyStats: Record<string, { label: string; index: number; Entradas: number; Saídas: number }> = {};
      filteredDeposits.forEach(d => {
        const date = getDateObj(d.createdAt);
        if (!date) return;
        const dy = date.getDate();
        const key = dy.toString();
        if (!dailyStats[key]) {
           dailyStats[key] = { label: `${dy}`, index: dy, Entradas: 0, Saídas: 0 };
        }
        if (d.type === 'expense') dailyStats[key].Saídas += d.amount;
        else dailyStats[key].Entradas += d.amount;
      });
      return Object.values(dailyStats).sort((a,b) => a.index - b.index);
    }
  }, [selectedMonth, deposits, filteredDeposits]);
  
  /* Edit handler */ const handleEdit = (deposit: any) => {
    setEditing(deposit);
    setEditAmount(deposit.amount.toString());
    setEditAction(deposit.action || "");
    const dDate = getDateObj(deposit.createdAt);
    if (dDate) {
      const dateStr = dDate.toISOString().split('T')[0];
      setEditDate(dateStr);
    } else {
      setEditDate("");
    }
  };
  const confirmEdit = async () => {
    const parsedAmount = Number(editAmount.replace(",", "."));
    if (!editing || !editAmount || isNaN(parsedAmount) || parsedAmount <= 0)
      return;
    try {
      const updateData: any = {
        amount: parsedAmount,
        action: editAction,
      };
      const dDate = getDateObj(editing.createdAt);
      if (editDate && dDate) {
        const currentRef = dDate;
        const newDate = new Date(editDate);
        // keep the original time
        newDate.setHours(currentRef.getHours(), currentRef.getMinutes(), currentRef.getSeconds());
        updateData.createdAt = newDate;
      }

      await updateDoc(doc(db, "deposits", editing.id), updateData);
      playSuccessSound();
      vibrate([30, 30]);
      addToast(
        "Tudo Certo!",
        "Transação editada com sucesso. Fica o registro!",
        "success",
      );
      setEditing(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "deposits");
    }
  };
  /* Delete handler */ const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDoc(doc(db, "deposits", deleting.id));
      addToast("Apagado!", "Transação excluída. Foi pro buraco negro.", "info");
      setDeleting(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "deposits");
    }
  };
  const formatCurrency = (val: number) =>
    Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      val,
    );
  const formatTime = (d: any) => {
    const dDate = getDateObj(d?.createdAt);
    if (!dDate) return "";
    return dDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };
  const currentUser = auth.currentUser;

  const handleExportCSV = () => {
    if (filteredDeposits.length === 0) {
      addToast("Atenção", "Nenhuma transação para exportar neste mês.", "info");
      return;
    }
    const headers = ["Data", "Hora", "Tipo", "Valor", "Usuário", "Descrição"];
    const rows = filteredDeposits.map(d => {
      const dateObj = getDateObj(d.createdAt) || new Date();
      const date = dateObj.toLocaleDateString('pt-BR');
      const time = dateObj.toLocaleTimeString('pt-BR');
      const type = d.type === 'expense' ? "Saída" : "Entrada";
      const value = d.amount.toString().replace('.', ',');
      const person = d.whoName || "Desconhecido";
      const desc = `"${(d.action || "").replace(/"/g, '""')}"`;
      return [date, time, type, value, person, desc].join(";");
    });
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n"); // BOM for excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `extrato_${selectedMonth === -1 ? 'todos' : MONTHS_PT[selectedMonth]}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Sucesso", "Extrato exportado para CSV com sucesso!", "success");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 mt-8">
      {" "}
      {/* Header */}{" "}
      <div className="text-center">
        {" "}
        <h2 className="font-serif text-2xl text-cookbook-text mb-1">
          {" "}
          Extrato{" "}
        </h2>{" "}
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          {" "}
          Todo o histórico do pote{" "}
        </p>{" "}
      </div>{" "}
      {/* Month selector */}{" "}
      <div className="flex items-center justify-between bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        {" "}
        <button
          onClick={() => goMonth(-1)}
          className="text-cookbook-text/40 hover:text-cookbook-text transition-colors p-1"
        >
          {" "}
          ←{" "}
        </button>{" "}
        <div className="text-center">
          {" "}
          <span className="font-serif text-sm text-cookbook-text">
            {" "}
            {selectedMonth === -1 ? "Todos os Meses" : MONTHS_PT[selectedMonth]}{" "}
          </span>{" "}
          {selectedMonth !== -1 && (
            <span className="font-sans text-[9px] text-cookbook-text/40 ml-2">
              {" "}
              {selectedYear}{" "}
            </span>
          )}
        </div>{" "}
        <button
          onClick={() => goMonth(1)}
          className="text-cookbook-text/40 hover:text-cookbook-text transition-colors p-1"
        >
          {" "}
          →{" "}
        </button>{" "}
      </div>{" "}
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          <ArrowUpCircle size={18} className="text-emerald-500 mx-auto mb-2 opacity-80" />
          <div className="font-serif text-sm text-emerald-700 font-medium">
             {formatCurrency(totals.depositos)}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-emerald-600/70 font-bold mt-1">
             Entradas
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          <ArrowDownCircle size={18} className="text-red-500 mx-auto mb-2 opacity-80" />
          <div className="font-serif text-sm text-red-700 font-medium">
             {formatCurrency(totals.gastos)}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-red-600/70 font-bold mt-1">
             Saídas
          </div>
        </div>
        <div className="bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl p-4 text-center shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cookbook-primary/5 to-transparent"></div>
          <div className={`font-serif text-base mb-1 ${totals.saldo >= 0 ? "text-emerald-700" : "text-red-700"}`}>
             {formatCurrency(totals.saldo)}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/50 font-bold mt-2">
             Saldo Atual
          </div>
        </div>
      </div>

      {/* User Contributions "Versus with love" */}
      {userContributions.length >= 2 && (
        <div className="bg-cookbook-bg/60 backdrop-blur-md border border-cookbook-border rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden flex items-center justify-between mx-1">
          <div className="text-center flex-1 z-10">
            <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold block mb-1">
              {userContributions[0].name}
            </span>
            <span className="font-serif text-sm text-cookbook-text font-medium">
              {formatCurrency(userContributions[0].amount)}
            </span>
          </div>
          
          <div className="shrink-0 px-4 text-center z-10">
            <div className="bg-red-500/10 text-red-500 rounded-full w-9 h-9 flex items-center justify-center relative mx-auto group">
               <span className="font-sans text-[10px] font-bold italic absolute group-hover:opacity-0 transition-opacity">VS</span>
               <Heart size={16} className="opacity-0 group-hover:opacity-100 transition-opacity absolute" fill="currentColor" />
            </div>
          </div>

          <div className="text-center flex-1 z-10">
            <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold block mb-1">
              {userContributions[1].name}
            </span>
            <span className="font-serif text-sm text-cookbook-text font-medium">
              {formatCurrency(userContributions[1].amount)}
            </span>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cookbook-border to-transparent -z-0"></div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-cookbook-bg/60 backdrop-blur-md border border-cookbook-border rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
               <defs>
                 <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                 </linearGradient>
                 <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'Inter' }} dy={10} minTickGap={15} />
               <RechartsTooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '12px', fontFamily: 'Inter' }} />
               <Area type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEntradas)" />
               <Area type="monotone" dataKey="Saídas" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSaidas)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col gap-3">
        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cookbook-text/40">
              <span className="text-sm">🔎</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar histórico..."
              className="w-full bg-white/60 backdrop-blur-md border border-cookbook-border rounded-xl pl-10 pr-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:ring-2 focus:ring-cookbook-primary/20 focus:border-cookbook-primary transition-all placeholder:text-cookbook-text/30 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
            />
            {searchQuery && (
               <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-cookbook-text/30 hover:text-cookbook-text">
                 <X size={14} />
               </button>
            )}
          </div>
          
          <button 
            onClick={() => setSortAsc(!sortAsc)}
            title={sortAsc ? "Mais antigos primeiro" : "Mais recentes primeiro"}
            className="bg-white/60 backdrop-blur-md border border-cookbook-border rounded-xl h-[46px] px-4 text-cookbook-text/60 hover:text-cookbook-primary hover:bg-cookbook-primary/5 transition-all flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
          >
             <ArrowUpCircle size={18} className={`transform transition-transform ${sortAsc ? 'rotate-0' : 'rotate-180'}`} />
          </button>
          
          <button 
            onClick={handleExportCSV}
            title="Exportar CSV"
            className="bg-white/60 backdrop-blur-md border border-cookbook-border rounded-xl h-[46px] px-4 text-cookbook-primary hover:bg-cookbook-primary/10 transition-all flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
          >
             <Download size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {/* Type filter */}
          <div className="flex bg-cookbook-bg/80 backdrop-blur-md border border-cookbook-border p-1 rounded-xl shrink-0">
            {[
              { id: "todos" as FilterType, label: "Todos" },
              { id: "depositos" as FilterType, label: "Entradas" },
              { id: "gastos" as FilterType, label: "Saídas" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-lg font-sans text-[10px] uppercase tracking-wider font-bold transition-all whitespace-nowrap ${filter === f.id ? "bg-cookbook-primary text-white shadow-sm" : "text-cookbook-text/50 hover:text-cookbook-text"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* User filter */}
          {users.length > 1 && (
            <div className="relative shrink-0">
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="appearance-none bg-cookbook-bg/80 backdrop-blur-md border border-cookbook-border rounded-xl pl-4 pr-8 py-2 font-sans text-[10px] uppercase tracking-wider text-cookbook-text/70 font-bold focus:outline-none focus:border-cookbook-primary h-[34px]"
              >
                <option value="todos">👥 Ambos</option>
                {users.map(([uid, name]) => (
                  <option key={uid} value={uid}>
                    👤 {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cookbook-text/40">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          )}
        </div>
      </div>{" "}

      {/* Insights */}
      {insights && (insights.biggestDeposit || insights.biggestExpense) && (
        <div className="flex gap-2">
          {insights.biggestDeposit && (
            <div className="flex-1 bg-cookbook-bg/60 backdrop-blur-md border border-cookbook-border rounded-xl p-3 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/4"></div>
               <div className="font-sans text-[8px] uppercase tracking-widest text-emerald-500/80 mb-1 flex items-center gap-1">
                 <ArrowUpCircle size={10} /> Maior Entrada
               </div>
               <div className="font-serif text-sm text-cookbook-text font-medium">
                 {formatCurrency(insights.biggestDeposit.amount)}
               </div>
               <div className="font-sans text-[9px] text-cookbook-text/50 truncate mt-0.5">
                 {insights.biggestDeposit.whoName}
               </div>
            </div>
          )}
          {insights.biggestExpense && (
            <div className="flex-1 bg-cookbook-bg/60 backdrop-blur-md border border-cookbook-border rounded-xl p-3 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/4"></div>
               <div className="font-sans text-[8px] uppercase tracking-widest text-red-500/80 mb-1 flex items-center gap-1">
                 <ArrowDownCircle size={10} /> Maior Saída
               </div>
               <div className="font-serif text-sm text-cookbook-text font-medium">
                 {formatCurrency(insights.biggestExpense.amount)}
               </div>
               <div className="font-sans text-[9px] text-cookbook-text/50 truncate mt-0.5" title={insights.biggestExpense.action || "Sem descrição"}>
                 {insights.biggestExpense.action || "Sem descrição"}
               </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-12 px-4 bg-cookbook-bg/90 backdrop-blur-md border border-dashed border-cookbook-border rounded-3xl">
            <span className="text-3xl block mb-3 grayscale opacity-50">📭</span>
            <p className="font-serif italic text-cookbook-text/60 text-sm mb-1">
              Nada por aqui ainda
            </p>
            <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">
              As transações deste mês aparecerão aqui
            </p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateLabel, items]) => {
            const dailyBalance = items.reduce((acc: number, d: any) => d.type === "expense" ? acc - d.amount : acc + d.amount, 0);
            
            return (
              <div key={dateLabel} className="bg-cookbook-bg/40 border border-cookbook-border/30 rounded-3xl p-1 relative">
                {/* Receipt top notch decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-cookbook-bg rounded-full border border-cookbook-border/30 z-10" />
                
                {/* Date header */}
                <div className="bg-cookbook-bg border-b border-dashed border-cookbook-border py-4 px-5 rounded-t-3xl flex items-center justify-between">
                  <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-cookbook-text/60 font-bold flex items-center gap-2">
                    <Calendar size={12} className="text-cookbook-text/40" />
                    {dateLabel}
                  </span>
                  <div className="text-right">
                    <span className="font-sans text-[7px] uppercase tracking-widest text-cookbook-text/40 font-bold block leading-tight">
                      Saldo do Dia
                    </span>
                    <span className={`font-serif text-xs font-medium ${dailyBalance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {dailyBalance >= 0 ? "+" : ""}{formatCurrency(dailyBalance)}
                    </span>
                  </div>
                </div>
                
                {/* Items */}
                <div className="space-y-0.5 bg-cookbook-bg rounded-b-3xl overflow-hidden">
                  {items.map((deposit: any, idx: number) => {
                    const isExpense = deposit.type === "expense";
                    const isOwner = currentUser && deposit.who === currentUser.uid;
                    
                    // Pick dynamic icon based on action text
                    const act = (deposit.action || "").toLowerCase();
                    let Icon = isExpense ? ArrowDownCircle : ArrowUpCircle;
                    if (act.includes('ifood') || act.includes('comida') || act.includes('pizza') || act.includes('lanche')) Icon = Utensils;
                    else if (act.includes('uber') || act.includes('carro') || act.includes('gasolina')) Icon = Car;
                    else if (act.includes('compra') || act.includes('shopping') || act.includes('mercado')) Icon = ShoppingCart;
                    else if (act.includes('pix') || act.includes('transferência') || act.includes('celular') || act.includes('app')) Icon = Smartphone;

                    return (
                      <div
                        key={deposit.id}
                        className={`relative flex flex-col group transition-colors ${idx !== items.length - 1 ? 'border-b border-cookbook-border/30' : ''} ${isExpense ? 'bg-red-500/[0.02] hover:bg-red-500/[0.05]' : 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]'}`}
                      >
                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${isExpense ? 'bg-red-500/30' : 'bg-emerald-500/30'}`} />
                        <div className="relative flex items-center justify-between gap-3 px-4 py-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0 pl-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${isExpense ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                              <Icon size={18} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-serif text-sm text-cookbook-text truncate font-medium">
                                {deposit.action || (isExpense ? "Saída" : "Entrada")}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="font-sans text-[8px] uppercase tracking-widest bg-cookbook-text/5 text-cookbook-text/60 px-1.5 py-0.5 rounded-full font-bold truncate max-w-[80px]">
                                  {deposit.whoName.split(' ')[0]}
                                </span>
                                <span className="font-sans text-[9px] text-cookbook-text/40">
                                  {formatTime(deposit)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex items-center gap-2">
                            <span className={`font-serif text-lg font-medium tracking-tight whitespace-nowrap ${isExpense ? "text-red-500" : "text-emerald-600"}`}>
                              {isExpense ? "−" : "+"}
                              {formatCurrency(deposit.amount).replace('R$', '').trim()}
                            </span>
                          </div>
                        </div>
                        
                        {isOwner && (
                          <div className="flex border-t border-cookbook-border/10">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(deposit); }}
                              className="flex-1 flex items-center justify-center py-2.5 gap-2 text-[10px] uppercase font-bold tracking-widest text-cookbook-text/40 hover:text-cookbook-primary hover:bg-cookbook-primary/5 transition-colors"
                            >
                              <Pencil size={12} /> Editar
                            </button>
                            <div className="w-px bg-cookbook-border/10" />
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleting(deposit); }}
                              className="flex-1 flex items-center justify-center py-2.5 gap-2 text-[10px] uppercase font-bold tracking-widest text-cookbook-text/40 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                            >
                              <Trash2 size={12} /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    );
              })}
              </div>
            </div>
          );
        })
        )}
      </div>{" "}
      {/* Total count */}{" "}
      {filteredDeposits.length > 0 && (
        <div className="text-center pt-2">
          {" "}
          <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/30 font-bold">
            {" "}
            {filteredDeposits.length} transaç{" "}
            {filteredDeposits.length === 1 ? "ão" : "ões"}{" "}
          </span>{" "}
        </div>
      )}{" "}
      {/* ========== Edit Modal ========== */}{" "}
      {editing && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop"
          onClick={() => setEditing(null)}
        >
          {" "}
          <div
            className="bg-cookbook-bg shadow-xl border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <button
              onClick={() => setEditing(null)}
              className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-primary transition-colors"
            >
              {" "}
              <X size={20} />{" "}
            </button>{" "}
            <h3 className="font-serif text-xl text-cookbook-text mb-5 font-medium">
              {" "}
              Editar Transação{" "}
            </h3>{" "}
            <div className="space-y-3 mb-6">
              {" "}
              <input
                type="text"
                value={editAction}
                onChange={(e) => setEditAction(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />{" "}
              {editDate && (
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                />
              )}{" "}
              <div className="relative">
                {" "}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-lg">
                  {" "}
                  R${" "}
                </span>{" "}
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl py-3 pl-12 pr-4 font-serif text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                  autoFocus
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex gap-2">
              <button
                onClick={() => { setDeleting(editing); setEditing(null); }}
                className="flex items-center justify-center p-3 px-5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-colors"
                title="Apagar transação"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={confirmEdit}
                disabled={
                  !editAmount ||
                  isNaN(Number(editAmount.replace(",", "."))) ||
                  Number(editAmount.replace(",", ".")) <= 0
                }
                className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
              >
                Salvar
              </button>
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* ========== Delete Modal ========== */}{" "}
      {deleting && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop"
          onClick={() => setDeleting(null)}
        >
          {" "}
          <div
            className="bg-cookbook-bg shadow-xl border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <span className="text-4xl block mb-4">🗑️</span>{" "}
            <h3 className="font-serif text-xl text-cookbook-text mb-2 font-medium">
              {" "}
              Excluir Transação?{" "}
            </h3>{" "}
            <p className="font-sans text-xs text-cookbook-text/60 mb-6">
              {" "}
              <strong>{formatCurrency(deleting.amount)}</strong> —{" "}
              {deleting.action || "Sem descrição"}{" "}
            </p>{" "}
            <div className="flex gap-3">
              {" "}
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-cookbook-border/30 transition-colors"
              >
                {" "}
                Cancelar{" "}
              </button>{" "}
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-xl font-bold"
              >
                {" "}
                Excluir{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
