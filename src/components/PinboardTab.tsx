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
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAppContext } from "../context/AppContext";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { compressImage } from "../lib/imageUtils";
import { uploadBase64ToStorage, generateStoragePath } from "../lib/storageUtils";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
interface PinboardTabProps {
  addToast: (
    title: string,
    message: string,
    type: "info" | "success" | "milestone",
  ) => void;
}
export const PinboardTab: React.FC<PinboardTabProps> = ({ addToast }) => {
  const { deposits, achievements, user } = useAppContext();
  /* Nossos Sonhos */ const [links, setLinks] = useState([
    {
      id: 1,
      link: "https://airbnb.com",
      text: "Chalé em Campos",
      image:
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=600&h=400&fit=crop",
    },
    {
      id: 2,
      link: "https://tiktok.com",
      text: "Restaurante X",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    },
    {
      id: 3,
      link: "https://decolar.com",
      text: "Passagens Promo",
      image:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
    },
  ]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  /* Conquistas (now using achievements from context) */
  // const [conquistas, setConquistas] = useState([]); // Removed local state
  const handleAddLink = () => {
    if (!newTitle || !newUrl) return;
    /* Auto generated image */ const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(newTitle)}/600/400`;
    setLinks([
      { id: Date.now(), link: newUrl, text: newTitle, image: imageUrl },
      ...links,
    ]);
    setNewTitle("");
    setNewUrl("");
    setIsAddingLink(false);
    addToast("Adicionado", "Link salvo no mural!", "success");
  };
  const handleLinkDelete = (id: number) => {
    setLinks(links.filter((l) => l.id !== id));
  };
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      try {
        const base64 = await compressImage(file);
        const path = generateStoragePath("achievements", user.uid);
        const imageUrl = await uploadBase64ToStorage(base64, path);
        
        await addDoc(collection(db, "achievements"), {
          destination: "Nossa Memória",
          amount: 0,
          goalAmount: 0,
          imageUrl: imageUrl,
          createdAt: serverTimestamp(),
        });

        addToast("Sucesso", "Mural atualizado com nova foto.", "success");
      } catch (error) {
        console.error("Error uploading photo:", error);
        addToast("Erro", "Não foi possível carregar a imagem.", "info");
      }
    }
  };
  const handleRemoveConquista = async (id: string) => {
    try {
      await deleteDoc(doc(db, "achievements", id));
      addToast("Removido", "Conquista removida do mural.", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "achievements");
    }
  };
  /* Histórico */ const filteredDeposits = [...deposits].sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
  const formatCurrency = (val: number) =>
    Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      val,
    );
  const formatTime = (d: any) => {
    if (!d?.createdAt?.toDate) return "";
    return d.createdAt
      .toDate()
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };
  const totals = filteredDeposits.reduce(
    (acc, d) => {
      if (d.type === "expense") acc.gastos += d.amount;
      else acc.depositos += d.amount;
      return acc;
    },
    { depositos: 0, gastos: 0 },
  );
  const saldo = totals.depositos - totals.gastos;
  const [editing, setEditing] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editAction, setEditAction] = useState("");
  const [deleting, setDeleting] = useState<any>(null);
  const handleEdit = (deposit: any) => {
    setEditing(deposit);
    setEditAmount(deposit.amount.toString());
    setEditAction(deposit.action || "");
  };
  const confirmEdit = async () => {
    const parsedAmount = Number(editAmount.replace(",", "."));
    if (!editing || !editAmount || isNaN(parsedAmount) || parsedAmount <= 0)
      return;
    try {
      await updateDoc(doc(db, "deposits", editing.id), {
        amount: parsedAmount,
        action: editAction,
      });
      addToast("Tudo Certo!", "Transação editada com sucesso.", "success");
      setEditing(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "deposits");
    }
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDoc(doc(db, "deposits", deleting.id));
      addToast("Removido", "Lançamento apagado.", "info");
      setDeleting(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "deposits");
    }
  };
  /* Replace this placeholder below: */ return (
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
          Mural de Sonhos{" "}
        </h2>{" "}
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium">
          {" "}
          Inspirações, Memórias e Histórico{" "}
        </p>{" "}
      </div>{" "}
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
            className="text-cookbook-primary p-2 hover:bg-cookbook-surface/20 rounded-full backdrop-blur-md border border-cookbook-border transition-colors shadow-sm"
          >
            {" "}
            <Plus size={20} />{" "}
          </button>{" "}
        </div>{" "}
        {isAddingLink && (
          <div className="bg-cookbook-surface backdrop-blur-xl border border-cookbook-border rounded-2xl p-4 shadow-sm animate-fade-in">
            {" "}
            <div className="space-y-3">
              {" "}
              <input
                type="text"
                placeholder="Ex: Chalé em Campos"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-cookbook-surface/60 backdrop-blur-md px-4 py-3 rounded-xl border border-cookbook-border font-serif text-cookbook-text focus:outline-none focus:border-cookbook-primary text-sm placeholder:text-cookbook-text/30"
              />{" "}
              <input
                type="url"
                placeholder="Link (https://...)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-cookbook-surface/60 backdrop-blur-md px-4 py-3 rounded-xl border border-cookbook-border font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary placeholder:text-cookbook-text/30"
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
          {links.map((item) => (
            <div
              key={item.id}
              className="snap-center shrink-0 w-[240px] group relative"
            >
              {" "}
              <div className="h-40 rounded-3xl overflow-hidden relative shadow-sm border border-cookbook-border bg-cookbook-glass backdrop-blur-sm">
                {" "}
                <img
                  src={item.image}
                  alt={item.text}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />{" "}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>{" "}
                <button
                  onClick={() => handleLinkDelete(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-cookbook-glass-border hover:bg-red-500/80"
                >
                  {" "}
                  <Trash2 size={14} />{" "}
                </button>{" "}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between"
                >
                  {" "}
                  <span className="font-serif text-sm font-medium truncate pr-2">
                    {" "}
                    {item.text}{" "}
                  </span>{" "}
                  <ExternalLink
                    size={14}
                    className="shrink-0 opacity-70"
                  />{" "}
                </a>{" "}
              </div>{" "}
            </div>
          ))}{" "}
          {links.length === 0 && (
            <div className="w-full h-40 rounded-3xl border-2 border-dashed border-cookbook-border bg-cookbook-surface/60 backdrop-blur-md flex items-center justify-center text-cookbook-text/40 font-serif italic text-sm text-center px-4 font-medium shrink-0 shadow-sm">
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
            {achievements.length} itens{" "}
          </span>{" "}
        </div>{" "}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {" "}
          {achievements.map((item) => (
            <div
              key={item.id}
              className="aspect-square rounded-3xl overflow-hidden relative group shadow-sm border border-cookbook-border bg-cookbook-glass backdrop-blur-sm"
            >
              {" "}
              <img
                src={item.imageUrl || item.image}
                alt={item.destination || item.title}
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
              {item.destination && (
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[8px] uppercase tracking-tighter text-white font-bold bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg truncate">
                    {item.destination}
                  </p>
                </div>
              )}
            </div>
          ))}{" "}
          {achievements.length < 12 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-3xl border-2 border-dashed border-cookbook-border flex flex-col items-center justify-center text-cookbook-text/40 hover:text-cookbook-primary hover:bg-cookbook-primary/5 transition-colors group bg-cookbook-surface/60 backdrop-blur-md"
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
          Você pode fixar até 3 memórias dos potes que já quebrou juntos.{" "}
        </p>{" "}
      </section>{" "}
      {/* 3. Histórico (Extrato simplificado) */}{" "}
      <section className="space-y-4">
        {" "}
        <h3 className="font-serif text-lg text-cookbook-text px-2">
          {" "}
          Histórico do Pote{" "}
        </h3>{" "}
        <div className="bg-cookbook-surface backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {" "}
          <div className="flex justify-between items-center mb-6">
            {" "}
            <div>
              {" "}
              <p className="text-[10px] uppercase tracking-widest text-cookbook-text/50 font-medium mb-1">
                {" "}
                Saldo Atual{" "}
              </p>{" "}
              <p className="font-serif text-2xl text-cookbook-primary font-medium">
                {" "}
                {formatCurrency(saldo)}{" "}
              </p>{" "}
            </div>{" "}
            <div className="text-right">
              {" "}
              <div className="flex items-center gap-1 justify-end text-emerald-600 text-[10px] font-bold">
                {" "}
                <ArrowUpCircle size={10} /> +{" "}
                {formatCurrency(totals.depositos)}{" "}
              </div>{" "}
              <div className="flex items-center gap-1 justify-end text-red-500 text-[10px] font-bold mt-1">
                {" "}
                <ArrowDownCircle size={10} /> -{" "}
                {formatCurrency(totals.gastos)}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="space-y-4">
            {" "}
            {filteredDeposits.length === 0 ? (
              <div className="text-center py-6 text-cookbook-text/40 font-sans text-xs">
                {" "}
                Ainda não há histórico de depósitos.{" "}
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto hide-scrollbar pr-2 -mx-2 pl-2">
                {" "}
                {filteredDeposits.map((d) => {
                  const isExpense = d.type === "expense";
                  return (
                    <div
                      key={d.id}
                      className="group flex flex-col md:flex-row items-start md:items-center justify-between py-2 border-b border-cookbook-glass-border last:border-0 hover:bg-cookbook-surface/10 px-2 -mx-2 rounded-xl transition-colors cursor-default gap-2"
                    >
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-xl shrink-0 backdrop-blur-md border ${isExpense ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}
                        >
                          {" "}
                          {isExpense ? (
                            <ArrowDownCircle size={14} />
                          ) : (
                            <ArrowUpCircle size={14} />
                          )}{" "}
                        </div>{" "}
                        <div className="min-w-0">
                          {" "}
                          <p className="font-serif text-sm text-cookbook-text truncate max-w-[120px] md:max-w-[200px]">
                            {" "}
                            {d.action ||
                              (isExpense ? "Gasto" : "Depósito")}{" "}
                          </p>{" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40">
                              {" "}
                              {d.whoName}{" "}
                            </span>{" "}
                            <span className="font-sans text-[9px] text-cookbook-text/30">
                              {" "}
                              {formatTime(d)}{" "}
                            </span>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="flex flex-col items-end gap-1">
                        {" "}
                        <div
                          className={`font-serif text-sm font-medium shrink-0 ${isExpense ? "text-red-500" : "text-emerald-600"}`}
                        >
                          {" "}
                          {isExpense ? "-" : "+"}{" "}
                          {formatCurrency(d.amount)}{" "}
                        </div>{" "}
                        {d.who === auth.currentUser?.uid && (
                          <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {" "}
                            <button
                              onClick={() => handleEdit(d)}
                              className="text-cookbook-text/40 hover:text-cookbook-primary"
                            >
                              {" "}
                              <Pencil size={12} />{" "}
                            </button>{" "}
                            <button
                              onClick={() => setDeleting(d)}
                              className="text-cookbook-text/40 hover:text-red-500"
                            >
                              {" "}
                              <Trash2 size={12} />{" "}
                            </button>{" "}
                          </div>
                        )}{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {editing && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-surface/60 backdrop-blur-md animate-modal-backdrop"
          onClick={() => setEditing(null)}
        >
          {" "}
          <div
            className="bg-cookbook-surface border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <h3 className="font-serif text-xl text-cookbook-text mb-4 font-medium">
              {" "}
              Editar Lançamento{" "}
            </h3>{" "}
            <div className="space-y-4 mb-6">
              {" "}
              <input
                type="text"
                inputMode="numeric"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-cookbook-surface/60 backdrop-blur-md border border-cookbook-border rounded-2xl py-3 pr-4 font-serif text-2xl text-center text-cookbook-text focus:outline-none focus:border-cookbook-primary"
              />{" "}
              <input
                type="text"
                value={editAction}
                onChange={(e) => setEditAction(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-cookbook-surface/60 backdrop-blur-md border border-cookbook-border rounded-2xl px-4 py-3 font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary"
              />{" "}
            </div>{" "}
            <div className="flex space-x-3">
              {" "}
              <button
                onClick={() => setEditing(null)}
                className="flex-1 bg-cookbook-surface border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase py-3 rounded-2xl font-bold"
              >
                {" "}
                Cancelar{" "}
              </button>{" "}
              <button
                onClick={confirmEdit}
                className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase py-3 rounded-2xl font-bold"
              >
                {" "}
                Salvar{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {deleting && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop"
          onClick={() => setDeleting(null)}
        >
          {" "}
          <div
            className="bg-cookbook-surface border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="w-12 h-12 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              {" "}
              <AlertCircle size={24} className="text-red-500" />{" "}
            </div>{" "}
            <h3 className="font-serif text-xl text-cookbook-text mb-2 font-medium">
              {" "}
              Remover?{" "}
            </h3>{" "}
            <p className="font-sans text-xs text-cookbook-text/60 mb-6">
              {" "}
              Deseja excluir este valor? Essa ação não pode ser desfeita.{" "}
            </p>{" "}
            <div className="flex space-x-3">
              {" "}
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 bg-cookbook-surface border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase py-3 rounded-2xl font-bold"
              >
                {" "}
                Cancelar{" "}
              </button>{" "}
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white font-sans text-[10px] uppercase py-3 rounded-2xl font-bold"
              >
                {" "}
                Remover{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
