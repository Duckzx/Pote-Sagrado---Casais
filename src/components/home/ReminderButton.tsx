import React, { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { addWeeklyReminder } from "../../lib/calendar";
import { useAppStore } from "../../store/useAppStore";

const DAYS = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
  { id: 0, label: "Dom" },
];

/** Adds a weekly "save money" reminder to the phone's calendar. */
export const ReminderButton: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(5);
  const [hour, setHour] = useState(20);

  const add = async () => {
    await addWeeklyReminder(day, hour);
    addToast("Lembrete pronto 📅", "Confirme no seu calendário para receber o aviso toda semana.", "success");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-full border border-cookbook-border font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-text/60"
      >
        <CalendarPlus size={14} /> Lembrete semanal no calendário
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-2xl bg-cookbook-text/[0.04] p-3 space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDay(d.id)}
            className={`py-2 rounded-xl font-sans text-[10px] font-bold ${day === d.id ? "bg-cookbook-primary text-white" : "text-cookbook-text/60"}`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-sans text-xs text-cookbook-text/60">às</span>
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="flex-1 bg-cookbook-bg border border-cookbook-border rounded-xl px-3 py-2 font-sans text-sm text-cookbook-text"
          aria-label="Horário do lembrete"
        >
          {Array.from({ length: 16 }, (_, i) => i + 7).map((h) => (
            <option key={h} value={h}>{`${String(h).padStart(2, "0")}:00`}</option>
          ))}
        </select>
        <button onClick={add} className="px-4 py-2 rounded-xl bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest font-bold">
          Adicionar
        </button>
      </div>
    </div>
  );
};
