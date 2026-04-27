import React, { useState, useEffect, useMemo } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths, differenceInWeeks, parseISO, isPast, isToday, isTomorrow } from 'date-fns';

interface CountdownWidgetProps {
  targetDate: string;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({ targetDate }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const date = useMemo(() => parseISO(targetDate), [targetDate]);

  const totalDays = differenceInDays(date, now);
  const months = differenceInMonths(date, now);
  const weeks = differenceInWeeks(date, now) - months * 4;
  const days = totalDays - months * 30 - weeks * 7;
  const hours = differenceInHours(date, now) % 24;
  const minutes = differenceInMinutes(date, now) % 60;

  // Progress: from when config was set (approximate) to target
  // We'll show percentage of time elapsed assuming 365 day max window
  const maxDaysWindow = 365;
  const elapsed = Math.max(0, maxDaysWindow - totalDays);
  const timeProgress = Math.min((elapsed / maxDaysWindow) * 100, 100);

  if (isPast(date) && !isToday(date)) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200/60 rounded-xl p-4 text-center">
        <span className="text-2xl block mb-1">🎉</span>
        <p className="font-serif italic text-sm text-emerald-700">A viagem já chegou!</p>
        <p className="font-sans text-[9px] uppercase tracking-widest text-emerald-500 font-bold mt-1">Boa viagem, aproveitem cada momento!</p>
      </div>
    );
  }

  if (isToday(date)) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-xl p-4 text-center animate-pulse">
        <span className="text-2xl block mb-1">✈️</span>
        <p className="font-serif italic text-sm text-amber-800">Hoje é o grande dia!</p>
        <p className="font-sans text-[9px] uppercase tracking-widest text-amber-600 font-bold mt-1">É HOJE! Boa viagem!</p>
      </div>
    );
  }

  if (isTomorrow(date)) {
    return (
      <div className="bg-gradient-to-r from-cookbook-mural to-amber-50 border border-cookbook-gold/30 rounded-xl p-4 text-center">
        <span className="text-2xl block mb-1">🧳</span>
        <p className="font-serif italic text-sm text-cookbook-text">Amanhã é o dia!</p>
        <p className="font-sans text-[9px] uppercase tracking-widest text-cookbook-gold font-bold mt-1">Arrume as malas!</p>
      </div>
    );
  }

  const timeUnits = [
    { value: months, label: months === 1 ? 'mês' : 'meses', show: months > 0 },
    { value: weeks, label: weeks === 1 ? 'sem' : 'sem', show: weeks > 0 },
    { value: days, label: days === 1 ? 'dia' : 'dias', show: true },
    { value: hours, label: 'h', show: months === 0 },
    { value: minutes, label: 'min', show: months === 0 && weeks === 0 },
  ].filter(u => u.show && u.value >= 0);

  return (
    <div className="bg-cookbook-mural border border-cookbook-border rounded-xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-cookbook-primary/10 flex items-center justify-center">
            <span className="text-xs">⏳</span>
          </div>
          <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-bold">
            Contagem Regressiva
          </span>
        </div>
        <span className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/30 font-bold">
          {totalDays} dias
        </span>
      </div>

      {/* Time Units */}
      <div className="flex justify-center gap-2">
        {timeUnits.slice(0, 4).map((unit, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-cookbook-bg border border-cookbook-border rounded-lg w-14 h-14 flex items-center justify-center shadow-inner">
              <span className="font-serif text-2xl text-cookbook-text font-medium tabular-nums">
                {String(Math.max(0, unit.value)).padStart(2, '0')}
              </span>
            </div>
            <span className="font-sans text-[7px] uppercase tracking-widest text-cookbook-text/40 font-bold mt-1.5">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar (time elapsed) */}
      <div className="space-y-1">
        <div className="h-1 w-full bg-cookbook-border/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cookbook-primary/40 to-cookbook-primary rounded-full transition-all duration-1000"
            style={{ width: `${timeProgress}%` }}
          />
        </div>
        <p className="font-sans text-[8px] text-center text-cookbook-text/30 uppercase tracking-widest font-bold">
          {totalDays <= 7 ? '🔥 Quase lá!' : totalDays <= 30 ? 'Falta pouco!' : 'Tempo restante'}
        </p>
      </div>
    </div>
  );
};
