import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, logout } from '../firebase';
import { LogOut, Save, Palette, MapPin, Share2, Sparkles, Plus, Trash2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { AIAkinatorModal } from './AIAkinatorModal';
import { InstallPrompt } from './InstallPrompt';

interface ConfigTabProps {
  currentDestination: string;
  currentOrigin: string;
  currentGoalAmount: number;
  currentTheme: string;
  customChallenges: any[];
  currentTargetDate: string;
  currentPrize?: string;
  currentWppPhone?: string;
  currentWppApiKey?: string;
  addToast: (title: string, message: string, type: 'info' | 'success' | 'milestone') => void;
}

const THEMES = [
  { id: 'cookbook', label: 'Cookbook (Padrão)', colors: ['#FDFBF7', '#8E7F6D'] },
  { id: 'mediterranean', label: 'Mediterranean Sunset', colors: ['#FFF5EE', '#E07A5F'] },
  { id: 'nordic', label: 'Nordic Twilight', colors: ['#F0F4F8', '#5C7C8A'] },
  { id: 'tropical', label: 'Tropical Breeze', colors: ['#F2FAF5', '#2A9D8F'] },
  { id: 'midnight', label: '🌙 Midnight', colors: ['#1A1A2E', '#C5A059'] },
];

export const ConfigTab: React.FC<ConfigTabProps> = ({ currentDestination, currentOrigin, currentGoalAmount, currentTheme, customChallenges, currentTargetDate, currentPrize, currentWppPhone, currentWppApiKey, addToast }) => {
  const [destination, setDestination] = useState(currentDestination || '');
  const [origin, setOrigin] = useState(currentOrigin || '');
  const [goalAmount, setGoalAmount] = useState((currentGoalAmount || 0).toString());
  const [theme, setTheme] = useState(currentTheme || 'cookbook');
  const [challenges, setChallenges] = useState<any[]>(customChallenges || []);
  const [targetDate, setTargetDate] = useState(currentTargetDate || '');
  const [prize, setPrize] = useState(currentPrize || '');
  const [wppPhone, setWppPhone] = useState(currentWppPhone || '');
  const [wppApiKey, setWppApiKey] = useState(currentWppApiKey || '');
  
  const [newChallengeLabel, setNewChallengeLabel] = useState('');
  const [newChallengeIcon, setNewChallengeIcon] = useState('⭐');

  const [isSaving, setIsSaving] = useState(false);
  const [showAkinator, setShowAkinator] = useState(false);

  useEffect(() => {
    setDestination(currentDestination || '');
    setOrigin(currentOrigin || '');
    setGoalAmount((currentGoalAmount || 0).toString());
    setTheme(currentTheme || 'cookbook');
    setChallenges(customChallenges || []);
    setTargetDate(currentTargetDate || '');
    setPrize(currentPrize || '');
    setWppPhone(currentWppPhone || '');
    setWppApiKey(currentWppApiKey || '');
  }, [currentDestination, currentOrigin, currentGoalAmount, currentTheme, customChallenges, currentTargetDate, currentPrize, currentWppPhone, currentWppApiKey]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Geocode destination
      let lat = 0;
      let lng = 0;
      if (destination) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`);
          const data = await res.json();
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon);
          }
        } catch (e) {
          console.error("Geocoding failed", e);
        }
      }

      await setDoc(doc(db, 'trip_config', 'main'), {
        destination,
        origin,
        goalAmount: Number(goalAmount),
        lat,
        lng,
        customChallenges: challenges,
        targetDate,
        monthlyPrize: prize,
        wppPhone,
        wppApiKey,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          theme,
          displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0]
        }, { merge: true });
      }

      addToast('Salvo!', 'Configurações salvas com sucesso!', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trip_config');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-cookbook-text mb-2">Ajustes</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Configure a Viagem
        </p>
      </div>

      <InstallPrompt />

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 ml-1 font-bold">
              Local de Partida
            </label>
            <button 
              onClick={handleGetLocation}
              className="flex items-center space-x-1 text-[9px] font-sans uppercase tracking-widest font-bold text-cookbook-primary hover:text-cookbook-gold transition-colors"
            >
              <MapPin size={10} />
              <span>Usar Atual</span>
            </button>
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

        <div className="pt-4 border-t border-cookbook-border space-y-4">
          <div className="text-center mb-4">
            <h3 className="font-serif text-lg text-cookbook-text mb-1">Notificação (WhatsApp)</h3>
            <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
              Via CallMeBot API (Gratuito)
            </p>
          </div>
          <div className="space-y-2">
            <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 ml-1 font-bold">
              Telefone do Parceiro (com DDI e DDD)
            </label>
            <input
              type="text"
              value={wppPhone}
              onChange={(e) => setWppPhone(e.target.value)}
              placeholder="+5511999999999"
              className="w-full bg-cookbook-bg border border-cookbook-border rounded px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 ml-1 font-bold">
              API Key do CallMeBot
            </label>
            <input
              type="text"
              value={wppApiKey}
              onChange={(e) => setWppApiKey(e.target.value)}
              placeholder="Ex: 857392"
              className="w-full bg-cookbook-bg border border-cookbook-border rounded px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-sm"
            />
          </div>
          <p className="font-serif italic text-[10px] text-cookbook-text/50 px-2 text-center">
            Adicione o número "+34 624 54 22 28" aos contatos, mande "I allow callmebot to send me messages" no WhatsApp e cole a chave (API Key) acima.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-cookbook-border">
          <label className="flex items-center space-x-2 font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 ml-1 font-bold">
            <Palette size={14} />
            <span>Tema do App</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center space-x-3 p-3 rounded border transition-all ${
                  theme === t.id 
                    ? 'border-cookbook-primary bg-white shadow-md' 
                    : 'border-cookbook-border bg-cookbook-bg/50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex space-x-[-8px]">
                  <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: t.colors[0] }} />
                  <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: t.colors[1] }} />
                </div>
                <span className="font-serif text-[11px] text-cookbook-text text-left leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center space-x-2 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold disabled:opacity-50 transition-opacity mt-4"
        >
          <Save size={16} />
          <span>{isSaving ? 'Salvando...' : 'Salvar Tudo'}</span>
        </button>
      </div>

      <div className="pt-8 border-t border-cookbook-border space-y-4">
        <div className="text-center mb-4">
          <h3 className="font-serif text-lg text-cookbook-text mb-1">Convidar seu Amor</h3>
          <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
            Divida o pote e a viagem
          </p>
        </div>
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center space-x-2 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold hover:bg-cookbook-primary hover:text-white hover:border-cookbook-primary transition-colors shadow-sm"
        >
          <Share2 size={16} />
          <span>Compartilhar App</span>
        </button>
        <p className="text-center font-serif italic text-xs text-cookbook-text/50 px-4">
          Qualquer pessoa que acessar este link e fizer login dividirá o mesmo Pote Sagrado com você.
        </p>
      </div>

      <div className="pt-8 border-t border-cookbook-border">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 bg-transparent border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold hover:bg-cookbook-border/50 transition-colors"
        >
          <LogOut size={16} />
          <span>Sair da Conta</span>
        </button>
      </div>

      {showAkinator && (
        <AIAkinatorModal
          onClose={() => setShowAkinator(false)}
          onSelectDestination={(dest) => {
            setDestination(dest);
            setShowAkinator(false);
            addToast('Destino Escolhido', 'Não esqueça de salvar as configurações!', 'success');
          }}
        />
      )}
    </div>
  );
};
