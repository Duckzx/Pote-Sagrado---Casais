import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db, auth, logout, messaging } from "../firebase";
import {
  LogOut,
  Save,
  Palette,
  MapPin,
  Share2,
  Sparkles,
  Plus,
  Trash2,
  Bell,
} from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { AIAkinatorModal } from "./AIAkinatorModal";
import { InstallPrompt } from "./InstallPrompt";
import { maskCurrency, parseCurrencyString } from "../lib/maskUtils";
import { ORGANIC_PUNISHMENTS } from "../data/punishments";
interface ConfigTabProps {
  currentDestination: string;
  currentOrigin: string;
  currentGoalAmount: number;
  currentTheme: string;
  customChallenges: any[];
  currentSharedAlbumUrl?: string;
  currentPrize?: string;
  relationshipStartDate?: string;
  addToast: (
    title: string,
    message: string,
    type: "info" | "success" | "milestone",
  ) => void;
}
const THEMES = [
  {
    id: "cookbook",
    label: "Cookbook (Padrão)",
    colors: ["#FDFBF7", "#8E7F6D"],
  },
  {
    id: "mediterranean",
    label: "Mediterranean Sunset",
    colors: ["#FFF5EE", "#E07A5F"],
  },
  { id: "nordic", label: "Nordic Twilight", colors: ["#F0F4F8", "#5C7C8A"] },
  { id: "tropical", label: "Tropical Breeze", colors: ["#F2FAF5", "#2A9D8F"] },
  { id: "midnight", label: "🌙 Midnight", colors: ["#1A1A2E", "#C5A059"] },
];
export const ConfigTab: React.FC<ConfigTabProps> = ({
  currentDestination,
  currentOrigin,
  currentGoalAmount,
  currentTheme,
  customChallenges,
  currentSharedAlbumUrl,
  currentPrize,
  relationshipStartDate: currentRelationshipStartDate,
  addToast,
}) => {
  const [destination, setDestination] = useState(currentDestination || "");
  const [origin, setOrigin] = useState(currentOrigin || "");
  const [goalAmount, setGoalAmount] = useState(() => {
    if (!currentGoalAmount) return "";
    return (currentGoalAmount * 100).toFixed(0);
  });
  const [theme, setTheme] = useState(currentTheme || "cookbook");
  const [challenges, setChallenges] = useState<any[]>(customChallenges || []);
  const [sharedAlbumUrl, setSharedAlbumUrl] = useState(currentSharedAlbumUrl || "");
  const [relationshipStartDate, setRelationshipStartDate] = useState(currentRelationshipStartDate || "");
  const [prize, setPrize] = useState(currentPrize || "");
  const [newChallengeLabel, setNewChallengeLabel] = useState("");
  const [newChallengeIcon, setNewChallengeIcon] = useState("⭐");
  const [isSaving, setIsSaving] = useState(false);
  const [showAkinator, setShowAkinator] = useState(false);
  const [isRequestingPush, setIsRequestingPush] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  const [saveTrigger, setSaveTrigger] = useState(0);
  useEffect(() => {
    setDestination(currentDestination || "");
    setOrigin(currentOrigin || "");
    if (currentGoalAmount) {
      setGoalAmount((currentGoalAmount * 100).toFixed(0));
    } else {
      setGoalAmount("");
    }
    setTheme(currentTheme || "cookbook");
    setChallenges(customChallenges || []);
    setSharedAlbumUrl(currentSharedAlbumUrl || "");
    setRelationshipStartDate(currentRelationshipStartDate || "");
    setPrize(currentPrize || "");
  }, [
    currentDestination,
    currentOrigin,
    currentGoalAmount,
    currentTheme,
    customChallenges,
    currentSharedAlbumUrl,
    currentRelationshipStartDate,
    currentPrize,
  ]);
  /* Handle auto-save on blur */ const handleSaveLocal = () => {
    performSave(
      destination,
      goalAmount.toString(),
      origin,
      challenges,
      sharedAlbumUrl,
      prize,
      theme,
      relationshipStartDate
    );
  };
  useEffect(() => {
    if (saveTrigger > 0) {
      handleSaveLocal();
    }
  }, [saveTrigger]);
  const handleAddChallenge = () => {
    if (!newChallengeLabel.trim()) return;
    const newChallenge = {
      id: `custom_${Date.now()}`,
      label: newChallengeLabel.trim(),
      icon: newChallengeIcon || "⭐",
    };
    setChallenges([...challenges, newChallenge]);
    setNewChallengeLabel("");
    setNewChallengeIcon("⭐");
  };
  const handleRemoveChallenge = (id: string) => {
    setChallenges(challenges.filter((c) => c.id !== id));
  };
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      addToast(
        "Erro",
        "Geolocalização não suportada pelo seu navegador.",
        "info",
      );
      return;
    }
    addToast("Buscando", "Obtendo sua localização atual...", "info");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
          );
          const data = await res.json();
          if (data && data.address) {
            const city =
              data.address.city || data.address.town || data.address.village;
            const state = data.address.state;
            if (city && state) {
              setOrigin(`${city}, ${state}`);
              addToast("Sucesso", "Localização atualizada!", "success");
            } else {
              setOrigin(data.display_name.split(",").slice(0, 2).join(","));
              addToast("Sucesso", "Localização atualizada!", "success");
            }
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e);
          addToast("Erro", "Não foi possível converter a localização.", "info");
        }
      },
      (err) => {
        addToast("Erro", "Permissão de localização negada.", "info");
      },
    );
  };
  const handleShare = async () => {
    const shareData = {
      title: "Pote Sagrado",
      text: "Vem economizar comigo para a nossa próxima viagem no Pote Sagrado!",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast(
        "Copiado",
        "Link copiado para a área de transferência!",
        "success",
      );
    }
  };
  const handleEnablePush = async () => {
    if (!messaging) {
      addToast(
        "Erro",
        "Seu navegador não suporta notificações Push ou você bloqueou.",
        "info",
      );
      return;
    }
    setIsRequestingPush(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: (import.meta as any).env.VITE_FIREBASE_VAPID_KEY || 'BNd0c8KkPz2SjR_QhE6pA9X6-yD9Qz6XoYvN7gN8P_U' // VAPID de teste / mock se vazio
        });
        if (token) {
          const tripRef = doc(db, "trip_config", "main");
          const tDoc = await getDoc(tripRef);
          let fcmTokens: string[] = [];
          if (tDoc.exists()) {
            fcmTokens = tDoc.data().fcmTokens || [];
          }
          if (!fcmTokens.includes(token)) {
            fcmTokens.push(token);
            await setDoc(tripRef, { fcmTokens }, { merge: true });
          }
          addToast(
            "Sucesso",
            "Notificações Push nativas ativadas neste dispositivo!",
            "success",
          );
        } else {
          addToast(
            "Erro",
            "Não foi possível obter o token do aparelho.",
            "info",
          );
        }
      } else {
        addToast("Aviso", "Você recusou a permissão de notificações.", "info");
      }
    } catch (err) {
      console.error(err);
      addToast("Erro", "Houve um erro ao configurar o Push.", "info");
    } finally {
      setIsRequestingPush(false);
    }
  };
  const performSave = async (
    destToSave: string,
    amountToSave: string,
    originToSave: string,
    challengesToSave: any[],
    sharedAlbumUrlToSave: string,
    prizeToSave: string,
    themeToSave: string,
    startDateToSave: string
  ) => {
    setIsSaving(true);
    try {
      let parsedAmount = parseCurrencyString(amountToSave);
      if (isNaN(parsedAmount)) parsedAmount = 0;
      await setDoc(
        doc(db, "trip_config", "main"),
        {
          destination: destToSave,
          origin: originToSave,
          goalAmount: parsedAmount,
          customChallenges: challengesToSave,
          sharedAlbumUrl: sharedAlbumUrlToSave,
          relationshipStartDate: startDateToSave,
          monthlyPrize: prizeToSave,
          theme: themeToSave,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      if (auth.currentUser) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          {
            theme: themeToSave,
            displayName:
              auth.currentUser.displayName ||
              auth.currentUser.email?.split("@")[0],
          },
          { merge: true },
        );
      }
      setSaveTrigger(0);
      setIsSaving(false);
      addToast("Sucesso", "Configurações salvas!", "success");
      if (destToSave) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destToSave)}`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              setDoc(
                doc(db, "trip_config", "main"),
                { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) },
                { merge: true },
              );
            }
          })
          .catch((e) => console.error("Geocoding failed", e));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "trip_config");
      setIsSaving(false);
    }
  };
  const handleSave = () => {
    performSave(
      destination,
      goalAmount.toString(),
      origin,
      challenges,
      sharedAlbumUrl,
      prize,
      theme,
      relationshipStartDate
    );
  };
  return (
    <div className="pb-32 pt-6 px-4 max-w-2xl mx-auto space-y-10 animate-fade-in">
      {" "}
      {/* Profile Header Section */}{" "}
      <section className="flex flex-col items-center text-center gap-3 mt-0 mb-6 relative">
        {" "}
        <div className="relative group cursor-pointer">
          {" "}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
            {" "}
            <img
              src={
                auth.currentUser?.photoURL ||
                "https:/* images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=200&h=200&auto=format&fit=crop"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />{" "}
            */{" "}
          </div>{" "}
        </div>{" "}
        <div>
          {" "}
          <h2 className="font-serif text-xl font-medium text-cookbook-text">
            {" "}
            {auth.currentUser?.displayName || "Casal Sonhador"}{" "}
          </h2>{" "}
          <p className="font-sans text-[10px] text-cookbook-text/40 mt-1 uppercase tracking-widest">
            {" "}
            {auth.currentUser?.email}{" "}
          </p>{" "}
        </div>{" "}
      </section>{" "}
      <InstallPrompt /> {/* Bento Grid */}{" "}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {" "}
        {/* Card 1: Destino e Meta */}{" "}
        <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden transition-all">
          {" "}
          <div className="flex items-center gap-2 text-cookbook-text mb-6">
            {" "}
            <MapPin
              size={18}
              className="text-cookbook-primary opacity-80"
            />{" "}
            <h3 className="font-serif text-xl font-medium">A Aventura</h3>{" "}
          </div>{" "}
          <div className="space-y-6 relative z-10 flex-1">
            {" "}
            <div className="space-y-1">
              {" "}
              <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                {" "}
                Destino{" "}
              </label>{" "}
              <div className="relative">
                {" "}
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onBlur={handleSaveLocal}
                  placeholder="Paris, Praia, Disney..."
                  className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors placeholder:text-cookbook-text/20"
                />{" "}
                <button
                  title="Ajuda com I.A."
                  onClick={() => setShowAkinator(true)}
                  className="absolute right-0 bottom-2 p-1 text-cookbook-gold hover:text-cookbook-primary transition-colors opacity-70 hover:opacity-100"
                >
                  {" "}
                  <Sparkles size={16} />{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            <div className="space-y-1">
              {" "}
              <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                {" "}
                Meta Financeira (R$){" "}
              </label>{" "}
              <input
                type="text"
                inputMode="numeric"
                value={maskCurrency(goalAmount)}
                onChange={(e) => setGoalAmount(maskCurrency(e.target.value))}
                onBlur={handleSaveLocal}
                placeholder="0,00"
                className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-2xl font-medium text-cookbook-primary focus:outline-none focus:border-cookbook-primary transition-colors placeholder:text-cookbook-primary/20"
              />{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Card 2: Detalhes da Aventura */}{" "}
        <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden transition-all">
          {" "}
          <div className="flex items-center gap-2 text-cookbook-text mb-6">
            {" "}
            <Sparkles
              size={18}
              className="text-cookbook-primary opacity-80"
            />{" "}
            <h3 className="font-serif text-xl font-medium">
              {" "}
              Detalhes Estendidos{" "}
            </h3>{" "}
          </div>{" "}
          <div className="space-y-6 flex-1">
            {" "}
            <div className="space-y-1">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                  {" "}
                  Partida{" "}
                </label>{" "}
                <button
                  onClick={handleGetLocation}
                  className="text-[9px] uppercase tracking-widest text-cookbook-primary hover:text-cookbook-gold font-medium"
                >
                  {" "}
                  Usar GPS{" "}
                </button>{" "}
              </div>{" "}
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onBlur={handleSaveLocal}
                placeholder="Ex: São Paulo, SP"
                className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors placeholder:text-cookbook-text/20"
              />{" "}
            </div>{" "}
            <div className="space-y-1">
              {" "}
              <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                {" "}
                Nossa Data de Início do Relacionamento{" "}
              </label>{" "}
              <input
                type="date"
                value={relationshipStartDate}
                onChange={(e) => setRelationshipStartDate(e.target.value)}
                onBlur={handleSaveLocal}
                className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors text-cookbook-text/80"
              />{" "}
            </div>{" "}
            <div className="space-y-1">
              {" "}
              <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                {" "}
                Álbum Compartilhado de Fotos (Opcional){" "}
              </label>{" "}
              <input
                type="url"
                value={sharedAlbumUrl}
                onChange={(e) => setSharedAlbumUrl(e.target.value)}
                onBlur={handleSaveLocal}
                placeholder="Cole o link do Google Photos, iCloud..."
                className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors text-cookbook-text/80"
              />{" "}
            </div>{" "}
            <div className="space-y-1">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                  {" "}
                  Aposta da Batalha{" "}
                </label>{" "}
                <button
                  onClick={() => {
                    setPrize(
                      ORGANIC_PUNISHMENTS[
                        Math.floor(Math.random() * ORGANIC_PUNISHMENTS.length)
                      ],
                    );
                    setSaveTrigger((prev) => prev + 1);
                  }}
                  className="text-[9px] uppercase tracking-widest text-cookbook-gold hover:text-cookbook-primary font-medium"
                >
                  {" "}
                  Sortear{" "}
                </button>{" "}
              </div>{" "}
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                onBlur={handleSaveLocal}
                placeholder="O perdedor paga a conta..."
                className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors placeholder:text-cookbook-text/20"
              />{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Card 3: Permissões e Acessos */}{" "}
        <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col col-span-1 transition-all">
          {" "}
          <div className="flex items-center gap-2 text-cookbook-text mb-4">
            {" "}
            <Bell size={18} className="text-cookbook-primary opacity-80" />{" "}
            <h3 className="font-serif text-xl font-medium">
              {" "}
              Notificações e Parceria{" "}
            </h3>{" "}
          </div>{" "}
          <div className="flex flex-col gap-3 mt-2">
            {" "}
            <button
              onClick={handleEnablePush}
              disabled={isRequestingPush || notificationPermission === "granted"}
              className={`flex items-center justify-between py-3 border-b border-cookbook-border/30 hover:border-cookbook-primary/50 transition-colors text-left group ${notificationPermission === "granted" ? "opacity-60 cursor-default" : ""}`}
            >
              {" "}
              <div className="pr-4">
                {" "}
                <div className={`font-sans text-sm font-medium transition-colors ${notificationPermission === "granted" ? "text-emerald-500" : "text-cookbook-text group-hover:text-cookbook-primary"}`}>
                  {" "}
                  {notificationPermission === "granted" ? "Alertas Nativos Ativados" : "Ativar Alertas Nativos"}
                </div>{" "}
                <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">
                  {" "}
                  {notificationPermission === "granted" ? "Você já está recebendo alertas deste dispositivo." : "Ser lembrado pelo navegador aumenta bastante a economia."}
                </div>{" "}
              </div>{" "}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${notificationPermission === "granted" ? "text-emerald-500 bg-emerald-500/10" : "text-cookbook-text group-hover:text-cookbook-primary"}`}>
                {" "}
                <Bell size={16} />{" "}
              </div>{" "}
            </button>{" "}
            <button
              onClick={handleShare}
              className="flex items-center justify-between py-3 hover:border-cookbook-primary/50 transition-colors text-left group"
            >
              {" "}
              <div className="pr-4">
                {" "}
                <div className="font-sans text-sm font-medium text-cookbook-text group-hover:text-cookbook-primary transition-colors">
                  {" "}
                  Convidar Parceiro(a){" "}
                </div>{" "}
                <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">
                  {" "}
                  Envie o link para a pessoa acessar o app.{" "}
                </div>{" "}
              </div>{" "}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-cookbook-text group-hover:text-cookbook-primary transition-colors">
                {" "}
                <Share2 size={16} />{" "}
              </div>{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Card 4: Tema Visual */}{" "}
        <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col col-span-1 md:col-span-2 transition-all">
          {" "}
          <div className="flex items-center gap-2 text-cookbook-text mb-6">
            {" "}
            <Palette
              size={18}
              className="text-cookbook-primary opacity-80"
            />{" "}
            <h3 className="font-serif text-xl font-medium">Tema Visual</h3>{" "}
          </div>{" "}
          <div className="flex gap-6 overflow-x-auto pb-6 pt-4 snap-x hide-scrollbar">
            {" "}
            {THEMES.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setSaveTrigger((prev) => prev + 1);
                }}
                className="snap-center shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
              >
                {" "}
                <div
                  className={`w-20 h-28 rounded-2xl p-1 shadow-sm relative transition-all duration-300 border border-transparent ${theme === t.id ? "ring-2 ring-cookbook-primary ring-offset-2 ring-offset-cookbook-bg -translate-y-2 scale-105" : "hover:ring-2 hover:ring-cookbook-primary/40 hover:ring-offset-1 hover:ring-offset-cookbook-bg hover:-translate-y-1 border-cookbook-border/20"}`}
                >
                  {" "}
                  <div
                    className="w-full h-full rounded-xl overflow-hidden flex flex-col"
                    style={{
                      background: `linear-gradient(to bottom right, ${t.colors[0]}, ${t.colors[0]}ee)`,
                    }}
                  >
                    {" "}
                    <div
                      className="h-1/3 w-full"
                      style={{ backgroundColor: t.colors[1], opacity: 0.15 }}
                    ></div>{" "}
                    <div className="p-2 flex flex-col gap-1.5 flex-1 justify-end">
                      {" "}
                      <div
                        className="w-3/4 h-1 rounded-full"
                        style={{ backgroundColor: t.colors[1], opacity: 0.8 }}
                      ></div>{" "}
                      <div
                        className="w-1/2 h-1 rounded-full"
                        style={{ backgroundColor: t.colors[1], opacity: 0.5 }}
                      ></div>{" "}
                    </div>{" "}
                  </div>{" "}
                  {theme === t.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cookbook-primary text-white rounded-full flex items-center justify-center shadow-md animate-fade-in">
                      {" "}
                      <Sparkles size={12} />{" "}
                    </div>
                  )}{" "}
                </div>{" "}
                <span
                  className={`font-sans text-[10px] uppercase tracking-widest transition-colors ${theme === t.id ? "text-cookbook-primary font-medium" : "text-cookbook-text/40 group-hover:text-cookbook-text"}`}
                >
                  {" "}
                  {t.label}{" "}
                </span>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* Danger Zone */}{" "}
        <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
          {" "}
          <button
            onClick={logout}
            className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest font-medium text-red-500/80 hover:text-red-500 px-6 py-3 transition-colors rounded-full hover:bg-red-500/10 active:scale-95"
          >
            {" "}
            <LogOut size={16} strokeWidth={1.5} /> Desconectar Conta{" "}
          </button>{" "}
        </div>{" "}
      </section>{" "}
      {showAkinator && (
        <AIAkinatorModal
          onClose={() => setShowAkinator(false)}
          onSelectDestination={(dest) => {
            setDestination(dest);
            setSaveTrigger((prev) => prev + 1);
            setShowAkinator(false);
          }}
        />
      )}{" "}
    </div>
  );
};
