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
  HelpCircle,
} from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { triggerConnectionCelebration } from "../lib/utils";
import { useAppStore } from "../store/useAppStore";
import { GOAL_CATEGORIES } from "../data/goalCategories";
import { GoalType } from "../types";
import { AIAkinatorModal } from "./AIAkinatorModal";
import { InstallPrompt } from "./InstallPrompt";
import { maskCurrency, parseCurrencyString } from "../lib/maskUtils";
import { ORGANIC_PUNISHMENTS } from "../data/punishments";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/animated-tabs";
import { AvatarGroup } from "./ui/avatar-group";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
interface ConfigTabProps {
  currentGoalType?: GoalType;
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
  { id: "noir", label: "Noir (P&B)", colors: ["#FFFFFF", "#000000"] },
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
  const casalId = useAppStore(s => s.casalId);
  const tripConfig = useAppStore(s => s.tripConfig);
  const coupleMembers = useAppStore(s => s.coupleMembers);
  
  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !auth.currentUser) return;
    const file = e.target.files[0];
    const { updateProfile } = await import("firebase/auth");
    
    // Convert to base64 using FileReader
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateProfile(auth.currentUser!, { photoURL: base64String });
        await setDoc(doc(db, "users", auth.currentUser!.uid), { photoURL: base64String }, { merge: true });
        addToast("Sucesso", "Foto de perfil atualizada!", "success");
      } catch (err) {
        console.error(err);
        addToast("Erro", "Falha ao atualizar foto", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  // Custom sub-tabs state
  const [configSubTab, setConfigSubTab] = useState<"geral" | "personalizacao" | "avancado">("geral");

  const [goalType, setGoalType] = useState<GoalType>(currentGoalType || 'travel');
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
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  const handleApplyInviteCode = async () => {
    if (!inviteCodeInput) {
      addToast("Aviso", "Digite um código de convite.", "info");
      return;
    }
    const { collection, query, where, getDocs, doc, setDoc, getDoc } = await import("firebase/firestore");
    const { migrateUserToAnotherCouple } = await import('../lib/couple-migration');
    try {
      const q = query(collection(db, 'users'), where('inviteCode', '==', inviteCodeInput.trim().toUpperCase()));
      const snap = await getDocs(q);
      
      let newCasalId = "";
      if (!snap.empty) {
        const partnerDoc = snap.docs[0];
        if (partnerDoc.id === auth.currentUser?.uid) {
           addToast("Aviso", "Este é o seu próprio código.", "info");
           return;
        }
        newCasalId = partnerDoc.data().casalId || `casal_${partnerDoc.id}`;
      } else {
        if (inviteCodeInput.trim().startsWith('casal_')) {
          newCasalId = inviteCodeInput.trim();
        } else {
           addToast("Erro", "Código não encontrado.", "info");
           return;
        }
      }

      if (newCasalId) {
        const myDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
        const myCurrentCasalId = myDoc.exists() ? (myDoc.data().casalId || `casal_${auth.currentUser!.uid}`) : `casal_${auth.currentUser!.uid}`;
        if (newCasalId !== myCurrentCasalId) {
          await migrateUserToAnotherCouple(auth.currentUser!.uid, myCurrentCasalId, newCasalId);
          addToast("Sucesso", "Casal conectado com sucesso!", "success");
          triggerConnectionCelebration();
        } else {
          addToast("Aviso", "Você já está conectado a este casal.", "info");
        }
        setInviteCodeInput("");
      }
    } catch (err) {
      addToast("Erro", "Falha ao vincular código.", "info");
      console.error(err);
    }
  };
  
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
    currentPrize
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
      relationshipStartDate,
      goalType
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
  const me = coupleMembers.find(m => m.id === auth.currentUser?.uid);

  const handleShare = async () => {
    const inviteUrl = new URL(window.location.href);
    const code = me?.inviteCode || casalId;
    if (code) {
      inviteUrl.searchParams.set("invite", code);
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
    startDateToSave: string,
    goalTypeToSave: GoalType
  ) => {
    setIsSaving(true);
    try {
      let parsedAmount = parseCurrencyString(amountToSave);
      if (isNaN(parsedAmount)) parsedAmount = 0;
      await setDoc(
        doc(db, `casais/${casalId}/trip_config`, "main"),
        {
          goalType: goalTypeToSave,
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
      relationshipStartDate,
      goalType
    );
  };
  return (
    <div className="pb-32 pt-6 px-4 w-full max-w-md md:max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header Section */}
      <section className="flex flex-col items-center text-center gap-3 mt-0 mb-4 relative">
        <label className="relative group cursor-pointer block">
          <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
          {coupleMembers.length > 1 ? (
            <AvatarGroup 
              avatarUrls={coupleMembers.map(m => ({
                imageUrl: m.photoURL || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=200&h=200&auto=format&fit=crop",
                name: m.displayName || m.email?.split("@")[0] || "Profile",
              }))}
            />
          ) : (
            <Avatar variant="app" className="w-20 h-20 md:w-28 md:h-28 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:scale-[1.02] transition-transform duration-300">
              <AvatarImage 
                src={auth.currentUser?.photoURL || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=200&h=200&auto=format&fit=crop"} 
                alt="Profile" 
              />
              <AvatarFallback className="bg-cookbook-primary/20 text-cookbook-primary text-xl">
                {auth.currentUser?.displayName?.slice(0, 2).toUpperCase() || auth.currentUser?.email?.slice(0, 2).toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -z-0">
             <span className="text-white text-xs font-bold uppercase tracking-widest z-10">Alterar</span>
          </div>
        </label>
        <div>
          <h2 className="font-serif text-xl font-medium text-cookbook-text">
            {auth.currentUser?.displayName || "Casal Sonhador"}
          </h2>
          <p className="font-sans text-[10px] text-cookbook-text/40 mt-1 uppercase tracking-widest">
            {auth.currentUser?.email}
          </p>
        </div>
      </section>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="personalizacao">Visual & Funcões</TabsTrigger>
          <TabsTrigger value="avancado">Conta</TabsTrigger>
        </TabsList>

      <InstallPrompt />

      <section className="relative z-10 space-y-6 mt-6">
        <TabsContent value="geral">
          <div className="space-y-6 animate-fade-in">
            {/* Card 1: Destino e Meta */}
            <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden transition-all">
              <div className="flex items-center gap-2 text-cookbook-text mb-6">
                <Target size={18} className="text-cookbook-primary opacity-80" />
                <h3 className="font-serif text-xl font-medium">Nosso Objetivo</h3>
              </div>
              <div className="space-y-6 relative z-10 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                    Tipo de Conquista
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setGoalType(cat.id);
                            if (!destination) setDestination(cat.placeholder);
                            setSaveTrigger(prev => prev + 1);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium transition-all ${
                            goalType === cat.id
                              ? "bg-cookbook-primary text-white border-cookbook-primary shadow-sm"
                              : "bg-cookbook-bg/50 border-cookbook-border text-cookbook-text/60 hover:border-cookbook-primary/50"
                          }`}
                        >
                          <Icon size={14} /> {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                    {GOAL_CATEGORIES.find(c => c.id === goalType)?.label || "Objetivo"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onBlur={handleSaveLocal}
                      placeholder={GOAL_CATEGORIES.find(c => c.id === goalType)?.placeholder || "Descreva aqui..."}
                      className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors placeholder:text-cookbook-text/20"
                    />
                    <button
                      title="Ajuda com I.A."
                      onClick={() => setShowAkinator(true)}
                      className="absolute right-0 bottom-2 p-1 text-cookbook-gold hover:text-cookbook-primary transition-colors opacity-70 hover:opacity-100"
                    >
                      <Sparkles size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                    Meta Financeira (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maskCurrency(goalAmount)}
                    onChange={(e) => setGoalAmount(maskCurrency(e.target.value))}
                    onBlur={handleSaveLocal}
                    placeholder="0,00"
                    className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-2xl font-medium text-cookbook-primary focus:outline-none focus:border-cookbook-primary transition-colors placeholder:text-cookbook-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Detalhes da Aventura */}
            <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden transition-all">
              <div className="flex items-center gap-2 text-cookbook-text mb-6">
                <Sparkles size={18} className="text-cookbook-primary opacity-80" />
                <h3 className="font-serif text-xl font-medium">Detalhes Estendidos</h3>
              </div>
              <div className="space-y-6 flex-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                      Partida
                    </label>
                    <button
                      onClick={handleGetLocation}
                      className="text-[9px] uppercase tracking-widest text-cookbook-primary hover:text-cookbook-gold font-medium"
                    >
                      Usar GPS
                    </button>
                  </div>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    onBlur={handleSaveLocal}
                    placeholder="Ex: São Paulo, SP"
                    className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors placeholder:text-cookbook-text/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                    Nossa Data de Início do Relacionamento
                  </label>
                  <input
                    type="date"
                    value={relationshipStartDate}
                    onChange={(e) => setRelationshipStartDate(e.target.value)}
                    onBlur={handleSaveLocal}
                    className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors text-cookbook-text/80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                    Álbum Compartilhado de Fotos (Opcional)
                  </label>
                  <input
                    type="url"
                    value={sharedAlbumUrl}
                    onChange={(e) => setSharedAlbumUrl(e.target.value)}
                    onBlur={handleSaveLocal}
                    placeholder="Cole o link do Google Photos, iCloud..."
                    className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors text-cookbook-text/80"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium ml-1">
                      Aposta da Batalha (Duelo)
                    </label>
                    <button
                      onClick={() => {
                        setPrize(
                          ORGANIC_PUNISHMENTS[
                            Math.floor(Math.random() * ORGANIC_PUNISHMENTS.length)
                          ]
                        );
                        setSaveTrigger((prev) => prev + 1);
                      }}
                      className="text-[9px] uppercase tracking-widest text-cookbook-gold hover:text-cookbook-primary font-medium"
                    >
                      Sortear
                    </button>
                  </div>
                  <input
                    type="text"
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                    onBlur={handleSaveLocal}
                    placeholder="O perdedor paga a conta..."
                    className="w-full bg-transparent border-b border-cookbook-border/50 px-2 py-2 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors placeholder:text-cookbook-text/20"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Permissões e Acessos */}
            <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-all">
              <div className="flex items-center gap-2 text-cookbook-text mb-4">
                <Bell size={18} className="text-cookbook-primary opacity-80" />
                <h3 className="font-serif text-xl font-medium">
                  Notificações e Parceria
                </h3>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={handleEnablePush}
                  disabled={isRequestingPush || notificationPermission === "granted"}
                  className={`flex items-center justify-between py-3 border-b border-cookbook-border/30 hover:border-cookbook-primary/50 transition-colors text-left group ${notificationPermission === "granted" ? "opacity-60 cursor-default" : ""}`}
                >
                  <div className="pr-4">
                    <div className={`font-sans text-sm font-medium transition-colors ${notificationPermission === "granted" ? "text-emerald-500" : "text-cookbook-text group-hover:text-cookbook-primary"}`}>
                      {notificationPermission === "granted" ? "Alertas Nativos Ativados" : "Ativar Alertas Nativos"}
                    </div>
                    <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">
                      {notificationPermission === "granted" ? "Você já está recebendo alertas deste dispositivo." : "Ser lembrado pelo navegador aumenta bastante a economia."}
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${notificationPermission === "granted" ? "text-emerald-500 bg-emerald-500/10" : "text-cookbook-text group-hover:text-cookbook-primary"}`}>
                    <Bell size={16} />
                  </div>
                </button>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-sans text-sm font-medium text-cookbook-text">
                      Código de Convite
                    </div>
                    {me?.inviteCode && (
                       <div className="px-3 py-1 bg-cookbook-primary/10 text-cookbook-primary rounded-full font-mono text-sm tracking-widest font-bold">
                         {me.inviteCode}
                       </div>
                    )}
                  </div>
                  <div className="font-sans text-[11px] text-cookbook-text/40 mb-3 leading-tight">
                    Compartilhe este código ou o link abaixo com seu par para conectarem as contas.
                  </div>
                  
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-cookbook-gold text-white font-sans text-[10px] uppercase tracking-widest rounded-full font-bold shadow-[0_4px_20px_rgba(197,160,89,0.4)] active:scale-95 transition-transform"
                  >
                    <Share2 size={16} />
                    Enviar Convite
                  </button>

                  {coupleMembers.length <= 1 && (
                    <div className="mt-4 pt-4 border-t border-cookbook-border/30">
                      <div className="font-sans text-xs font-medium text-cookbook-text mb-2">
                        Já tem um código?
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inviteCodeInput}
                          onChange={(e) => setInviteCodeInput(e.target.value)}
                          placeholder="Digite o código"
                          className="flex-1 bg-cookbook-bg border border-cookbook-border/50 rounded-full px-3 py-2 text-sm font-mono text-center uppercase tracking-widest focus:outline-none focus:border-cookbook-primary"
                        />
                        <button
                          onClick={handleApplyInviteCode}
                          className="px-4 py-2 bg-cookbook-primary text-white rounded-full text-[10px] uppercase tracking-widest font-bold"
                        >
                          Vincular
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ======================= PERSONALIZAÇÃO E FUNÇÕES TAB ======================= */}
        <TabsContent value="personalizacao">
          <div className="space-y-6 animate-fade-in">
            {/* Tema Visual */}
            <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-all">
              <div className="flex items-center gap-2 text-cookbook-text mb-6">
                <Palette size={18} className="text-cookbook-primary opacity-80" />
                <h3 className="font-serif text-xl font-medium">Tema Visual</h3>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6 pt-4 snap-x hide-scrollbar">
                {THEMES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setSaveTrigger((prev) => prev + 1);
                    }}
                    className="snap-center shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-20 h-28 rounded-2xl p-1 shadow-sm relative transition-all duration-300 border border-transparent ${theme === t.id ? "ring-2 ring-cookbook-primary ring-offset-2 ring-offset-cookbook-bg -translate-y-2 scale-105" : "hover:ring-2 hover:ring-cookbook-primary/40 hover:ring-offset-1 hover:ring-offset-cookbook-bg hover:-translate-y-1 border-cookbook-border/20"}`}
                    >
                      <div
                        className="w-full h-full rounded-xl overflow-hidden flex flex-col"
                        style={{
                          background: `linear-gradient(to bottom right, ${t.colors[0]}, ${t.colors[0]}ee)`,
                        }}
                      >
                        <div
                          className="h-1/3 w-full"
                          style={{ backgroundColor: t.colors[1], opacity: 0.15 }}
                        ></div>
                        <div className="p-2 flex flex-col gap-1.5 flex-1 justify-end">
                          <div
                            className="w-3/4 h-1 rounded-full"
                            style={{ backgroundColor: t.colors[1], opacity: 0.8 }}
                          ></div>
                          <div
                            className="w-1/2 h-1 rounded-full"
                            style={{ backgroundColor: t.colors[1], opacity: 0.5 }}
                          ></div>
                        </div>
                      </div>
                      {theme === t.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-cookbook-primary text-white rounded-full flex items-center justify-center shadow-md animate-fade-in">
                          <Sparkles size={12} />
                        </div>
                      )}
                    </div>
                    <span
                      className={`font-sans text-[10px] uppercase tracking-widest transition-colors ${theme === t.id ? "text-cookbook-primary font-medium" : "text-cookbook-text/40 group-hover:text-cookbook-text"}`}
                    >
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </TabsContent>

        {/* ======================= AVANÇADO TAB ======================= */}
        <TabsContent value="avancado">
          <div className="space-y-6 animate-fade-in">
            {/* Support & Legal */}
            <div className="bg-cookbook-bg backdrop-blur-2xl border border-cookbook-border rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-all">
              <div className="flex items-center gap-2 text-cookbook-text mb-6">
                <h3 className="font-serif text-xl font-medium">Ajuda, Termos e Privacidade</h3>
              </div>
              <div className="flex flex-col gap-3">
                 <button
                  onClick={() => {
                     useAppStore.getState().setShowOnboarding(true);
                  }}
                  className="flex items-center justify-between py-3 hover:border-cookbook-primary/50 transition-colors text-left group border-b border-cookbook-border/30"
                >
                  <div className="pr-4">
                    <div className="font-sans text-sm font-medium text-cookbook-text group-hover:text-cookbook-primary transition-colors flex items-center gap-2">
                      <HelpCircle size={16} className="text-cookbook-primary/60" /> Ver Tutorial de Boas-Vindas
                    </div>
                    <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">
                      Releia o guia passo a passo de como usar o Pote Sagrado.
                    </div>
                  </div>
                </button>
                 <button
                  onClick={() => {
                     window.open("mailto:suporte@potesagrado.com", "_blank");
                  }}
                  className="flex items-center justify-between py-3 hover:border-cookbook-primary/50 transition-colors text-left group border-b border-cookbook-border/30"
                >
                  <div className="pr-4">
                    <div className="font-sans text-sm font-medium text-cookbook-text group-hover:text-cookbook-primary transition-colors">
                      Atendimento e Suporte
                    </div>
                    <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">
                      Tire suas dúvidas ou reporte problemas.
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                     window.dispatchEvent(new CustomEvent('open-legal', { detail: 'privacidade' }));
                  }}
                  className="flex items-center justify-between py-3 hover:border-cookbook-primary/50 transition-colors text-left group border-b border-cookbook-border/30"
                >
                  <div className="pr-4">
                    <div className="font-sans text-sm font-medium text-cookbook-text group-hover:text-cookbook-primary transition-colors">
                      Termos de Uso e Política de Privacidade
                    </div>
                    <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">
                      Leia sobre seus direitos e como tratamos os dados (LGPD).
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Advanced & Account */}
            <div className="bg-cookbook-bg/50 backdrop-blur-2xl border border-cookbook-border/50 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-all">
              <div className="flex items-center gap-2 text-cookbook-text mb-6">
                <h3 className="font-serif text-xl font-medium">Desconectar Safeway</h3>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 py-4 hover:border-cookbook-primary/50 transition-colors text-left group bg-cookbook-bg border border-cookbook-border shadow-sm rounded-2xl px-5"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-cookbook-text/5 text-cookbook-text group-hover:bg-cookbook-primary/10 group-hover:text-cookbook-primary transition-colors shrink-0">
                      <LogOut size={16} />
                    </div>
                    <div>
                      <div className="font-sans text-sm font-medium text-cookbook-text group-hover:text-cookbook-primary transition-colors">
                        Sair do Aplicativo
                      </div>
                      <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">
                        Sua conta e saldo permanecem seguros nas nuvens.
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="flex flex-col items-center pt-8 pb-4 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 max-w-sm text-center">
                    <h4 className="font-serif text-red-600 font-medium mb-1 flex items-center justify-center gap-2">
                      <Trash2 size={16} /> Exclusão de Dados (LGPD)
                    </h4>
                    <p className="font-sans text-[10px] text-red-500/80 leading-tight mb-4 text-center px-2">
                      Solicite a remoção completa dos seus dados. Esta ação é irreversível e aciona a exclusão segura de todos os depósitos e fotos em nossos servidores.
                    </p>
                    <button
                      onClick={async () => {
                        if (window.confirm("Você tem certeza que deseja excluir sua conta e dados permanentemente? Esta ação não pode ser desfeita e excluirá também suas economias salvas!")) {
                          try {
                            if (auth.currentUser) {
                              const user = auth.currentUser;
                              const { deleteDoc, doc } = await import("firebase/firestore");
                              await deleteDoc(doc(db, "users", user.uid));
                              
                              const { deleteUser } = await import("firebase/auth");
                              await deleteUser(user);
                              
                              logout();
                            }
                          } catch (e: any) {
                            console.error("Erro ao deletar", e);
                            if (e.code === 'auth/requires-recent-login') {
                               alert("Para sua segurança, faça login novamente para excluir a conta.");
                               logout();
                            } else {
                               alert("Erro ao excluir conta");
                            }
                          }
                        }
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-sans text-[10px] uppercase tracking-widest font-bold py-3 rounded-full transition-colors shadow-md"
                    >
                      Excluir Minha Conta e Dados
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </section>
      </Tabs>

      {showAkinator && (
        <AIAkinatorModal
          onClose={() => setShowAkinator(false)}
          onSelectDestination={(dest) => {
            setDestination(dest);
            setSaveTrigger((prev) => prev + 1);
            setShowAkinator(false);
          }}
        />
      )}
    </div>
  );
};