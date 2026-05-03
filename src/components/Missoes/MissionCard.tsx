import React from "react";
import { CheckCircle2, Pencil, Trash2, Flame } from "lucide-react";
import { Mission } from "./MissoesConstants";

interface MissionCardProps {
  mission: Mission;
  missionStats: { count: number; streak: number };
  onComplete: (mission: Mission) => void;
  onEdit: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  missionStats,
  onComplete,
  onEdit,
  onDelete,
}) => {
  const getCategoryBadge = (category: string) => {
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

  const badge = getCategoryBadge(mission.category);
  const isEditable =
    mission.category === "desafio" || mission.category === "custom";

  return (
    <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] group relative overflow-hidden">
      {/* Top accent line based on category */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          mission.category === "economia"
            ? "bg-emerald-400"
            : mission.category === "desafio"
              ? "bg-amber-400"
              : "bg-violet-400"
        }`}
      />
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-3xl mt-0.5 shrink-0">{mission.icon}</div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-serif italic text-sm text-cookbook-text leading-tight">
                {mission.title}
              </h4>
              {mission.desc && (
                <p className="font-sans text-[10px] text-cookbook-text/50 mt-0.5 leading-relaxed">
                  {mission.desc}
                </p>
              )}
            </div>
            {/* Edit/delete buttons (hover) */}
            {isEditable && (
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => onEdit(mission)}
                  className="text-cookbook-text/30 hover:text-cookbook-primary transition-colors p-1"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDelete(mission)}
                  className="text-cookbook-text/30 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
          {/* Bottom row: badge + stats + action */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              {/* Category badge */}
              <span
                className={`px-2 py-0.5 rounded-md font-sans text-[8px] uppercase tracking-widest font-bold border ${badge.color}`}
              >
                {badge.label}
              </span>
              {/* Reward */}
              {mission.reward > 0 && (
                <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold">
                  R$ {mission.reward}
                </span>
              )}
            </div>

            {/* Interactive Section */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1.5">
                {/* Count */}
                {missionStats.count > 0 && (
                  <span
                    className="flex items-center justify-center font-sans text-[10px] bg-cookbook-text/5 text-cookbook-text/60 px-1.5 py-0.5 rounded-md font-bold"
                    title="Vezes completadas"
                  >
                    ×{missionStats.count}
                  </span>
                )}
                {/* Streak indicator */}
                {missionStats.streak > 0 && (
                  <span
                    className="flex items-center gap-1 font-sans text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-bold"
                    title="Dias seguidos"
                  >
                    <Flame
                      size={12}
                      strokeWidth={2.5}
                      className="text-amber-500"
                    />{" "}
                    {missionStats.streak}
                  </span>
                )}
              </div>

              {/* Complete button */}
              <button
                onClick={() => onComplete(mission)}
                className="flex items-center gap-1 bg-cookbook-bg border border-cookbook-border px-3 py-1.5 rounded-lg text-[9px] font-sans uppercase tracking-widest font-bold text-cookbook-text hover:bg-cookbook-primary hover:text-white hover:border-cookbook-primary transition-all active:scale-95"
              >
                <CheckCircle2 size={11} /> <span>Cumpri!</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
