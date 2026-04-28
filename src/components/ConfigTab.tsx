import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { db, auth, logout, messaging } from '../firebase';
import { LogOut, Save, Palette, MapPin, Share2, Sparkles, Plus, Trash2, Bell } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { AIAkinatorModal } from './AIAkinatorModal';
import { InstallPrompt } from './InstallPrompt';

import { maskCurrency, parseCurrencyString } from '../lib/maskUtils';
import { ORGANIC_PUNISHMENTS } from '../data/punishments';

interface ConfigTabProps {
  currentDestination: string;
  currentOrigin: string;
  currentGoalAmount: number;
  currentTheme: string;
  customChallenges: any[];
  currentTargetDate: string;
  currentPrize?: string;
  addToast: (title: string, message: string, type: 'info' | 'success' | 'milestone') => void;
}

const THEMES = [
  { id: 'cookbook', label: 'Cookbook (Padrão)', colors: ['#FDFBF7', '#8E7F6D'] },
  { id: 'mediterranean', label: 'Mediterranean Sunset', colors: ['#FFF5EE', '#E07A5F'] },
  { id: 'nordic', label: 'Nordic Twilight', colors: ['#F0F4F8', '#5C7C8A'] },
  { id: 'tropical', label: 'Tropical Breeze', colors: ['#F2FAF5', '#2A9D8F'] },
  { id: 'midnight', label: '🌙 Midnight', colors: ['#1A1A2E', '#C5A059'] },
];

