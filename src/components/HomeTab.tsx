import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Plane,
  ArrowRight,
  Sparkles,
  Trash2,
  AlertCircle,
  Pencil,
  Plus,
  X,
  Heart,
  Trophy,
  Camera,
  Star,
  Share2,
  Target,
  Crown,
  ChevronRight,
} from "lucide-react";
import { GOAL_CATEGORIES } from "../data/goalCategories";
import { GoalType } from "../types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { PremiumGate } from "./PremiumGate";
import { openPremiumModal } from "../lib/premium";
import { db, auth } from "../firebase";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { useAppStore } from "../store/useAppStore";
import { AnimatedNumber } from "./AnimatedNumber";
import Carousel from "./Carousel";
import {
  formatDistanceToNow,
  differenceInDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheapDateModal } from "./CheapDateModal";
import { playCoinSound, vibrate } from "../lib/audio";
import { WrappedModal } from "./WrappedModal";
import { SacredPot } from "./SacredPot";
import { ShareableWidget } from "./ShareableWidget";
import { MomentsWidget } from "./MomentsWidget";

interface HomeTabProps {
  currentUser: any;
  goalType?: GoalType;
  destination: string;
  origin: string;
  goalAmount: number;
  totalSaved: number;
  deposits: any[];
  achievements?: any[];
  sharedAlbumUrl?: string;
  relationshipStartDate?: string;
  addToast: (
    title: string,
    message: string,
    type: "info" | "success" | "milestone",
  ) => void;
}
import { WaterSpill } from "./WaterSpill";
import { compressImage } from "../lib/imageUtils";
import { maskCurrency, parseCurrencyString } from "../lib/maskUtils";
const MilestoneTracker = ({
  totalSaved,
  goalAmount,
  onRewardClick,
}: {
  totalSaved: number;
  goalAmount: number;
  onRewardClick: () => void;
}) => {
  const [animatedPct, setAnimatedPct] = useState(0);

  React.useEffect(() => {
    if (goalAmount <= 0) return;
    const pct = (totalSaved / goalAmount) * 100;
    const timer = setTimeout(() => {
      setAnimatedPct(pct);
    }, 300);
    return () => clearTimeout(timer);
  }, [totalSaved, goalAmount]);

  if (goalAmount <= 0) return null;
  const pct = (totalSaved / goalAmount) * 100;
  const milestones = [
    { threshold: 25, label: "Fase 1: Aquecimento (25%)", reward: "Jantar Especial" },
    { threshold: 50, label: "Fase 2: Na Metade do Caminho (50%)", reward: "Passeio Romântico" },
    { threshold: 75, label: "Fase 3: Contagem Regressiva (75%)", reward: "Presentinho Surpresa" },
    { threshold: 100, label: "Fase 4: Objetivo Concluído", reward: "Passagens na mão!" },
  ];
  /* Highest achieved */ const activeMilestone = milestones
    .slice()
    .reverse()
    .find((m) => pct >= m.threshold);

  if (!activeMilestone || pct >= 100) return null;
  return (
    <div className="bg-cookbook-bg backdrop-blur-2xl border border-amber-300/40 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in -mt-4 relative z-10 text-center overflow-hidden">
      {" "}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-cookbook-border overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 transition-all duration-1000 ease-out" 
          style={{ width: `${animatedPct}%` }}
        />
      </div>{" "}
      <div className="flex justify-center mb-3">
        {" "}
        <Star
          size={28}
          className="text-amber-500 fill-amber-500 drop-shadow-md"
        />{" "}
      </div>{" "}
      <h4 className="font-serif italic text-xl text-cookbook-text mb-1">
        {" "}
        Conquista: {activeMilestone.label}{" "}
      </h4>{" "}
      <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-4">
        {" "}
        Vocês merecem uma recompensa: {activeMilestone.reward}{" "}
      </p>{" "}
      <PremiumGate onOpenPremium={openPremiumModal}>
        <button
          onClick={onRewardClick}
          className="bg-amber-500 text-white font-sans text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-2xl font-bold shadow-md hover:bg-amber-600 active:scale-95 transition-all w-full flex items-center justify-center gap-2"
        >
          {" "}
          <Heart size={14} className="fill-white" /> Gerar "Mini Date"
          Especial{" "}
        </button>{" "}
      </PremiumGate>
    </div>
  );
};

