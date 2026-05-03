import React, { useState, useMemo } from "react";
import { Plus, Plane, Heart, Sparkles, ArrowRight } from "lucide-react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAppContext } from "../context/AppContext";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import confetti from "canvas-confetti";
import { playCoinSound, playSuccessSound, vibrate } from "../lib/audio";
import { Mission, FilterType, DEFAULT_MISSIONS } from "./Missoes/MissoesConstants";
import { MissionFilters } from "./Missoes/MissionFilters";
import { MissionCard } from "./Missoes/MissionCard";
import { MissionFormModal } from "./Missoes/MissionFormModal";
import { MissionCompleteModal } from "./Missoes/MissionCompleteModal";
import { useAppStore } from "../store/useAppStore";
import { AIAssistantModal } from "./AIAssistantModal";
import { CheapDateModal } from "./CheapDateModal";

export const MissoesTab: React.FC = () => {
  const { user, addToast, casalId } = useAppContext();
  const deposits = useAppStore(s => s.deposits);
  const tripConfig = useAppStore(s => s.tripConfig);
  
  const { customChallenges = [], battleChallenges = [] } = tripConfig || {};
  const currentUser = user;

  const [showAIModal, setShowAIModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const destination = tripConfig?.destination || "";
  const origin = tripConfig?.origin || "";
  const flightsUrl = `https://www.skyscanner.com.br/transport/flights/${origin || "gru"}/${destination || "anywhere"}/?adultsv2=2`;

  const [activeFilter, setActiveFilter] = useState<FilterType>("todas");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  /* Merge all missions */
  const allMissions = useMemo(() => {
    const missions: Mission[] = [];
    if (battleChallenges.length > 0) {
      missions.push(...DEFAULT_MISSIONS.filter((m) => m.category === "economia"));
      battleChallenges.forEach((bc: any) => {
        missions.push({
          id: bc.id,
          title: bc.title,
          desc: bc.desc || "",
          icon: bc.icon || "⭐",
          category: "desafio",
          reward: bc.reward || 0,
          recurrence: bc.recurrence || "livre",
        });
      });
    } else {
      missions.push(...DEFAULT_MISSIONS);
    }
    customChallenges.forEach((cc: any) => {
      missions.push({
        id: cc.id,
        title: cc.label,
        desc: "",
        icon: cc.icon || "⭐",
        category: "custom",
        reward: 0,
      });
    });
    return missions;
  }, [battleChallenges, customChallenges]);

  /* Filtered missions */
  const filteredMissions = useMemo(() => {
    if (activeFilter === "todas") return allMissions;
    return allMissions.filter((m) => m.category === activeFilter);
  }, [allMissions, activeFilter]);

  /* Streak calculation */
  const streaks = useMemo(() => {
    const getDateObj = (val: any) => {
      if (!val) return null;
      if (typeof val.toDate === "function") return val.toDate();
      if (val instanceof Date) return val;
      if (typeof val === "string" || typeof val === "number") return new Date(val);
      return null;
    };

    if (!currentUser) return {};
    const result: Record<string, { count: number; streak: number }> = {};
    
    const toLocalYYYYMMDD = (d: Date) => {
      const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
      return local.toISOString().split("T")[0];
    };

    allMissions.forEach((mission) => {
      const missionDeposits = deposits.filter(
        (d) =>
          d.who === currentUser.uid &&
          d.type !== "expense" &&
          (d.action === mission.title || d.action?.includes(mission.title)),
      );
      const count = missionDeposits.length;
      const dates = Array.from(
        new Set(
          missionDeposits
            .map((d) => {
              const date = getDateObj(d.createdAt);
              return date ? toLocalYYYYMMDD(date) : null;
            })
            .filter(Boolean) as string[],
        ),
      )
        .sort()
        .reverse();
      
      let streak = 0;
      if (dates.length > 0) {
        const today = new Date();
        const todayStr = toLocalYYYYMMDD(today);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = toLocalYYYYMMDD(yesterday);

        if (dates[0] === todayStr || dates[0] === yesterdayStr) {
          streak = 1;
          let currentDate = new Date(dates[0] + "T12:00:00");
          for (let i = 1; i < dates.length; i++) {
            currentDate.setDate(currentDate.getDate() - 1);
            if (dates[i] === toLocalYYYYMMDD(currentDate)) {
              streak++;
            } else {
              break;
            }
          }
        }
      }
      result[mission.id] = { count, streak };
    });
    return result;
  }, [deposits, allMissions, currentUser]);

  /* Submit completion */
  const handleCompleteSubmit = async (finalAmount: number, missionImage: string | null) => {
    if (!selectedMission || !casalId) return;
    try {
      const depositData: any = {
        amount: finalAmount,
        action:
          selectedMission.category === "desafio"
            ? `Desafio Concluído: ${selectedMission.title}`
            : selectedMission.title,
        who: user?.uid,
        whoName: user?.displayName || user?.email?.split("@")[0] || "Alguém",
        coupleId: casalId,
        createdAt: serverTimestamp(),
      };
      if (missionImage) {
        depositData.imageUrl = missionImage;
      }
      await addDoc(collection(db, `casais/${casalId}/deposits`), depositData);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8E7F6D", "#2C2A26", "#E8E4D9", "#C5A059"],
      });
      if (selectedMission.category === "desafio") {
        playSuccessSound();
      } else {
        playCoinSound();
      }
      vibrate([50, 30, 50]);
      addToast(
        selectedMission.category === "desafio"
          ? "⚔️ Desafio Concluído!"
          : "💚 Economia Registrada!",
        `+R$ ${finalAmount.toFixed(2)} para o pote!`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/deposits`);
    }
  };

  /* Save Edit/Add */
  const handleSaveMission = async (data: Partial<Mission> & { isNew: boolean }) => {
    if (!casalId) return;
    try {
      const isDesafio = data.category === "desafio";
      const configRef = doc(db, `casais/${casalId}/trip_config`, "main");
      
      if (data.isNew) {
        if (isDesafio) {
          const newChallenge = {
            id: `battle_${Date.now()}`,
            title: data.title,
            desc: data.desc,
            reward: data.reward,
            icon: data.icon,
          };
          const current =
            battleChallenges.length > 0
              ? battleChallenges
              : DEFAULT_MISSIONS.filter((m) => m.category === "desafio");
          await setDoc(
            configRef,
            { battleChallenges: [...current, newChallenge] },
            { merge: true },
          );
        } else {
          const newCustom = {
            id: `custom_${Date.now()}`,
            label: data.title,
            icon: data.icon,
          };
          await setDoc(
            configRef,
            { customChallenges: [...customChallenges, newCustom] },
            { merge: true },
          );
        }
        addToast("Boa Missão!", "Nova tarefa adicionada ao painel. Bora fazer!", "success");
      } else {
        if (isDesafio && editingMission) {
          const updatedChallenges = (
            battleChallenges.length > 0
              ? battleChallenges
              : DEFAULT_MISSIONS.filter((m) => m.category === "desafio")
          ).map((c: any) =>
            c.id === editingMission.id
              ? {
                  ...c,
                  title: data.title,
                  desc: data.desc,
                  reward: data.reward,
                  icon: data.icon,
                }
              : c,
          );
          await setDoc(
            configRef,
            { battleChallenges: updatedChallenges },
            { merge: true },
          );
        } else if (editingMission?.category === "custom") {
          const updatedCustom = customChallenges.map((c: any) =>
            c.id === editingMission.id
              ? { ...c, label: data.title, icon: data.icon }
              : c,
          );
          await setDoc(
            configRef,
            { customChallenges: updatedCustom },
            { merge: true },
          );
        }
        addToast("Tudo Certo!", "Missão editada com sucesso, mestre.", "success");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/trip_config`);
    }
  };

  /* Delete Mission */
  const handleDeleteMission = async (mission: Mission) => {
    if (!casalId) return;
    try {
      const configRef = doc(db, `casais/${casalId}/trip_config`, "main");
      if (mission.category === "desafio") {
        const current =
          battleChallenges.length > 0
            ? battleChallenges
            : DEFAULT_MISSIONS.filter((m) => m.category === "desafio");
        const updated = current.filter((c: any) => c.id !== mission.id);
        await setDoc(
          configRef,
          { battleChallenges: updated },
          { merge: true },
        );
      } else if (mission.category === "custom") {
        const updated = customChallenges.filter((c: any) => c.id !== mission.id);
        await setDoc(
          configRef,
          { customChallenges: updated },
          { merge: true },
        );
      }
      addToast("Missão Abortada =(", "Sumiu do mapa!", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/trip_config`);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-serif text-2xl text-cookbook-text mb-1">
          Missões
        </h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Economia vira aventura
        </p>
      </div>

      {/* AI Assistant Triggers */}
      <div className="space-y-4">
        <button
          onClick={() => setShowAIModal(true)}
          className="w-full bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-5 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all active:scale-[0.98] hover:border-cookbook-gold/30 group"
        >
          <div className="flex items-center space-x-4 text-cookbook-text">
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-cookbook-gold bg-cookbook-gold/10 group-hover:bg-cookbook-gold/20">
              <Sparkles size={16} />
            </div>
            <div className="text-left">
              <p className="font-serif text-base text-cookbook-text font-medium">
                Consultor de Viagem
              </p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium">
                Roteiro e Dicas com IA
              </p>
            </div>
          </div>
          <ArrowRight
            size={14}
            className="text-cookbook-text/30"
            strokeWidth={2}
          />
        </button>
        <div className="w-full grid grid-cols-2 gap-3">
          <a
            href={flightsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all active:scale-[0.98] hover:border-cookbook-primary/30 group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-full mb-3 flex items-center justify-center transition-colors text-cookbook-primary bg-cookbook-primary/10 group-hover:bg-cookbook-primary/20">
              <Plane size={14} />
            </div>
            <div className="text-left">
              <p className="font-serif text-sm text-cookbook-text font-medium truncate" title={destination || "Destino"}>
                Passagens
              </p>
              <p className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40 font-medium">
                Monitoramento
              </p>
            </div>
          </a>
          <button
            onClick={() => setShowDateModal(true)}
            className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all active:scale-[0.98] hover:border-cookbook-primary/30 group flex flex-col justify-between text-left"
          >
            <div className="w-8 h-8 rounded-full mb-3 flex items-center justify-center transition-colors text-cookbook-primary bg-cookbook-primary/10 group-hover:bg-cookbook-primary/20">
              <Heart size={14} />
            </div>
            <div className="text-left">
              <p className="font-serif text-sm text-cookbook-text font-medium whitespace-nowrap">
                Gerador Dates
              </p>
              <p className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40 font-medium">
                Ideias Grátis
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex justify-around bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="text-center">
          <div className="font-serif text-2xl text-cookbook-primary">
            {Object.values(streaks).reduce((acc, s) => acc + s.count, 0)}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/50 font-medium mt-1">
            Completadas
          </div>
        </div>
        <div className="w-px bg-cookbook-border/50" />
        <div className="text-center">
          <div className="font-serif text-2xl text-amber-500">
            {Math.max(...Object.values(streaks).map((s) => s.streak), 0)}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/50 font-medium mt-1">
            Melhor Streak
          </div>
        </div>
        <div className="w-px bg-cookbook-border/50" />
        <div className="text-center">
          <div className="font-serif text-2xl text-cookbook-text">
            {allMissions.length}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/50 font-medium mt-1">
            Missões
          </div>
        </div>
      </div>

      <MissionFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        allMissions={allMissions}
      />

      {/* Mission Cards */}
      <div className="space-y-3">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-10 px-6 bg-cookbook-bg border border-cookbook-border border-dashed rounded-xl w-full flex flex-col items-center">
            <div className="w-12 h-12 bg-cookbook-gold/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="font-serif italic text-cookbook-text/70 text-sm mb-2">
              Nenhuma missão aqui
            </p>
            <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold mb-6">
              Crie desafios personalizados ou use a IA para gerar novas
              aventuras!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-cookbook-primary text-white font-sans text-[9px] uppercase tracking-widest px-5 py-2.5 rounded-full font-bold transition-transform hover:bg-cookbook-primary-hover active:scale-95 flex items-center gap-2 shadow-md"
            >
              <Plus size={12} strokeWidth={2.5} /> Criar Primeira Missão
            </button>
          </div>
        ) : (
          filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              missionStats={streaks[mission.id] || { count: 0, streak: 0 }}
              onComplete={setSelectedMission}
              onEdit={setEditingMission}
              onDelete={handleDeleteMission}
            />
          ))
        )}
      </div>

      <button
        onClick={() => setShowAddForm(true)}
        className="w-full flex items-center justify-center gap-2 bg-cookbook-bg/90 backdrop-blur-md border border-dashed border-cookbook-border text-cookbook-text/60 font-sans text-[10px] uppercase tracking-widest py-4 rounded-full font-bold hover:bg-cookbook-border/30 hover:text-cookbook-primary transition-all active:scale-[0.98] shadow-sm"
      >
        <Plus size={16} /> <span>Nova Missão</span>
      </button>

      <MissionCompleteModal
        mission={selectedMission}
        isOpen={!!selectedMission}
        onClose={() => setSelectedMission(null)}
        onSubmit={handleCompleteSubmit}
      />

      <MissionFormModal
        isOpen={showAddForm || !!editingMission}
        mission={editingMission}
        onClose={() => {
          setShowAddForm(false);
          setEditingMission(null);
        }}
        onSave={handleSaveMission}
      />

      {showAIModal && (
        <AIAssistantModal
          destination={destination}
          origin={origin}
          onClose={() => setShowAIModal(false)}
        />
      )}
      {showDateModal && (
        <CheapDateModal
          onClose={() => setShowDateModal(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