export const ConfigTab: React.FC<ConfigTabProps> = ({ currentDestination, currentOrigin, currentGoalAmount, currentTheme, customChallenges, currentTargetDate, currentPrize, addToast }) => {
  const [destination, setDestination] = useState(currentDestination || '');
  const [origin, setOrigin] = useState(currentOrigin || '');
  const [goalAmount, setGoalAmount] = useState(() => {
    if (!currentGoalAmount) return '';
    return (currentGoalAmount * 100).toFixed(0);
  });
  const [theme, setTheme] = useState(currentTheme || 'cookbook');
  const [challenges, setChallenges] = useState<any[]>(customChallenges || []);
  const [targetDate, setTargetDate] = useState(currentTargetDate || '');
  const [prize, setPrize] = useState(currentPrize || '');

  const [newChallengeLabel, setNewChallengeLabel] = useState('');
  const [newChallengeIcon, setNewChallengeIcon] = useState('⭐');

  const [isSaving, setIsSaving] = useState(false);
  const [showAkinator, setShowAkinator] = useState(false);
  const [isRequestingPush, setIsRequestingPush] = useState(false);

  const [saveTrigger, setSaveTrigger] = useState(0);

  useEffect(() => {
    setDestination(currentDestination || '');
    setOrigin(currentOrigin || '');
    if (currentGoalAmount) {
      setGoalAmount((currentGoalAmount * 100).toFixed(0));
    } else {
      setGoalAmount('');
    }
    setTheme(currentTheme || 'cookbook');
    setChallenges(customChallenges || []);
    setTargetDate(currentTargetDate || '');
    setPrize(currentPrize || '');
  }, [currentDestination, currentOrigin, currentGoalAmount, currentTheme, customChallenges, currentTargetDate, currentPrize]);

  // Handle auto-save on blur
  const handleSaveLocal = () => {
    performSave(destination, goalAmount.toString(), origin, challenges, targetDate, prize, theme);
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
      icon: newChallengeIcon || '⭐'
    };
    setChallenges([...challenges, newChallenge]);
    setNewChallengeLabel('');
    setNewChallengeIcon('⭐');
  };

  const handleRemoveChallenge = (id: string) => {
    setChallenges(challenges.filter(c => c.id !== id));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      addToast('Erro', 'Geolocalização não suportada pelo seu navegador.', 'info');
      return;
    }

    addToast('Buscando', 'Obtendo sua localização atual...', 'info');

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        if (data && data.address) {
          const city = data.address.city || data.address.town || data.address.village;
          const state = data.address.state;
          if (city && state) {
            setOrigin(`${city}, ${state}`);
            addToast('Sucesso', 'Localização atualizada!', 'success');
          } else {
            setOrigin(data.display_name.split(',').slice(0, 2).join(','));
            addToast('Sucesso', 'Localização atualizada!', 'success');
          }
        }
      } catch (e) {
        console.error("Reverse geocoding failed", e);
        addToast('Erro', 'Não foi possível converter a localização.', 'info');
      }
    }, (err) => {
      addToast('Erro', 'Permissão de localização negada.', 'info');
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Pote Sagrado',
      text: 'Vem economizar comigo para a nossa próxima viagem no Pote Sagrado!',
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Copiado', 'Link copiado para a área de transferência!', 'success');
    }
  };

  const handleEnablePush = async () => {
    if (!messaging) {
      addToast('Erro', 'Seu navegador não suporta notificações Push ou você bloqueou.', 'info');
      return;
    }

    setIsRequestingPush(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          // ATENÇÃO: É fortemente recomendado colocar seu vapidKey aqui para Web Push no futuro:
          // vapidKey: 'SEU_VAPID_KEY_AQUI'
        });

        if (token) {
          const tripRef = doc(db, 'trip_config', 'main');
          const tDoc = await getDoc(tripRef);

          let fcmTokens: string[] = [];
          if (tDoc.exists()) {
            fcmTokens = tDoc.data().fcmTokens || [];
          }

          if (!fcmTokens.includes(token)) {
            fcmTokens.push(token);
            await setDoc(tripRef, { fcmTokens }, { merge: true });
          }

          addToast('Sucesso', 'Notificações Push nativas ativadas neste dispositivo!', 'success');
        } else {
          addToast('Erro', 'Não foi possível obter o token do aparelho.', 'info');
        }
      } else {
        addToast('Aviso', 'Você recusou a permissão de notificações.', 'info');
      }
    } catch (err) {
      console.error(err);
      addToast('Erro', 'Houve um erro ao configurar o Push.', 'info');
    } finally {
      setIsRequestingPush(false);
    }
  };

  const performSave = async (destToSave: string, amountToSave: string, originToSave: string, challengesToSave: any[], targetDateToSave: string, prizeToSave: string, themeToSave: string) => {
    setIsSaving(true);
    try {
      // Clean amount
      let parsedAmount = parseCurrencyString(amountToSave);
      if (isNaN(parsedAmount)) parsedAmount = 0;

      // Optimistic save without waiting for geocoding
      await setDoc(doc(db, 'trip_config', 'main'), {
        destination: destToSave,
        origin: originToSave,
        goalAmount: parsedAmount,
        customChallenges: challengesToSave,
        targetDate: targetDateToSave,
        monthlyPrize: prizeToSave,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          theme: themeToSave,
          displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0]
        }, { merge: true });
      }

      addToast('Salvo!', 'Configurações salvas com sucesso!', 'success');

      // Do geocoding in background
      if (destToSave) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destToSave)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setDoc(doc(db, 'trip_config', 'main'), {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
              }, { merge: true });
            }
          })
          .catch(e => console.error("Geocoding failed", e));
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trip_config');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    performSave(destination, goalAmount.toString(), origin, challenges, targetDate, prize, theme);
  };


  return (
    <div className="pb-32 pt-6 px-4 max-w-2xl mx-auto space-y-10 animate-fade-in">

      {/* Profile Header Section */}
      <section className="flex flex-col items-center text-center gap-3 mt-0 mb-6 relative">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
            <img
              src={auth.currentUser?.photoURL || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=200&h=200&auto=format&fit=crop"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Ex: São Paulo, SP"
            className="w-full bg-white border border-cookbook-border rounded px-4 py-3 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 ml-1 font-bold">
              Destino
            </label>
            <button
              onClick={() => setShowAkinator(true)}
              className="flex items-center space-x-1 text-[9px] font-sans uppercase tracking-widest font-bold text-cookbook-gold hover:text-cookbook-primary transition-colors"
            >
              <Sparkles size={10} />
              <span>Oráculo IA</span>
            </button>
          </div>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ex: Mochilão Europa"
            className="w-full bg-white border border-cookbook-border rounded px-4 py-3 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 ml-1 font-bold">
            Meta Financeira (R$)
          </label>
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            placeholder="15000"
            className="w-full bg-white border border-cookbook-border rounded px-4 py-3 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 ml-1 font-bold">
            Data da Viagem (Opcional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-white border border-cookbook-border rounded px-4 py-3 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 ml-1 font-bold">
            Recompensa da Batalha (Opcional)
          </label>
          <input
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            placeholder="Ex: Perdedor paga o lanche"
            className="w-full bg-cookbook-bg border border-cookbook-border rounded px-4 py-3 font-serif text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-sm"
          />
        </div>

        {/* Card 3: Permissões e Acessos */}
        <div className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col col-span-1 transition-all">
          <div className="flex items-center gap-2 text-cookbook-text mb-4">
            <Bell size={18} className="text-cookbook-primary opacity-80" />
            <h3 className="font-serif text-xl font-medium">Notificações e Parceria</h3>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button onClick={handleEnablePush} disabled={isRequestingPush} className="flex items-center justify-between py-3 border-b border-cookbook-border/30 hover:border-cookbook-primary/50 transition-colors text-left group">
              <div className="pr-4">
                <div className="font-sans text-sm font-medium text-cookbook-text group-hover:text-cookbook-primary transition-colors">Ativar Alertas Nativos</div>
                <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">Ser lembrado pelo navegador aumenta bastante a economia.</div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-cookbook-text group-hover:text-cookbook-primary transition-colors">
                <Bell size={16} />
              </div>
            </button>

            <button onClick={handleShare} className="flex items-center justify-between py-3 hover:border-cookbook-primary/50 transition-colors text-left group">
              <div className="pr-4">
                <div className="font-sans text-sm font-medium text-cookbook-text group-hover:text-cookbook-primary transition-colors">Convidar Parceiro(a)</div>
                <div className="font-sans text-[11px] text-cookbook-text/40 mt-1 leading-tight">Envie o link para a pessoa acessar o app.</div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-cookbook-text group-hover:text-cookbook-primary transition-colors">
                <Share2 size={16} />
              </div>
            </button>
          </div>
        </div>

        {/* Card 4: Tema Visual */}
        <div className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col col-span-1 md:col-span-2 transition-all">
          <div className="flex items-center gap-2 text-cookbook-text mb-6">
            <Palette size={18} className="text-cookbook-primary opacity-80" />
            <h3 className="font-serif text-xl font-medium">Tema Visual</h3>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6 pt-4 snap-x hide-scrollbar px-2 -mx-2">
            {THEMES.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setSaveTrigger(prev => prev + 1);
                }}
                className="snap-center shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className={`w-20 h-28 rounded-2xl p-1 shadow-sm relative transition-all duration-300 ${theme === t.id
                    ? 'ring-2 ring-cookbook-primary ring-offset-2 ring-offset-transparent -translate-y-2 scale-105'
                    : 'border border-white/20 hover:border-cookbook-primary/50 hover:-translate-y-1'
                  }`}>
                  <div className="w-full h-full rounded-xl overflow-hidden flex flex-col" style={{ background: `linear-gradient(to bottom right, ${t.colors[0]}, ${t.colors[0]}ee)` }}>
                    <div className="h-1/3 w-full" style={{ backgroundColor: t.colors[1], opacity: 0.15 }}></div>
                    <div className="p-2 flex flex-col gap-1.5 flex-1 justify-end">
                      <div className="w-3/4 h-1 rounded-full" style={{ backgroundColor: t.colors[1], opacity: 0.8 }}></div>
                      <div className="w-1/2 h-1 rounded-full" style={{ backgroundColor: t.colors[1], opacity: 0.5 }}></div>
                    </div>
                  </div>
                  {theme === t.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-cookbook-primary text-white rounded-full flex items-center justify-center shadow-md animate-fade-in z-10">
                      <Sparkles size={10} />
                    </div>
                  )}
                </div>
                <span className={`font-sans text-[9px] uppercase tracking-widest transition-colors text-center max-w-[80px] ${theme === t.id ? 'text-cookbook-primary font-bold' : 'text-cookbook-text/40 group-hover:text-cookbook-text'}`}>
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
          <button
            onClick={logout}
            className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest font-medium text-red-500/80 hover:text-red-500 px-6 py-3 transition-colors rounded-full hover:bg-red-500/10 active:scale-95"
          >
            <LogOut size={16} strokeWidth={1.5} /> Desconectar Conta
          </button>
        </div>

      </section>

      {showAkinator && (
        <AIAkinatorModal
          onClose={() => setShowAkinator(false)}
          onSelectDestination={(dest) => {
            setDestination(dest);
            setShowAkinator(false);
          }}
        />
      )}
    </div>
  );
};
