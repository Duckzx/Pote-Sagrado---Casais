import React from "react";
import { FILTERS, FilterType, Mission } from "./MissoesConstants";

interface MissionFiltersProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  allMissions: Mission[];
}

export const MissionFilters: React.FC<MissionFiltersProps> = ({
  activeFilter,
  setActiveFilter,
  allMissions,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1 mt-6 mb-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveFilter(filter.id)}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-widest font-medium whitespace-nowrap transition-all ${
            activeFilter === filter.id
              ? "bg-cookbook-primary text-white shadow-md"
              : "bg-cookbook-bg border border-cookbook-border/30 text-cookbook-text/60 hover:border-cookbook-primary/40 hover:bg-cookbook-border/30"
          }`}
        >
          <span>{filter.emoji}</span> <span>{filter.label}</span>
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] ${
              activeFilter === filter.id ? "bg-white/20" : "bg-cookbook-bg"
            }`}
          >
            {filter.id === "todas"
              ? allMissions.length
              : allMissions.filter((m) => m.category === filter.id).length}
          </span>
        </button>
      ))}
    </div>
  );
};