const PremiumBanner = () => {
  const isPremium = useAppStore(s => s.isPremium);
  if (isPremium) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 mb-8 group cursor-pointer"
      onClick={() => {
        useAppStore.getState().setActiveTab('config');
        localStorage.setItem('pote_configSubTab', 'premium');
        // Force state update if needed, but the ConfigTab should pick it up on mount
      }}
    >
      <div className="flex items-center justify-between p-1.5 pr-5 bg-cookbook-bg border border-cookbook-border/40 rounded-full hover:border-amber-500/30 transition-all shadow-sm hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:rotate-12 transition-transform">
            <Crown size={14} fill="white" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] font-bold text-cookbook-text/40">
              Versão Gratuita
            </span>
            <span className="font-serif text-[13px] text-cookbook-text group-hover:text-amber-600 transition-colors">
              Fazer upgrade para Premium
            </span>
          </div>
        </div>
        <ChevronRight size={14} className="text-cookbook-text/20 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
};
export const HomeTab: React.FC<HomeTabProps> = ({
  currentUser,
  goalType,
  destination,
  origin,
  goalAmount,
  totalSaved,
  deposits,
  achievements = [],
  sharedAlbumUrl,
  relationshipStartDate,
  addToast,
}) => {
  const casalId = useAppStore(s => s.casalId);
  const [showWrapped, setShowWrapped] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<string | null>(null);
  const [depositToEdit, setDepositToEdit] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  /* Animation states for Pot Breaking */ const [
    isPotBreaking,
    setIsPotBreaking,
  ] = useState(false);
  const [isPotBroken, setIsPotBroken] = useState(false);
  const [showBreakConfirm, setShowBreakConfirm] = useState(false);
  const [showShareWidget, setShowShareWidget] = useState(false);
  /* FAB quick deposit */ const [showQuickDeposit, setShowQuickDeposit] =
    useState(false);
  const [quickAmount, setQuickAmount] = useState("");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickType, setQuickType] = useState<"income" | "expense">("income");
  const [quickImage, setQuickImage] = useState<string | null>(null);
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setQuickImage(base64);
    } catch (err) {
      console.error("Error compressing image:", err);
      addToast("Erro", "Não foi possível carregar a imagem.", "info");
    }
  };
  const handleQuickDeposit = async () => {
    const parsedAmount = parseCurrencyString(quickAmount);
    if (!quickAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;
    setIsQuickSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const depositData: any = {
        amount: parsedAmount,
        type: quickType,
        action:
          quickDesc ||
          (quickType === "income" ? "Depósito rápido" : "Gasto rápido"),
        who: user.uid,
        whoName: user.displayName || user.email?.split("@")[0] || "Alguém",
        createdAt: serverTimestamp(),
      };
      if (quickImage) {
        depositData.imageUrl = quickImage;
      }
      await addDoc(collection(db, `casais/${casalId}/deposits`), depositData);
      /* Haptic and audio feedback */ vibrate([30, 50, 30]);
      if (quickType === "income") {
        playCoinSound();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#8E7F6D", "#C5A059", "#E8E4D9"],
        });
        addToast(
          "Booooooooa!",
          `+R$ ${parsedAmount.toFixed(2)} no pote. Um passo mais perto da viagem!`,
          "success",
        );
      } else {
        addToast(
          "Tudo bem, acontece...",
          `-R$ ${parsedAmount.toFixed(2)}. Da próxima a gente pensa duas vezes!`,
          "info",
        );
      }
      setShowQuickDeposit(false);
      setQuickAmount("");
      setQuickDesc("");
      setQuickType("income");
      setQuickImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/deposits`);
    } finally {
      setIsQuickSubmitting(false);
    }
  };
  const progress =
    goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0;
  const flightsUrl = `https://www.google.com/travel/flights?q=Voos+de+${encodeURIComponent(origin || "Brasil")}+para+${encodeURIComponent(destination)}`;
  const confirmDelete = async () => {
    if (!depositToDelete) return;
    try {
      await deleteDoc(doc(db, `casais/${casalId}/deposits`, depositToDelete));
      addToast("Excluído", "A economia foi removida com sucesso.", "info");
    } catch (error) {
      console.error("Error deleting deposit:", error);
      addToast(
        "Erro",
        "Não foi possível excluir. Você só pode excluir suas próprias economias.",
        "info",
      );
    } finally {
      setDepositToDelete(null);
    }
  };
  const handleEditClick = (deposit: any) => {
    setDepositToEdit(deposit);
    setEditAmount(maskCurrency(deposit.amount.toFixed(2).replace(".", "")));
    setEditDescription(deposit.action || "");
  };
  const confirmEdit = async () => {
    const parsedAmount = parseCurrencyString(editAmount);
    if (
      !depositToEdit ||
      !editAmount ||
      isNaN(parsedAmount) ||
      parsedAmount <= 0
    )
      return;
    setIsEditing(true);
    try {
      await setDoc(
        doc(db, `casais/${casalId}/deposits`, depositToEdit.id),
        { amount: parsedAmount, action: editDescription },
        { merge: true },
      );
      addToast("Atualizado", "O valor foi atualizado com sucesso.", "success");
      setDepositToEdit(null);
    } catch (error) {
      console.error("Error updating deposit:", error);
      addToast("Erro", "Não foi possível atualizar.", "info");
    } finally {
      setIsEditing(false);
    }
  };
  const confirmBreakPot = async () => {
    setShowBreakConfirm(false);
    setIsPotBreaking(true);
    if (vibrate) vibrate([30, 50, 30]);
    setTimeout(() => {
      setIsPotBroken(true);
    }, 600);
    setTimeout(async () => {
      try {
        await addDoc(collection(db, "achievements"), {
          destination: destination || "Nossa Viagem",
          amount: Number(totalSaved),
          goalAmount: Number(goalAmount),
          createdAt: serverTimestamp(),
        });
        for (const deposit of deposits) {
          try {
            await deleteDoc(doc(db, `casais/${casalId}/deposits`, deposit.id));
          } catch (e) {
            console.error("Could not delete deposit", deposit.id, e);
          }
        }
        addToast(
          "Conquista!",
          "O Pote foi quebrado e virou história!",
          "milestone",
        );
      } catch (error: any) {
        console.error("Error breaking pot:", error);
        addToast(
          "Erro",
          `Não foi possível quebrar o pote (${error.message || "Desconhecido"})`,
          "info",
        );
      } finally {
        setTimeout(() => {
          setIsPotBroken(false);
          setIsPotBreaking(false);
        }, 2000);
      }
    }, 1500);
  };
  const handleBreakPotClick = () => {
    setShowBreakConfirm(true);
  };
  const daysTogether = useMemo(() => {
    if (!relationshipStartDate) return null;
    const start = new Date(relationshipStartDate + 'T00:00:00');
    if (isNaN(start.getTime())) return null;
    return differenceInDays(new Date(), start);
  }, [relationshipStartDate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pb-32 md:pb-12 pt-6 px-6 w-full max-w-md md:max-w-6xl mx-auto relative flex flex-col"
    >
      {" "}
      <WaterSpill isSpilling={isPotBroken} />{" "}
      <PremiumBanner />
      <div className="text-center space-y-1 relative mb-8">
        {" "}
        <h2 className="font-sans text-[10px] uppercase tracking-[0.2em] text-cookbook-text/60 font-bold">
          {" "}
          Reserva de Casal{" "}
        </h2>{" "}
        {daysTogether !== null && daysTogether >= 0 && (
          <p className="font-serif italic text-base text-cookbook-primary animate-fade-in mt-1">
            {daysTogether} {daysTogether === 1 ? 'dia' : 'dias'} juntos ❤️
          </p>
        )}
        <button
          onClick={() => setShowShareWidget(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-cookbook-primary/10 text-cookbook-primary rounded-full hover:bg-cookbook-primary/20 active:scale-95 transition-all shadow-sm md:static md:translate-y-0 md:mt-4 md:mx-auto md:block md:w-auto"
          title="Compartilhar Status / PWA"
        >
          {" "}
          <Share2 size={16} className="md:inline md:mr-2" /> <span className="hidden md:inline font-sans text-[10px] uppercase tracking-widest font-bold">Compartilhar</span>{" "}
        </button>{" "}
      </div>{" "}

      <div className="md:grid md:grid-cols-2 lg:grid-cols-2 md:gap-12 lg:gap-16 items-start">
        {/* Esquerda: Cofre e Estatísticas */}
        <div className="space-y-8">
      {/* The Animated Pot */}{" "}
      <SacredPot
        totalSaved={totalSaved}
        goalAmount={goalAmount}
        achievements={achievements}
        isBreaking={isPotBreaking}
        isBroken={isPotBroken}
        goalType={goalType}
      />{" "}
      <MilestoneTracker
        totalSaved={totalSaved}
        goalAmount={goalAmount}
        onRewardClick={() => setShowDateModal(true)}
      />{" "}
      {/* Break Pot Button if reached goal */}{" "}
      {totalSaved >= goalAmount && goalAmount > 0 && (
        <div className="animate-pulse-slow">
          {" "}
          <button
            onClick={handleBreakPotClick}
            className="w-full bg-cookbook-gold text-white font-sans text-xs uppercase tracking-widest py-4 rounded-xl shadow-[0_8px_20px_rgba(197,160,89,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98] font-bold flex items-center justify-center space-x-2 border-2 border-white/20"
          >
            {" "}
            <Sparkles size={18} /> <span>Quebrar e Historiar Pote!</span>{" "}
          </button>{" "}
        </div>
      )}{" "}
        </div>

        {/* Direita: Interações e Ações */}
        <div className="space-y-8 mt-8 md:mt-0">
      {/* Moments Widget (Dopamine Events) */}
      <MomentsWidget deposits={deposits} goalAmount={goalAmount} totalSaved={totalSaved} destination={destination} />

      {/* Wrapped Button */}{" "}
      <div className="flex justify-center mt-2 mb-6">
        {" "}
        <button
          onClick={() => setShowWrapped(true)}
          className="w-full bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary text-white border border-white/20 rounded-3xl p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all active:scale-[0.98] hover:shadow-[0_10px_40px_rgb(0,0,0,0.12)] animate-pulse-slow relative overflow-hidden"
        >
          {" "}
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-150 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>{" "}
          <div className="flex items-center space-x-4 relative z-10">
            {" "}
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              {" "}
              <Sparkles size={18} className="text-white" />{" "}
            </div>{" "}
            <div className="text-left">
              {" "}
              <p className="font-serif italic text-base text-white">
                {" "}
                Nosso Momento Wrapped{" "}
              </p>{" "}
              <p className="font-sans text-[10px] uppercase tracking-widest text-white/80 font-medium">
                {" "}
                Resumo do Casal{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <ArrowRight
            size={18}
            className="text-white/70 relative z-10"
            strokeWidth={2}
          />{" "}
        </button>{" "}
      </div>{" "}

      {/* Missoes/Conquistas Shortcut Button */}{" "}
      <div className="flex justify-center mb-6">
        {" "}
        <button
          onClick={() => useAppStore.getState().setActiveTab('missoes')}
          className="w-full bg-cookbook-bg/80 backdrop-blur-xl border border-cookbook-border rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
        >
          {" "}
          <div className="flex items-center space-x-4">
            {" "}
            <div className="w-10 h-10 rounded-full bg-cookbook-text/5 flex items-center justify-center border border-cookbook-border/50">
              {" "}
              <Trophy size={18} className="text-cookbook-text/60" />{" "}
            </div>{" "}
            <div className="text-left">
              {" "}
              <p className="font-serif italic text-base text-cookbook-text">
                {" "}
                Nossas Conquistas{" "}
              </p>{" "}
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-medium">
                {" "}
                Metas e Desafios{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <ArrowRight
            size={18}
            className="text-cookbook-text/30"
            strokeWidth={2}
          />{" "}
        </button>{" "}
      </div>{" "}
        </div>
      </div>{" "}
      {showDateModal && (
        <CheapDateModal
          onClose={() => setShowDateModal(false)}
          currentUser={currentUser}
        />
      )}{" "}
      {/* Edit Confirmation Modal */}{" "}
      {depositToEdit && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop"
          onClick={() => setDepositToEdit(null)}
        >
          {" "}
          <div
            className="bg-cookbook-bg shadow-xl border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <h3 className="font-serif text-xl text-cookbook-text mb-4 font-medium">
              {" "}
              Editar{" "}
              {depositToEdit.type === "expense" ? "Gasto" : "Economia"}{" "}
            </h3>{" "}
            <div className="space-y-4 mb-6">
              {" "}
              <div className="relative">
                {" "}
                <input
                  type="text"
                  inputMode="numeric"
                  value={editAmount}
                  onChange={(e) => setEditAmount(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl py-3 pr-4 font-serif text-2xl text-center text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                />{" "}
              </div>{" "}
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl px-4 py-3 font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
              />{" "}
            </div>{" "}
            <div className="flex space-x-3">
              {" "}
              <button
                onClick={() => setDepositToEdit(null)}
                className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-cookbook-border/30 transition-colors"
              >
                {" "}
                Cancelar{" "}
              </button>{" "}
              <button
                onClick={confirmEdit}
                disabled={isEditing}
                className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50 shadow-md active:scale-95"
              >
                {" "}
                {isEditing ? "Salvando..." : "Salvar"}{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Delete Confirmation Modal */}{" "}
      {depositToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop"
          onClick={() => setDepositToDelete(null)}
        >
          {" "}
          <div
            className="bg-cookbook-bg shadow-xl border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="w-12 h-12 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              {" "}
              <AlertCircle size={24} className="text-red-500" />{" "}
            </div>{" "}
            <h3 className="font-serif text-xl text-cookbook-text mb-2 font-medium">
              {" "}
              Remover Economia?{" "}
            </h3>{" "}
            <p className="font-sans text-xs text-cookbook-text/60 mb-6">
              {" "}
              Tem certeza que deseja excluir este valor do pote? Essa ação não
              pode ser desfeita.{" "}
            </p>{" "}
            <div className="flex space-x-3">
              {" "}
              <button
                onClick={() => setDepositToDelete(null)}
                className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-cookbook-border/30 transition-colors"
              >
                {" "}
                Cancelar{" "}
              </button>{" "}
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-md active:scale-95"
              >
                {" "}
                Sim, Remover{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Modals placed inside HomeTab directly instead of via absolute inside container, or safely using portal */}{" "}
      {showBreakConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-modal-backdrop"
            onClick={() => setShowBreakConfirm(false)}
          >
            {" "}
            <div
              className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl animate-modal-enter text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {" "}
              <h3 className="font-serif text-2xl text-white font-medium">
                {" "}
                Prontos para quebrar o pote?{" "}
              </h3>{" "}
              <p className="font-sans text-xs uppercase tracking-widest text-white/70">
                {" "}
                Isso guardará esta conquista no histórico e zerará o pote.
                Deseja continuar?{" "}
              </p>{" "}
              <div className="flex space-x-3 pt-4">
                {" "}
                <button
                  onClick={() => setShowBreakConfirm(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-cookbook-border/30/20 transition-colors text-white font-sans text-[10px] uppercase tracking-widest font-bold rounded-2xl"
                >
                  {" "}
                  Cancelar{" "}
                </button>{" "}
                <button
                  onClick={confirmBreakPot}
                  className="flex-1 py-3 bg-cookbook-gold text-white font-sans text-[10px] uppercase tracking-widest font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all w-full"
                >
                  {" "}
                  <Sparkles size={14} /> <span>Quebrar Pote!</span>{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>,
          document.body,
        )}{" "}
      {/* ========== FAB Quick Deposit ========== */}{" "}
      <button
        onClick={() => setShowQuickDeposit(true)}
        className={`fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-cookbook-primary text-white shadow-lg flex items-center justify-center transition-all hover:shadow-xl hover:scale-105 active:scale-95 ${showQuickDeposit ? "rotate-45 bg-cookbook-text" : ""}`}
        aria-label="Depósito rápido"
      >
        {" "}
        <Plus size={24} strokeWidth={2.5} />{" "}
      </button>{" "}
      {/* Quick Deposit Modal */}{" "}
      {showQuickDeposit &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop"
            onClick={() => {
              setShowQuickDeposit(false);
              setQuickImage(null);
            }}
          >
            {" "}
            <div
              className="bg-cookbook-bg shadow-xl border border-cookbook-border rounded-t-3xl w-full max-w-md p-6 shadow-2xl animate-modal-enter pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              {" "}
              <div className="w-10 h-1 bg-cookbook-border/30 rounded-full mx-auto mb-5" />{" "}
              <h3 className="font-serif text-lg text-cookbook-text mb-4 text-center">
                {" "}
                Depósito Rápido{" "}
              </h3>{" "}
              <div className="flex gap-2 mb-4">
                {" "}
                <button
                  onClick={() => setQuickType("income")}
                  className={`flex-1 py-3 rounded-2xl font-sans text-[10px] uppercase tracking-widest font-bold border transition-all ${quickType === "income" ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border text-cookbook-text/50"}`}
                >
                  {" "}
                  ↑ Entrada{" "}
                </button>{" "}
                <button
                  onClick={() => setQuickType("expense")}
                  className={`flex-1 py-3 rounded-2xl font-sans text-[10px] uppercase tracking-widest font-bold border transition-all ${quickType === "expense" ? "bg-red-500 text-white border-red-500 shadow-sm" : "bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border text-cookbook-text/50"}`}
                >
                  {" "}
                  ↓ Saída{" "}
                </button>{" "}
              </div>{" "}
              <div className="space-y-3 mb-5">
                {" "}
                <div className="relative">
                  {" "}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quickAmount}
                    onChange={(e) =>
                      setQuickAmount(maskCurrency(e.target.value))
                    }
                    placeholder="R$ 0,00"
                    className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl py-4 pr-4 font-serif text-3xl text-cookbook-text text-center focus:outline-none focus:border-cookbook-primary transition-colors"
                    autoFocus
                  />{" "}
                </div>{" "}
                <input
                  type="text"
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  placeholder="Descrição (opcional)"
                  className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl px-4 py-3 font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                />{" "}
                {/* Image Upload Area */}{" "}
                {quickType === "income" && (
                  <div className="mt-4">
                    {" "}
                    {quickImage ? (
                      <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-cookbook-border">
                        {" "}
                        <img
                          src={quickImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />{" "}
                        <button
                          onClick={() => setQuickImage(null)}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full backdrop-blur-sm"
                        >
                          {" "}
                          <X size={16} />{" "}
                        </button>{" "}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-cookbook-border rounded-2xl cursor-pointer bg-cookbook-bg/90 backdrop-blur-md hover:bg-cookbook-primary/10 transition-colors">
                        {" "}
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          {" "}
                          <Camera
                            size={20}
                            className="text-cookbook-text/40 mb-1"
                          />{" "}
                          <p className="font-sans text-[9px] uppercase tracking-widest font-bold text-cookbook-text/50">
                            {" "}
                            Adicionar Foto (Opcional){" "}
                          </p>{" "}
                        </div>{" "}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />{" "}
                      </label>
                    )}{" "}
                  </div>
                )}{" "}
              </div>{" "}
              <button
                onClick={handleQuickDeposit}
                disabled={
                  !quickAmount ||
                  isQuickSubmitting ||
                  isNaN(parseCurrencyString(quickAmount)) ||
                  parseCurrencyString(quickAmount) <= 0
                }
                className={`w-full text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50 transition-all active:scale-[0.98] ${quickType === "expense" ? "bg-red-500 hover:bg-red-600" : "bg-cookbook-primary hover:bg-cookbook-primary-hover"}`}
              >
                {" "}
                {isQuickSubmitting
                  ? "Guardando..."
                  : quickType === "income"
                    ? "Guardar no Pote"
                    : "Registrar Gasto"}{" "}
              </button>{" "}
            </div>{" "}
          </div>,
          document.body,
        )}{" "}
      {showWrapped &&
        createPortal(
          <WrappedModal
            onClose={() => setShowWrapped(false)}
            deposits={deposits}
            goalAmount={goalAmount}
            totalSaved={totalSaved}
            destination={destination}
          />,
          document.body,
        )}{" "}
      {showShareWidget &&
        createPortal(
          <ShareableWidget
            goalAmount={goalAmount}
            totalSaved={totalSaved}
            destination={destination}
            onClose={() => setShowShareWidget(false)}
          />,
          document.body,
        )}{" "}
    </motion.div>
  );
};
