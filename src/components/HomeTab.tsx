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
} from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { useAppContext } from "../context/AppContext";
import { AnimatedNumber } from "./AnimatedNumber";
import Carousel from "./Carousel";
import {
  formatDistanceToNow,
  differenceInDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { playCoinSound, vibrate } from "../lib/audio";
import { SacredPot } from "./SacredPot";
import { ShareableWidget } from "./ShareableWidget";
import { useAppStore } from "../store/useAppStore";
import { useTripProgress } from "../hooks/useTripProgress";
import { CoupleGalleryWidget } from "./CoupleGalleryWidget";
import type { Partner } from '../types';

const MOTIVATIONAL_QUOTES = [
  { text: "Quem economiza hoje, viaja amanhã.", emoji: "✈️" },
  { text: "Cada centavo é um passo mais perto do destino.", emoji: "👣" },
  { text: "Pequenas escolhas, grandes viagens.", emoji: "🌍" },
  { text: "O paraíso está a um depósito de distância.", emoji: "🏝️" },
  { text: "Juntos, até o impossível fica perto.", emoji: "💑" },
  { text: "O pote de hoje é a passagem de amanhã.", emoji: "🎫" },
  { text: "Disciplina é o combustível das aventuras.", emoji: "⛽" },
  { text: "Economizar a dois é dobrar a felicidade.", emoji: "💛" },
  { text: "Sua próxima memória inesquecível começa agora.", emoji: "📸" },
  { text: "Não é sobre gastar menos, é sobre viver mais.", emoji: "🌅" },
];

const RELATIONSHIP_MESSAGES = [
  "Vocês são um time incrível! Continuem cuidando um do outro.",
  "O amor cresce nos pequenos detalhes compartilhados.",
  "Guardar dinheiro juntos é investir na história de vocês.",
  "Um relacionamento forte se constrói com conversas honestas e sonhos malucos.",
  "O melhor lugar do mundo é ao lado de quem se ama.",
  "Mantenham acesa a chama: planejem o próximo date!",
];

import { WaterSpill } from "./WaterSpill";
import { compressImage } from "../lib/imageUtils";
import { maskCurrency, parseCurrencyString } from "../lib/maskUtils";


const PartnerSummary = ({ partner }: { partner: Partner }) => {
  if (!partner) return null;
  return (
    <div className="flex items-center justify-center gap-3 bg-white/40 backdrop-blur-md py-2 px-4 rounded-full border border-cookbook-border/30 animate-fade-in shadow-sm">
      <div className="flex -space-x-2">
        <div className="w-6 h-6 rounded-full border border-white overflow-hidden shadow-sm">
          <img 
            src={auth.currentUser?.photoURL || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=100&h=100&auto=format&fit=crop"} 
            className="w-full h-full object-cover"
            alt="Você"
          />
        </div>
        <div className="w-6 h-6 rounded-full border border-white overflow-hidden shadow-sm bg-cookbook-primary/10">
          <img 
            src={partner.photoURL || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=100&h=100&auto=format&fit=crop"} 
            className="w-full h-full object-cover"
            alt={partner.displayName}
          />
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold">
        Poupando com <span className="text-cookbook-primary">{partner.displayName}</span>
      </span>
    </div>
  );
};

export const HomeTab: React.FC = () => {
  const { user, addToast, casalId, partner } = useAppContext();
  const deposits = useAppStore(s => s.deposits);
  const tripConfig = useAppStore(s => s.tripConfig);
  const totalSaved = useAppStore(s => s.totalSaved);
  const achievements = useAppStore(s => s.achievements);
  const { destination, origin, goalAmount, relationshipStartDate, sharedAlbumUrl } = tripConfig;
  
  const { percentage: progress, isCompleted } = useTripProgress();
  
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
  /* Daily motivational quote (deterministic based on day of year) */ const dailyQuote =
    useMemo(() => {
      const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
    }, []);

  const relationshipMessage = useMemo(() => {
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return RELATIONSHIP_MESSAGES[day % RELATIONSHIP_MESSAGES.length];
  }, []);
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
    if (!user?.coupleId) {
      addToast("Erro", "Perfil de casal não identificado.", "info");
      return;
    }
    setIsQuickSubmitting(true);
    try {
      const depositData: any = {
        amount: parsedAmount,
        type: quickType,
        action:
          quickDesc ||
          (quickType === "income" ? "Depósito rápido" : "Gasto rápido"),
        who: user.uid,
        whoName: user.displayName || user.email?.split("@")[0] || "Alguém",
        coupleId: user.coupleId,
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
        await addDoc(collection(db, "casais", casalId || `casal_${user?.uid}`, "achievements"), {
          destination: destination || "Nossa Viagem",
          amount: Number(totalSaved),
          goalAmount: Number(goalAmount),
          coupleId: user?.coupleId,
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
    >
      {" "}
      <WaterSpill isSpilling={isPotBroken} />{" "}
      <div className="text-center space-y-4 relative">
        <PartnerSummary partner={partner} />
        <div className="space-y-1">
          <h2 className="font-sans text-[10px] uppercase tracking-[0.2em] text-cookbook-text/60 font-bold">
            {" "}
            {partner ? "Nosso Pote Sagrado" : "Meu Pote Sagrado"}{" "}
          </h2>{" "}
          {daysTogether !== null && daysTogether >= 0 && (
            <p className="font-serif italic text-base text-cookbook-primary/80 animate-fade-in mt-1">
              {daysTogether} {daysTogether === 1 ? 'dia' : 'dias'} juntos ❤️
            </p>
          )}
          <button
            onClick={() => setShowShareWidget(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-cookbook-gold/10 text-cookbook-gold rounded-full hover:bg-cookbook-gold/20 active:scale-95 transition-all shadow-sm"
            title="Compartilhar Status / PWA"
          >
            {" "}
            <Share2 size={16} />{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* The Animated Pot */}{" "}
      <SacredPot
        totalSaved={totalSaved}
        goalAmount={goalAmount}
        achievements={achievements}
        isBreaking={isPotBreaking}
        isBroken={isPotBroken}
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
      
      {/* Daily Motivational Quote & Relationship Message */}{" "}
      <div className="flex flex-col gap-2 mb-6 -mt-4">
        <div className="text-center bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl px-5 py-3 shadow-sm">
          {" "}
          <span className="text-lg mr-1.5">{dailyQuote.emoji}</span>{" "}
          <span className="font-serif italic text-[13px] text-cookbook-text/80">
            {" "}
            {dailyQuote.text}{" "}
          </span>{" "}
        </div>{" "}
        <div className="text-center bg-cookbook-primary/10 rounded-2xl px-5 py-3 border border-cookbook-primary/20">
           <span className="font-sans text-[11px] font-medium text-cookbook-primary">
            💌 {relationshipMessage}
           </span>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <CoupleGalleryWidget addToast={addToast} />
      </div>

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
          />,
          document.body,
        )}{" "}
      {showShareWidget &&
        createPortal(
          <ShareableWidget
            onClose={() => setShowShareWidget(false)}
          />,
          document.body,
        )}{" "}
    </motion.div>

  );
};
