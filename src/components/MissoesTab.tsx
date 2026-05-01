import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { addDoc, collection, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import confetti from "canvas-confetti";
import { playCoinSound, playSuccessSound, vibrate } from "../lib/audio";
import { getDateObj } from "../lib/utils";

import { Mission, FilterType, DEFAULT_MISSIONS } from "./Missoes/MissoesConstants";
import { MissionFilters } from "./Missoes/MissionFilters";
import { MissionCard } from "./Missoes/MissionCard";
import { MissionCompleteModal } from "./Missoes/MissionCompleteModal";
import { MissionFormModal } from "./Missoes/MissionFormModal";

interface MissoesTabProps {
  stats: Record<string, number>;
  customChallenges?: any[];
  battleChallenges?: any[];
  deposits: any[];
  currentUser: any;
  addToast: (title: string, message: string, type: "info" | "success" | "milestone") => void;
}

export const MissoesTab: React.FC<MissoesTabProps> = ({
  customChallenges = [],
  battleChallenges = [],
  deposits,
  currentUser,
  addToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("todas");

  /* Mission Complete State */
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [amount, setAmount] = useState("");
  const [missionImage, setMissionImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Edit Mission State */
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editReward, setEditReward] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  /* Add Mission State */
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newReward, setNewReward] = useState("");
  const [newIcon, setNewIcon] = useState("⭐");
  const [newCategory, setNewCategory] = useState<"economia" | "desafio">("desafio");

  /* Merge all missions */
  const allMissions = useMemo(() => {
    const missions: Mission[] = [];
    if (battleChallenges.length > 0) {
      missions.push(...DEFAULT_MISSIONS.filter((m) => m.category === "economia"));
      battleChallenges.forEach((bc) => {
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
    customChallenges.forEach((cc) => {
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
    if (!currentUser) return {};
    const result: Record<string, { count: number; streak: number }> = {};
    const toLocalYYYYMMDD = (d: Date) => {
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().split("T")[0];
    };

    allMissions.forEach((mission) => {
      const missionDeposits = deposits.filter(
        (d) =>
          d.who === currentUser.uid &&
          d.type !== "expense" &&
          (d.action === mission.title || d.action?.includes(mission.title))
      );
      const count = missionDeposits.length;
      const dates = Array.from(
        new Set(
          missionDeposits
            .map((d) => {
              const date = getDateObj(d.createdAt);
              return date ? toLocalYYYYMMDD(date) : null;
            })
            .filter(Boolean) as string[]
        )
      )
        .sort()
        .reverse();

      let streak = 0;
      if (dates.length > 0) {
        const todayStr = toLocalYYYYMMDD(new Date());
        const yesterday = new Date();
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

  /* Handlers: Complete */
  const handleComplete = async () => {
    if (!selectedMission) return;
    let parsedAmount = 0;
    if (amount) {
      parsedAmount = Number(amount.replace(",", "."));
    }
    const finalAmount = selectedMission.reward > 0 ? selectedMission.reward : parsedAmount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const depositData: any = {
        amount: finalAmount,
        action:
          selectedMission.category === "desafio"
            ? `Desafio Concluído: ${selectedMission.title}`
            : selectedMission.title,
        who: user.uid,
        whoName: user.displayName || user.email?.split("@")[0] || "Alguém",
        createdAt: serverTimestamp(),
      };
      if (missionImage) {
        depositData.imageUrl = missionImage;
      }
      await addDoc(collection(db, "deposits"), depositData);
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
        selectedMission.category === "desafio" ? "⚔️ Desafio Concluído!" : "💚 Economia Registrada!",
        `+R$ ${finalAmount.toFixed(2)} para o pote!`,
        "success"
      );
      setSelectedMission(null);
      setAmount("");
      setMissionImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "deposits");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Handlers: Edit */
  const handleEditClick = (mission: Mission) => {
    setEditingMission(mission);
    setEditTitle(mission.title);
    setEditDesc(mission.desc);
    setEditReward(mission.reward.toString());
    setEditIcon(mission.icon);
  };

  const handleSaveEdit = async () => {
    if (!editingMission || !editTitle.trim()) return;
    setIsSavingEdit(true);
    try {
      const isDesafio = editingMission.category === "desafio";
      if (isDesafio) {
        const updatedChallenges = (
          battleChallenges.length > 0
            ? battleChallenges
            : DEFAULT_MISSIONS.filter((m) => m.category === "desafio")
        ).map((c) =>
          c.id === editingMission.id
            ? {
                ...c,
                title: editTitle.trim(),
                desc: editDesc.trim(),
                reward: Number(editReward) || 0,
                icon: editIcon || c.icon,
              }
            : c
        );
        await setDoc(doc(db, "trip_config", "main"), { battleChallenges: updatedChallenges }, { merge: true });
      } else if (editingMission.category === "custom") {
        const updatedCustom = customChallenges.map((c) =>
          c.id === editingMission.id ? { ...c, label: editTitle.trim(), icon: editIcon || c.icon } : c
        );
        await setDoc(doc(db, "trip_config", "main"), { customChallenges: updatedCustom }, { merge: true });
      }
      addToast("Tudo Certo!", "Missão editada com sucesso, mestre.", "success");
      setEditingMission(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "trip_config");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteMission = async (mission: Mission) => {
    try {
      if (mission.category === "desafio") {
        const current =
          battleChallenges.length > 0 ? battleChallenges : DEFAULT_MISSIONS.filter((m) => m.category === "desafio");
        const updated = current.filter((c) => c.id !== mission.id);
        await setDoc(doc(db, "trip_config", "main"), { battleChallenges: updated }, { merge: true });
      } else if (mission.category === "custom") {
        const updated = customChallenges.filter((c) => c.id !== mission.id);
        await setDoc(doc(db, "trip_config", "main"), { customChallenges: updated }, { merge: true });
      }
      addToast("Missão Abortada =(", "Sumiu do mapa!", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "trip_config");
    }
  };

  /* Handlers: Add */
  const handleAddMission = async () => {
    if (!newTitle.trim()) return;
    setIsSavingEdit(true);
    try {
      if (newCategory === "desafio") {
        const newChallenge = {
          id: `battle_${Date.now()}`,
          title: newTitle.trim(),
          desc: newDesc.trim(),
          reward: Number(newReward) || 0,
          icon: newIcon || "⭐",
        };
        const current =
          battleChallenges.length > 0 ? battleChallenges : DEFAULT_MISSIONS.filter((m) => m.category === "desafio");
        await setDoc(doc(db, "trip_config", "main"), { battleChallenges: [...current, newChallenge] }, { merge: true });
      } else {
        const newCustom = {
          id: `custom_${Date.now()}`,
          label: newTitle.trim(),
          icon: newIcon || "⭐",
        };
        await setDoc(doc(db, "trip_config", "main"), { customChallenges: [...customChallenges, newCustom] }, { merge: true });
      }
      addToast("Aí Sim!", "Nova missão criada e adicionada ao mural.", "success");
      setShowAddForm(false);
      setNewTitle("");
      setNewDesc("");
      setNewReward("");
      setNewIcon("⭐");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "trip_config");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-cookbook-text mb-1">Missões</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Economia vira aventura
        </p>
      </div>

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
          <div className="font-serif text-2xl text-cookbook-text">{allMissions.length}</div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/50 font-medium mt-1">
            Missões
          </div>
        </div>
      </div>

      <MissionFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} allMissions={allMissions} />

      <div className="space-y-3">
        {filteredMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            streak={streaks[mission.id]}
            onSelect={setSelectedMission}
            onEdit={handleEditClick}
            onDelete={handleDeleteMission}
          />
        ))}

        {filteredMissions.length === 0 && (
          <div className="text-center py-10 bg-cookbook-bg border border-cookbook-border border-dashed rounded-[2rem]">
            <span className="text-4xl block mb-2 opacity-50">📭</span>
            <p className="font-sans text-xs text-cookbook-text/50">Nenhuma missão encontrada aqui.</p>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-cookbook-bg border-2 border-dashed border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-cookbook-primary/5 hover:border-cookbook-primary/30 hover:text-cookbook-primary transition-all group shadow-sm active:scale-95"
        >
          <Plus size={16} className="text-cookbook-text/40 group-hover:text-cookbook-primary transition-colors" />
          Nova Missão Personalizada
        </button>
      </div>

      {selectedMission && (
        <MissionCompleteModal
          mission={selectedMission}
          amount={amount}
          setAmount={setAmount}
          missionImage={missionImage}
          setMissionImage={setMissionImage}
          isSubmitting={isSubmitting}
          onClose={() => setSelectedMission(null)}
          onComplete={handleComplete}
          addToast={addToast}
        />
      )}

      {editingMission && (
        <MissionFormModal
          title="Editar Missão"
          isEditing={true}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editDesc={editDesc}
          setEditDesc={setEditDesc}
          editReward={editReward}
          setEditReward={setEditReward}
          editIcon={editIcon}
          setEditIcon={setEditIcon}
          category={editingMission.category}
          isSaving={isSavingEdit}
          onClose={() => setEditingMission(null)}
          onSave={handleSaveEdit}
        />
      )}

      {showAddForm && (
        <MissionFormModal
          title="Nova Missão"
          isEditing={false}
          editTitle={newTitle}
          setEditTitle={setNewTitle}
          editDesc={newDesc}
          setEditDesc={setNewDesc}
          editReward={newReward}
          setEditReward={setNewReward}
          editIcon={newIcon}
          setEditIcon={setNewIcon}
          category={newCategory}
          setCategory={setNewCategory}
          isSaving={isSavingEdit}
          onClose={() => setShowAddForm(false)}
          onSave={handleAddMission}
        />
      )}
    </div>
  );
};
