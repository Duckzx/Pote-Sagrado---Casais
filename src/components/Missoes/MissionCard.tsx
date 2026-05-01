import React from "react";
import { CheckCircle2, Flame, Pencil, Trash2 } from "lucide-react";
import { Mission } from "./MissoesConstants";

interface MissionCardProps {
  mission: Mission;
  streak: { count: number; streak: number } | undefined;
  onSelect: (mission: Mission) => void;
  onEdit: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  streak,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "economia":
        return {
          label: "ECONOMIA",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
      case "desafio":
        return {
          label: "DESAFIO",
          color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      case "custom":
        return {
          label: "PERSONALIZADO",
          color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
        };
      default:
        return { label: "", color: "" };
    }
  };

  const isEditable = (mission: Mission) =>
    mission.category === "desafio" || mission.category === "custom";

  const style = getCategoryStyle(mission.category);

  return (
    <div className="bg-cookbook-bg/80 backdrop-blur-md border border-cookbook-border rounded-[2rem] p-5 shadow-sm relative overflow-hidden group">
      <div className="flex gap-4">
        {/* Icon & Streak */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-cookbook-bg border border-cookbook-border/50 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative group-hover:scale-105 transition-transform duration-300">
            {mission.icon}
          </div>
          {streak && streak.streak > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Flame size={10} className="fill-amber-500" />
              <span className="font-sans text-[10px] font-bold">
                {streak.streak}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <h3 className="font-serif text-lg text-cookbook-text font-medium truncate">
              {mission.title}
            </h3>
            {mission.reward > 0 && (
              <span className="shrink-0 font-sans text-[10px] font-bold text-cookbook-primary bg-cookbook-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                + R$ {mission.reward}
              </span>
            )}
          </div>
          <p className="font-sans text-xs text-cookbook-text/60 leading-relaxed mb-3 line-clamp-2">
            {mission.desc || "Missão personalizada do casal"}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <span
              className={`font-sans text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded-md border ${style.color}`}
            >
              {style.label}
            </span>

            <div className="flex items-center gap-2">
              {isEditable(mission) && (
                <>
                  <button
                    onClick={() => onEdit(mission)}
                    className="p-2 text-cookbook-text/40 hover:text-cookbook-primary hover:bg-cookbook-primary/10 rounded-full transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {mission.category === "custom" && (
                    <button
                      onClick={() => onDelete(mission)}
                      className="p-2 text-cookbook-text/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => onSelect(mission)}
                className="w-10 h-10 bg-cookbook-primary text-white rounded-full flex items-center justify-center hover:bg-cookbook-primary-hover hover:scale-110 active:scale-95 transition-all shadow-md group-hover:shadow-lg"
              >
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
