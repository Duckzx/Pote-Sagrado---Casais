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
  Plus
} from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { playSuccessSound, vibrate } from "../lib/audio";
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
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  );
  /* Edit state */ const [editing, setEditing] = useState<any | null>(null);
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
        /* Month filter */ if (d.createdAt?.toDate) {
          const date = d.createdAt.toDate();
          if (
            date.getMonth() !== selectedMonth ||
            date.getFullYear() !== selectedYear
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
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
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
  /* Group by date */ const groupedByDate = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredDeposits.forEach((d) => {
      const date = d.createdAt?.toDate?.();
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
    let m = selectedMonth + dir;
    let y = selectedYear;
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    setSelectedMonth(m);
    setSelectedYear(y);
  };
  /* Edit handler */ const handleEdit = (deposit: any) => {
    setEditing(deposit);
    setEditAmount(deposit.amount.toString());
    setEditAction(deposit.action || "");
    if (deposit.createdAt?.toDate) {
      const dateStr = deposit.createdAt.toDate().toISOString().split('T')[0];
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
      if (editDate && editing.createdAt?.toDate) {
        const currentRef = editing.createdAt.toDate();
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
    if (!d?.createdAt?.toDate) return "";
    return d.createdAt
      .toDate()
      .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };
  const currentUser = auth.currentUser;
  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-5">
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
            {MONTHS_PT[selectedMonth]}{" "}
          </span>{" "}
          <span className="font-sans text-[9px] text-cookbook-text/40 ml-2">
            {" "}
            {selectedYear}{" "}
          </span>{" "}
        </div>{" "}
        <button
          onClick={() => goMonth(1)}
          className="text-cookbook-text/40 hover:text-cookbook-text transition-colors p-1"
        >
          {" "}
          →{" "}
        </button>{" "}
      </div>{" "}
      {/* Summary Cards */}{" "}
      <div className="grid grid-cols-3 gap-2">
        {" "}
        <div className="bg-emerald-50 border border-emerald-200/50 rounded-xl p-3 text-center">
          {" "}
          <ArrowUpCircle
            size={16}
            className="text-emerald-500 mx-auto mb-1"
          />{" "}
          <div className="font-serif text-sm text-emerald-700">
            {" "}
            {formatCurrency(totals.depositos)}{" "}
          </div>{" "}
          <div className="font-sans text-[7px] uppercase tracking-widest text-emerald-500/70 font-bold mt-0.5">
            {" "}
            Entradas{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-red-50 border border-red-200/50 rounded-xl p-3 text-center">
          {" "}
          <ArrowDownCircle
            size={16}
            className="text-red-500 mx-auto mb-1"
          />{" "}
          <div className="font-serif text-sm text-red-700">
            {" "}
            {formatCurrency(totals.gastos)}{" "}
          </div>{" "}
          <div className="font-sans text-[7px] uppercase tracking-widest text-red-500/70 font-bold mt-0.5">
            {" "}
            Saídas{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl p-3 text-center shadow-sm">
          {" "}
          <div
            className={`font-serif text-sm ${totals.saldo >= 0 ? "text-emerald-700" : "text-red-700"}`}
          >
            {" "}
            {formatCurrency(totals.saldo)}{" "}
          </div>{" "}
          <div className="font-sans text-[7px] uppercase tracking-widest text-cookbook-text/50 font-bold mt-0.5">
            {" "}
            Saldo{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Filter Row */}{" "}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {" "}
          {/* Type filter */}{" "}
          <div className="flex gap-1 flex-1">
            {" "}
            {[
              { id: "todos" as FilterType, label: "Todos" },
              { id: "depositos" as FilterType, label: "↑ Entradas" },
              { id: "gastos" as FilterType, label: "↓ Saídas" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-1 py-2 rounded-lg font-sans text-[8px] uppercase tracking-widest font-bold transition-all ${filter === f.id ? "bg-cookbook-primary text-white" : "bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border text-cookbook-text/50 hover:border-cookbook-primary/30"}`}
              >
                {" "}
                {f.label}{" "}
              </button>
            ))}{" "}
          </div>{" "}
          {/* User filter */}{" "}
          {users.length > 1 && (
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-lg px-2 py-1 font-sans text-[9px] uppercase tracking-widest text-cookbook-text focus:outline-none focus:border-cookbook-primary"
            >
              {" "}
              <option value="todos">👥 Ambos</option>{" "}
              {users.map(([uid, name]) => (
                <option key={uid} value={uid}>
                  {" "}
                  {name}{" "}
                </option>
              ))}{" "}
            </select>
          )}{" "}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔎 Buscar..."
            className="flex-1 bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-lg px-3 py-2 font-serif text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary placeholder:text-cookbook-text/30"
          />
          <button 
            onClick={() => setSortAsc(!sortAsc)}
            title={sortAsc ? "Mais antigos primeiro" : "Mais recentes primeiro"}
            className="bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-lg px-3 py-2 text-cookbook-text/60 hover:text-cookbook-primary transition-colors flex items-center justify-center shrink-0"
          >
             <ArrowUpCircle size={14} className={`transform transition-transform ${sortAsc ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
      </div>{" "}
      {/* Timeline */}{" "}
      <div className="space-y-5">
        {" "}
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-12 px-4 bg-cookbook-bg/90 backdrop-blur-md border border-dashed border-cookbook-border rounded-3xl">
            {" "}
            <span className="text-3xl block mb-3">📭</span>{" "}
            <p className="font-serif italic text-cookbook-text/60 text-sm mb-1">
              {" "}
              Nada por aqui ainda{" "}
            </p>{" "}
            <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">
              {" "}
              As transações deste mês aparecerão aqui{" "}
            </p>{" "}
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              {" "}
              {/* Date header */}{" "}
              <div className="flex items-center gap-2 mb-2.5">
                {" "}
                <Calendar size={10} className="text-cookbook-text/30" />{" "}
                <h4 className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40 font-bold">
                  {" "}
                  {dateLabel}{" "}
                </h4>{" "}
                <div className="flex-1 h-px bg-cookbook-border/50" />{" "}
              </div>{" "}
              {/* Items */}{" "}
              <div className="space-y-1.5">
                {" "}
                {items.map((deposit: any) => {
                  const isExpense = deposit.type === "expense";
                  const isOwner =
                    currentUser && deposit.who === currentUser.uid;
                  
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
                      className="flex items-center gap-3 bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 group"
                    >
                      {" "}
                      {/* Icon */}{" "}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isExpense ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}
                      >
                        {" "}
                        <Icon size={16} />
                      </div>{" "}
                      {/* Info */}{" "}
                      <div className="flex-1 min-w-0">
                        {" "}
                        <div className="flex items-center gap-1.5">
                          {" "}
                          <span className="font-serif italic text-xs text-cookbook-text truncate">
                            {" "}
                            {deposit.action ||
                              (isExpense ? "Gasto" : "Depósito")}{" "}
                          </span>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2 mt-0.5">
                          {" "}
                          <span className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/40 font-bold">
                            {" "}
                            {deposit.whoName}{" "}
                          </span>{" "}
                          <span className="font-sans text-[8px] text-cookbook-text/30">
                            {" "}
                            {formatTime(deposit)}{" "}
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Amount */}{" "}
                      <div className="text-right shrink-0">
                        {" "}
                        <span
                          className={`font-serif text-sm font-medium ${isExpense ? "text-red-500" : "text-emerald-600"}`}
                        >
                          {" "}
                          {isExpense ? "−" : "+"}{" "}
                          {formatCurrency(deposit.amount)}{" "}
                        </span>{" "}
                      </div>{" "}
                      {/* Actions */}{" "}
                      {isOwner && (
                        <div className="flex gap-0.5 opacity-100 shrink-0">
                          {" "}
                          <button
                            onClick={() => handleEdit(deposit)}
                            className="text-cookbook-text/30 hover:text-cookbook-primary p-2 transition-colors"
                          >
                            {" "}
                            <Pencil size={14} />{" "}
                          </button>{" "}
                          <button
                            onClick={() => setDeleting(deposit)}
                            className="text-cookbook-text/30 hover:text-red-500 p-2 transition-colors"
                          >
                            {" "}
                            <Trash2 size={14} />{" "}
                          </button>{" "}
                        </div>
                      )}{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
            </div>
          ))
        )}{" "}
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
            <div className="flex gap-3">
              {" "}
              <button
                onClick={() => setEditing(null)}
                className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-cookbook-border/30 transition-colors"
              >
                {" "}
                Cancelar{" "}
              </button>{" "}
              <button
                onClick={confirmEdit}
                disabled={
                  !editAmount ||
                  isNaN(Number(editAmount.replace(",", "."))) ||
                  Number(editAmount.replace(",", ".")) <= 0
                }
                className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
              >
                {" "}
                Salvar{" "}
              </button>{" "}
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
