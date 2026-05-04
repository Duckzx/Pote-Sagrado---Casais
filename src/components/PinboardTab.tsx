import React, { useState, useRef } from "react";
import {
  AlertCircle,
  Pencil,
  Pin,
  Plus,
  ExternalLink,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Camera,
  MapPin,
  Search,
  PlusCircle,
  Trophy,
} from "lucide-react";
import { doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase";
import { useAppContext } from "../context/AppContext";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { ExtratoTab } from "./ExtratoTab";
import { UserBadges } from "./UserBadges";
import { CoupleGalleryWidget } from "./CoupleGalleryWidget";
interface PinboardTabProps {
  addToast: (
    title: string,
    message: string,
    type: "info" | "success" | "milestone",
  ) => void;
}
export const PinboardTab: React.FC<PinboardTabProps> = ({ addToast }) => {
  const { user: currentUser, deposits, pinboardLinks, achievements, casalId, tripConfig } = useAppContext();
  const goalAmount = tripConfig?.goalAmount || 0;
  
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleAddLink = async () => {
    if (!newTitle || !newUrl) return;
    setIsSubmitting(true);
    /* Auto generated image */ const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(newTitle)}/600/400`;
    
    try {
      await addDoc(collection(db, `casais/${casalId}/pinboard_links`), {
        url: newUrl,
        title: newTitle,
        imageUrl: imageUrl,
        addedBy: auth.currentUser?.uid || "",
        createdAt: serverTimestamp(),
      });
      setNewTitle("");
      setNewUrl("");
      setIsAddingLink(false);
      addToast("Adicionado", "Link salvo no mural!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/pinboard_links`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `casais/${casalId}/pinboard_links`, id));
      addToast("Removido", "Link apagado do mural.", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `casais/${casalId}/pinboard_links`);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (achievements.length >= 6) {
        addToast("Atenção", "Você já tem muitas conquistas salvas.", "info");
        return;
      }
      setIsUploadingPhoto(true);

      try {
        const storageRef = ref(storage, `conquistas/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        const downloadUrl = await getDownloadURL(uploadTask.ref);

        await addDoc(collection(db, `casais/${casalId}/achievements`), {
          destination: "Nossa Conquista",
          amount: 0,
          goalAmount: 0,
          imageUrl: downloadUrl,
          createdAt: serverTimestamp(),
        });
        
        addToast("Sucesso", "Mural atualizado com nova foto.", "success");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/achievements`);
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };
  const handleRemoveConquista = async (id: string) => {
    try {
      await deleteDoc(doc(db, `casais/${casalId}/achievements`, id));
      addToast("Removido", "Conquista apagada.", "info");
    } catch(error) {
      handleFirestoreError(error, OperationType.DELETE, `casais/${casalId}/achievements`);
    }
  };
  const formatCurrency = (val: number) =>
    Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      val,
    );

  return (
    <div className="pb-32 pt-6 px-4 max-w-2xl mx-auto space-y-12 animate-fade-in relative min-h-[100dvh]">
      {" "}
      {/* Header */}{" "}
      <div className="text-center space-y-2 mt-2">
        {" "}
        <Pin
          size={24}
          className="text-cookbook-primary mx-auto mb-1 opacity-80"
        />{" "}
        <h2 className="font-serif text-2xl font-medium text-cookbook-text">
          {" "}
          Mural de Casal{" "}
        </h2>{" "}
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium">
          {" "}
          Inspirações, Memórias e Histórico{" "}
        </p>{" "}
      </div>{" "}

      {/* Badges / Conquistas */}{" "}
      <UserBadges
        deposits={deposits}
        currentUser={currentUser}
        goalAmount={goalAmount}
      />{" "}
      {/* 1. Nossos Sonhos (Roleta / Carrossel de Imagens) */}{" "}
      <section className="space-y-4">
        {" "}
        <div className="flex items-center justify-between px-2">
          {" "}
          <h3 className="font-serif text-lg text-cookbook-text">
            {" "}
            Projetos & Links{" "}
          </h3>{" "}
          <button
            onClick={() => setIsAddingLink(!isAddingLink)}
            className="text-cookbook-primary p-2 hover:bg-cookbook-bg rounded-full backdrop-blur-md border border-cookbook-border transition-colors shadow-sm"
          >
            {" "}
            <Plus size={20} />{" "}
          </button>{" "}
        </div>{" "}
        {isAddingLink && (
          <div className="bg-cookbook-bg backdrop-blur-xl border border-cookbook-border rounded-2xl p-4 shadow-sm animate-fade-in">
            {" "}
            <div className="space-y-3">
              {" "}
              <input
                type="text"
                placeholder="Ex: Chalé em Campos"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-cookbook-bg/90 backdrop-blur-md px-4 py-3 rounded-xl border border-cookbook-border font-serif text-cookbook-text focus:outline-none focus:border-cookbook-primary text-sm placeholder:text-cookbook-text/30"
              />{" "}
              <input
                type="url"
                placeholder="Link (https://...)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-cookbook-bg/90 backdrop-blur-md px-4 py-3 rounded-xl border border-cookbook-border font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary placeholder:text-cookbook-text/30"
              />{" "}
              <div className="flex justify-end space-x-2 pt-2">
                {" "}
                <button
                  onClick={() => setIsAddingLink(false)}
                  className="px-5 py-2 text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold rounded-xl hover:bg-cookbook-bg"
                >
                  {" "}
                  Cancelar{" "}
                </button>{" "}
                <button
                  onClick={handleAddLink}
                  className="px-5 py-2 text-[10px] uppercase tracking-widest bg-cookbook-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform"
                >
                  {" "}
                  Adicionar{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-4 px-4 overflow-y-hidden">
          {" "}
          {pinboardLinks.map((item) => (
            <div
              key={item.id}
              className="snap-center shrink-0 w-[240px] group relative"
            >
              {" "}
              <div className="h-40 rounded-3xl overflow-hidden relative shadow-sm border border-cookbook-border bg-white/10 backdrop-blur-sm">
                {" "}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />{" "}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>{" "}
                <button
                  onClick={() => handleLinkDelete(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/20 hover:bg-red-500/80"
                >
                  {" "}
                  <Trash2 size={14} />{" "}
                </button>{" "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between"
                >
                  {" "}
                  <span className="font-serif text-sm font-medium truncate pr-2" title={item.title}>
                    {" "}
                    {item.title}{" "}
                  </span>{" "}
                  <ExternalLink
                    size={14}
                    className="shrink-0 opacity-70"
                  />{" "}
                </a>{" "}
              </div>{" "}
            </div>
          ))}{" "}
          {pinboardLinks.length === 0 && (
            <div className="w-full h-40 rounded-3xl border-2 border-dashed border-cookbook-border bg-cookbook-bg/90 backdrop-blur-md flex items-center justify-center text-cookbook-text/40 font-serif italic text-sm text-center px-4 font-medium shrink-0 shadow-sm">
              {" "}
              Nenhum sonho adicionado.{" "}
            </div>
          )}{" "}
        </div>{" "}
      </section>{" "}
      {/* 2. Mural de Conquistas */}{" "}
      <section className="space-y-4">
        {" "}
        <div className="flex items-center justify-between px-2">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <Trophy size={18} className="text-cookbook-gold" />{" "}
            <h3 className="font-serif text-lg text-cookbook-text">
              {" "}
              Nossas Conquistas{" "}
            </h3>{" "}
          </div>{" "}
          <span className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium">
            {" "}
            {achievements.filter(a => a.imageUrl).length + (isUploadingPhoto ? 1 : 0)} de 6{" "}
          </span>{" "}
        </div>{" "}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {" "}
          {achievements.filter(a => a.imageUrl).map((item) => (
            <div
              key={item.id}
              className="aspect-square rounded-3xl overflow-hidden relative group shadow-sm border border-cookbook-border bg-white/10 backdrop-blur-sm"
            >
              {" "}
              <img
                src={item.imageUrl}
                alt={item.destination}
                className="w-full h-full object-cover"
              />{" "}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                {" "}
                <button
                  onClick={() => handleRemoveConquista(item.id)}
                  className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500"
                >
                  {" "}
                  <Trash2 size={16} />{" "}
                </button>{" "}
              </div>{" "}
              {item.destination !== "Nossa Conquista" && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white font-serif text-sm truncate">{item.destination}</p>
                  <p className="text-white/70 font-sans text-[9px] uppercase tracking-widest font-bold">
                    {formatCurrency(item.amount || 0)}
                  </p>
                </div>
              )}
            </div>
          ))}{" "}
          {isUploadingPhoto && (
            <div className="aspect-square rounded-3xl border-2 border-dashed border-cookbook-border flex flex-col items-center justify-center text-cookbook-text/40 bg-cookbook-bg/90 backdrop-blur-md animate-pulse">
              <Camera size={24} className="mb-2 opacity-50" />
              <span className="font-sans text-[9px] uppercase tracking-widest font-bold">
                Enviando...
              </span>
            </div>
          )}
          {achievements.length < 6 && !isUploadingPhoto && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-3xl border-2 border-dashed border-cookbook-border flex flex-col items-center justify-center text-cookbook-text/40 hover:text-cookbook-primary hover:bg-cookbook-primary/5 transition-colors group bg-cookbook-bg/90 backdrop-blur-md"
            >
              {" "}
              <Camera
                size={24}
                className="mb-2 group-hover:scale-110 transition-transform"
              />{" "}
              <span className="font-sans text-[9px] uppercase tracking-widest font-bold">
                {" "}
                Adicionar Foto{" "}
              </span>{" "}
            </button>
          )}{" "}
        </div>{" "}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handlePhotoUpload}
        />{" "}
        <p className="font-sans text-[10px] text-cookbook-text/40 italic px-2 text-center">
          {" "}
          Você pode fixar até 6 memórias dos potes que já quebrou juntos.{" "}
        </p>{" "}
      </section>{" "}

      <section className="space-y-4">
        {" "}
        <CoupleGalleryWidget addToast={addToast} />{" "}
      </section>{" "}

      <div className="pt-8">
        <ExtratoTab deposits={deposits} addToast={addToast} casalId={casalId} />
      </div>
    </div>
  );
};
