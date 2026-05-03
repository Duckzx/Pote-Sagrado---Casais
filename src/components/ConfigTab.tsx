import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { MapPin, Bell, Palette, Sparkles, LogOut, Share2, Heart, ExternalLink, Link2 } from 'lucide-react';
import { db, auth, logout, messaging } from "../firebase";
import { useAppContext } from "../context/AppContext";
import { useAppStore } from "../store/useAppStore";
import {
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { InstallPrompt } from "./InstallPrompt";
import { maskCurrency, parseCurrencyString } from "../lib/maskUtils";
import { ORGANIC_PUNISHMENTS } from "../data/punishments";
import { ThemeId } from "../types";

const THEMES: { id: ThemeId; label: string; colors: [string, string] }[] = [
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

export const ConfigTab: React.FC = () => {
  const { user, casalId, partner, addToast } = useAppContext();
  const tripConfig = useAppStore(s => s.tripConfig);
  const currentTheme = useAppStore(s => s.theme);
  
  const [destination, setDestination] = useState(tripConfig.destination || "");
  const [origin, setOrigin] = useState(tripConfig.origin || "");
  const [goalAmount, setGoalAmount] = useState(() => {
    if (!tripConfig.goalAmount) return "";
    return (tripConfig.goalAmount * 100).toFixed(0);
  });
  const [theme, setTheme] = useState(currentTheme || "cookbook");
  const [challenges, setChallenges] = useState<any[]>(tripConfig.customChallenges || []);
  const [sharedAlbumUrl, setSharedAlbumUrl] = useState(tripConfig.sharedAlbumUrl || "");
  const [prize, setPrize] = useState(tripConfig.monthlyPrize || "");
  const [relationshipStartDate, setRelationshipStartDate] = useState(tripConfig.relationshipStartDate || "");

  const [newChallengeLabel, setNewChallengeLabel] = useState("");
  const [newChallengeIcon, setNewChallengeIcon] = useState("⭐");
  const [showHelp, setShowHelp] = useState(false);
  const [isRequestingPush, setIsRequestingPush] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const [saveTrigger, setSaveTrigger] = useState(0);

  useEffect(() => {
    setDestination(tripConfig.destination || "");
    setOrigin(tripConfig.origin || "");
    if (tripConfig.goalAmount) {
      setGoalAmount((tripConfig.goalAmount * 100).toFixed(0));
    } else {
      setGoalAmount("");
    }
    setTheme(currentTheme || "cookbook");
    setChallenges(tripConfig.customChallenges || []);
    setSharedAlbumUrl(tripConfig.sharedAlbumUrl || "");
    setRelationshipStartDate(tripConfig.relationshipStartDate || "");
    setPrize(tripConfig.monthlyPrize || "");
  }, [tripConfig, currentTheme]);

  const handleSaveLocal = () => {
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
    const inviteUrl = new URL(window.location.href);
    if (casalId) {
      inviteUrl.searchParams.set("invite", casalId);
    }
    const shareData = {
      title: "Pote Sagrado",
      text: "Vem economizar comigo para a nossa próxima viagem no Pote Sagrado!",
      url: inviteUrl.toString(),
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(inviteUrl.toString());
      addToast(
        "Copiado",
        "Link copiado para a área de transferência!",
        "success",
      );
    }
  };

  const handleEnablePush = async () => {
    if (!messaging || !user?.coupleId) {
      addToast(
        "Erro",
        "Seu navegador não suporta notificações Push ou perfil não identificado.",
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
          vapidKey: (import.meta as any).env.VITE_FIREBASE_VAPID_KEY || 'BNd0c8KkPz2SjR_QhE6pA9X6-yD9Qz6XoYvN7gN8P_U'
        });
        if (token && casalId) {
          const tripRef = doc(db, `casais/${casalId}/trip_config`, "main");

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
    if (!user?.coupleId) {
      addToast("Erro", "Perfil de casal não identificado.", "info");
      return;
    }
    setIsSaving(true);
    try {
      let parsedAmount = parseCurrencyString(amountToSave);
      if (isNaN(parsedAmount)) parsedAmount = 0;
      
      await setDoc(
        doc(db, `casais/${casalId}/trip_config`, "main"),

        {
          destination: destToSave,
          origin: originToSave,
          goalAmount: parsedAmount,
          customChallenges: challengesToSave,
          sharedAlbumUrl: sharedAlbumUrlToSave,
          relationshipStartDate: startDateToSave,
          monthlyPrize: prizeToSave,
          theme: themeToSave,
          coupleId: user.coupleId,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      
      await setDoc(
        doc(db, "users", user.uid),
        {
          theme: themeToSave,
          displayName: user.displayName || user.email?.split("@")[0],
        },
        { merge: true },
      );
      
      setSaveTrigger(0);
      setIsSaving(false);
      addToast("Sucesso", "Configurações salvas!", "success");
      
      if (destToSave) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destToSave)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              setDoc(
                doc(db, `casais/${casalId}/trip_config`, "main"),
                { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) },
                { merge: true },
              );
            }
          })

          .catch((e) => console.error("Geocoding failed", e));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/trip_config`);
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
                "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=200&h=200&auto=format&fit=crop"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
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
        {/* Card 3: Conexão de Casal */}{" "}
        <div className="bg-white/40 backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col col-span-1 transition-all overflow-hidden relative">
          {" "}
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Heart size={120} strokeWidth={1} />
          </div>
          <div className="flex items-center gap-2 text-cookbook-text mb-4 relative z-10">
            {" "}
            <Heart size={18} className="text-red-400 opacity-80" />{" "}
            <h3 className="font-serif text-xl font-medium">
              {" "}
              Conexão de Casal{" "}
            </h3>{" "}
          </div>{" "}
          
          <div className="flex flex-col gap-4 mt-2 relative z-10">
            {partner ? (
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-cookbook-border/30">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                  <img 
                    src={partner.photoURL || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=100&h=100&auto=format&fit=crop"} 
                    alt={partner.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">Conectado com</div>
                  <div className="font-serif text-lg text-cookbook-text truncate">{partner.displayName}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                  <Link2 size={16} />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-cookbook-primary/5 rounded-2xl border border-cookbook-primary/10 border-dashed">
                <p className="text-[11px] text-cookbook-text/60 leading-relaxed italic text-center">
                  Você está usando o pote de modo solo. Convide seu parceiro(a) para unificar os sonhos e economias!
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 mt-2">
              <button
                onClick={handleShare}
                className="flex items-center justify-between p-4 bg-white/60 hover:bg-white/80 rounded-2xl border border-cookbook-border/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cookbook-primary/10 flex items-center justify-center text-cookbook-primary group-hover:scale-110 transition-transform">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <div className="font-sans text-sm font-medium text-cookbook-text">Enviar Convite</div>
                    <div className="text-[10px] text-cookbook-text/40">Link único do seu pote</div>
                  </div>
                </div>
                <ExternalLink size={14} className="text-cookbook-text/20 group-hover:text-cookbook-primary transition-colors" />
              </button>

              <button
                onClick={handleEnablePush}
                disabled={isRequestingPush || notificationPermission === "granted"}
                className={`flex items-center justify-between p-4 bg-white/60 hover:bg-white/80 rounded-2xl border border-cookbook-border/30 transition-all group ${notificationPermission === "granted" ? "opacity-60 cursor-default" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${notificationPermission === "granted" ? "bg-emerald-100 text-emerald-500" : "bg-cookbook-gold/10 text-cookbook-gold group-hover:scale-110"}`}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className={`font-sans text-sm font-medium ${notificationPermission === "granted" ? "text-emerald-600" : "text-cookbook-text"}`}>
                      {notificationPermission === "granted" ? "Alertas Ativados" : "Ativar Notificações"}
                    </div>
                    <div className="text-[10px] text-cookbook-text/40">Lembretes de economia</div>
                  </div>
                </div>
              </button>
            </div>
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
        <div className="bg-white/40 backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col col-span-1 transition-all overflow-hidden relative">
          <div className="flex items-center gap-2 text-cookbook-text mb-4">
            <Sparkles size={18} className="text-cookbook-gold opacity-80" />
            <h3 className="font-serif text-xl font-medium">Dúvidas e Ajuda</h3>
          </div>
          <div className="space-y-3">
            <details className="group bg-white/50 rounded-2xl border border-cookbook-border/30 overflow-hidden transition-all">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-sans text-xs font-medium text-cookbook-text">Como conectar com meu parceiro?</span>
                <Plus size={14} className="text-cookbook-text/40 group-open:rotate-45 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-[11px] text-cookbook-text/60 leading-relaxed border-t border-cookbook-border/10 pt-3">
                Clique no botão <b>"Enviar Convite"</b> acima e mande o link para o seu parceiro(a). Ao clicar no link, ele(a) será vinculado automaticamente ao seu pote.
              </div>
            </details>
            
            <details className="group bg-white/50 rounded-2xl border border-cookbook-border/30 overflow-hidden transition-all">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-sans text-xs font-medium text-cookbook-text">Onde vejo nossos depósitos?</span>
                <Plus size={14} className="text-cookbook-text/40 group-open:rotate-45 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-[11px] text-cookbook-text/60 leading-relaxed border-t border-cookbook-border/10 pt-3">
                No menu <b>"Pote"</b> (ícone central), clique no botão <b>"Extrato"</b>. Lá você verá a linha do tempo de todas as economias do casal.
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
};
