import React, { useState, useMemo } from 'react';
import { CheckCircle2, Plus, Pencil, Trash2, X, Flame, Zap, Target, ChefHat, Coffee, Bus, Package, TreePine, Banknote, Tag, Scale } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import confetti from 'canvas-confetti';

// ========================================
// Types
// ========================================

interface Mission {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: 'economia' | 'desafio' | 'custom';
  reward: number;       // 0 = user inputs amount
  recurrence?: 'livre' | 'diaria' | 'semanal' | 'mensal';
}

interface MissoesTabProps {
  stats: Record<string, number>;
  customChallenges?: any[];
  battleChallenges?: any[];
  deposits: any[];
  currentUser: any;
  addToast: (title: string, message: string, type: 'info' | 'success' | 'milestone') => void;
}

// ========================================
// Default Missions (merged from Bingo + Batalha)
// ========================================

const DEFAULT_MISSIONS: Mission[] = [
  // Economia (from Bingo)
  { id: 'jantar_casa', title: 'Jantar em Casa', desc: 'Cozinharam juntos ao invés de pedir delivery.', icon: '🍝', category: 'economia', reward: 0 },
  { id: 'no_ifood', title: 'Resistiu ao iFood', desc: 'Venceram a tentação do delivery hoje.', icon: '🛵', category: 'economia', reward: 0 },
  { id: 'cafe_casa', title: 'Café em Casa', desc: 'Fizeram café ao invés de comprar na rua.', icon: '☕', category: 'economia', reward: 0 },
  { id: 'transporte', title: 'Transporte Econômico', desc: 'Usaram transporte público ou foram a pé.', icon: '🚌', category: 'economia', reward: 0 },
  { id: 'desapego', title: 'Vendeu Desapego', desc: 'Venderam algo que não usam mais.', icon: '📦', category: 'economia', reward: 0 },
  { id: 'passeio_gratis', title: 'Passeio Gratuito', desc: 'Encontraram diversão sem gastar nada.', icon: '🌳', category: 'economia', reward: 0 },
  { id: 'extra', title: 'Renda Extra', desc: 'Conseguiram uma graninha a mais!', icon: '💰', category: 'economia', reward: 0 },
  { id: 'promocao', title: 'Aproveitou Promoção', desc: 'Economizaram comprando em promoção.', icon: '🏷️', category: 'economia', reward: 0 },
  { id: 'multa', title: 'Multa da Regra', desc: 'Alguém quebrou uma regra e paga a multa!', icon: '⚖️', category: 'economia', reward: 0 },
  
  // Desafios (from Batalha)
  { id: 'c1', title: 'Marmita Week', desc: 'Levar marmita todos os dias úteis da semana.', icon: '🍱', category: 'desafio', reward: 100, recurrence: 'semanal' },
  { id: 'c2', title: 'Sexta Caseira', desc: 'Trocar o barzinho por um jantar a dois em casa.', icon: '🍷', category: 'desafio', reward: 80, recurrence: 'semanal' },
  { id: 'c3', title: 'Faxina a Dois', desc: 'Limpar a casa juntos no fim de semana.', icon: '🧹', category: 'desafio', reward: 150, recurrence: 'semanal' },
  { id: 'c4', title: 'Desafio do Café', desc: 'Fazer café em casa a semana toda.', icon: '☕', category: 'desafio', reward: 35, recurrence: 'semanal' },
];

type FilterType = 'todas' | 'economia' | 'desafio' | 'custom';

const FILTERS: { id: FilterType; label: string; emoji: string }[] = [
  { id: 'todas', label: 'Todas', emoji: '🎯' },
  { id: 'economia', label: 'Economia', emoji: '💚' },
  { id: 'desafio', label: 'Desafios', emoji: '⚔️' },
  { id: 'custom', label: 'Minhas', emoji: '⭐' },
];

// ========================================
// Component
// ========================================

export const MissoesTab: React.FC<MissoesTabProps> = ({ stats, customChallenges = [], battleChallenges = [], deposits, currentUser, addToast }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit state
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editReward, setEditReward] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Add new mission state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newIcon, setNewIcon] = useState('⭐');
  const [newCategory, setNewCategory] = useState<'economia' | 'desafio'>('desafio');

  // ========================================
  // Merge all missions from different sources
  // ========================================
  const allMissions = useMemo(() => {
    const missions: Mission[] = [];
    
    // If there are Firestore battle challenges, use those instead of default desafios
    if (battleChallenges.length > 0) {
      // Keep default economia missions
      missions.push(...DEFAULT_MISSIONS.filter(m => m.category === 'economia'));
      // Use Firestore battle challenges as desafio
      battleChallenges.forEach(bc => {
        missions.push({
          id: bc.id,
          title: bc.title,
          desc: bc.desc || '',
          icon: bc.icon || '⭐',
          category: 'desafio',
          reward: bc.reward || 0,
          recurrence: bc.recurrence || 'livre'
        });
      });
    } else {
      missions.push(...DEFAULT_MISSIONS);
    }
    
    // Add custom challenges from Bingo config
    customChallenges.forEach(cc => {
      missions.push({
        id: cc.id,
        title: cc.label,
        desc: '',
        icon: cc.icon || '⭐',
        category: 'custom',
        reward: 0
      });
    });
    
    return missions;
  }, [battleChallenges, customChallenges]);

  // ========================================
  // Filtered missions
  // ========================================
  const filteredMissions = useMemo(() => {
    if (activeFilter === 'todas') return allMissions;
    return allMissions.filter(m => m.category === activeFilter);
  }, [allMissions, activeFilter]);

  // ========================================
  // Streak calculation per mission
  // ========================================
  const streaks = useMemo(() => {
    if (!currentUser) return {};
    const result: Record<string, { count: number; streak: number }> = {};
    
    allMissions.forEach(mission => {
      const missionDeposits = deposits.filter(d => 
        d.who === currentUser.uid && 
        d.type !== 'expense' &&
        (d.action === mission.title || d.action?.includes(mission.title))
      );
      
      // Total count
      const count = missionDeposits.length;
      
      // Streak: consecutive days with this mission
      const dates = Array.from(new Set(
        missionDeposits
          .map(d => d.createdAt?.toDate ? d.createdAt.toDate().toISOString().split('T')[0] : null)
          .filter(Boolean) as string[]
      )).sort().reverse();
      
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date();
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];
        
        if (dates[i] === expectedStr || (i === 0 && dates[i] === today)) {
          streak++;
        } else if (i === 0) {
          // Check if yesterday counts
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (dates[i] === yesterday.toISOString().split('T')[0]) {
            streak++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      
      result[mission.id] = { count, streak };
    });
    
    return result;
  }, [deposits, allMissions, currentUser]);

  // ========================================
  // Complete a mission
  // ========================================
  const handleComplete = async () => {
    if (!selectedMission) return;
    
    const finalAmount = selectedMission.reward > 0 
      ? selectedMission.reward 
      : Number(amount);
    
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) return;
    
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      await addDoc(collection(db, 'deposits'), {
        amount: finalAmount,
        action: selectedMission.category === 'desafio' 
          ? `Desafio Concluído: ${selectedMission.title}` 
          : selectedMission.title,
        who: user.uid,
        whoName: user.displayName || user.email?.split('@')[0] || 'Alguém',
        createdAt: serverTimestamp()
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8E7F6D', '#2C2A26', '#E8E4D9', '#C5A059']
      });

      addToast(
        selectedMission.category === 'desafio' ? '⚔️ Desafio Concluído!' : '💚 Economia Registrada!',
        `+R$ ${finalAmount.toFixed(2)} para o pote!`,
        'success'
      );

      setSelectedMission(null);
      setAmount('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'deposits');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // Edit mission
  // ========================================
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
      // Update in the appropriate Firestore collection
      const isDesafio = editingMission.category === 'desafio';
      
      if (isDesafio) {
        const updatedChallenges = (battleChallenges.length > 0 ? battleChallenges : DEFAULT_MISSIONS.filter(m => m.category === 'desafio')).map(c =>
          c.id === editingMission.id
            ? { ...c, title: editTitle.trim(), desc: editDesc.trim(), reward: Number(editReward) || 0, icon: editIcon || c.icon }
            : c
        );
        await setDoc(doc(db, 'trip_config', 'main'), { battleChallenges: updatedChallenges }, { merge: true });
      } else if (editingMission.category === 'custom') {
        const updatedCustom = customChallenges.map(c =>
          c.id === editingMission.id
            ? { ...c, label: editTitle.trim(), icon: editIcon || c.icon }
            : c
        );
        await setDoc(doc(db, 'trip_config', 'main'), { customChallenges: updatedCustom }, { merge: true });
      }
      
      addToast('Atualizado', 'Missão editada com sucesso!', 'success');
      setEditingMission(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trip_config');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ========================================
  // Delete mission
  // ========================================
  const handleDeleteMission = async (mission: Mission) => {
    try {
      if (mission.category === 'desafio') {
        const current = battleChallenges.length > 0 ? battleChallenges : DEFAULT_MISSIONS.filter(m => m.category === 'desafio');
        const updated = current.filter(c => c.id !== mission.id);
        await setDoc(doc(db, 'trip_config', 'main'), { battleChallenges: updated }, { merge: true });
      } else if (mission.category === 'custom') {
        const updated = customChallenges.filter(c => c.id !== mission.id);
        await setDoc(doc(db, 'trip_config', 'main'), { customChallenges: updated }, { merge: true });
      }
      addToast('Removido', 'Missão removida.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trip_config');
    }
  };

  // ========================================
  // Add new mission
  // ========================================
  const handleAddMission = async () => {
    if (!newTitle.trim()) return;
    setIsSavingEdit(true);

    try {
      if (newCategory === 'desafio') {
        const newChallenge = {
          id: `battle_${Date.now()}`,
          title: newTitle.trim(),
          desc: newDesc.trim(),
          reward: Number(newReward) || 0,
          icon: newIcon || '⭐'
        };
        const current = battleChallenges.length > 0 ? battleChallenges : DEFAULT_MISSIONS.filter(m => m.category === 'desafio');
        await setDoc(doc(db, 'trip_config', 'main'), { battleChallenges: [...current, newChallenge] }, { merge: true });
      } else {
        const newCustom = {
          id: `custom_${Date.now()}`,
          label: newTitle.trim(),
          icon: newIcon || '⭐'
        };
        await setDoc(doc(db, 'trip_config', 'main'), { customChallenges: [...customChallenges, newCustom] }, { merge: true });
      }

      addToast('Criado', 'Nova missão adicionada!', 'success');
      setNewTitle('');
      setNewDesc('');
      setNewReward('');
      setNewIcon('⭐');
      setShowAddForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trip_config');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ========================================
  // Category badge helper
  // ========================================
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'economia': return { label: 'ECONOMIA', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      case 'desafio': return { label: 'DESAFIO', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      case 'custom': return { label: 'PERSONALIZADO', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' };
      default: return { label: '', color: '' };
    }
  };

  const isEditable = (mission: Mission) => mission.category === 'desafio' || mission.category === 'custom';

  // ========================================
  // Render
  // ========================================
  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-serif text-2xl text-cookbook-text mb-1">Missões</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Economia vira aventura
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex justify-around bg-white border border-cookbook-border rounded-xl p-4 shadow-sm">
        <div className="text-center">
          <div className="font-serif text-2xl text-cookbook-primary">
            {Object.values(streaks).reduce((acc, s) => acc + s.count, 0)}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/50 font-bold mt-1">
            Completadas
          </div>
        </div>
        <div className="w-px bg-cookbook-border" />
        <div className="text-center">
          <div className="font-serif text-2xl text-amber-500">
            {Math.max(...Object.values(streaks).map(s => s.streak), 0)}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/50 font-bold mt-1">
            Melhor Streak
          </div>
        </div>
        <div className="w-px bg-cookbook-border" />
        <div className="text-center">
          <div className="font-serif text-2xl text-cookbook-text">
            {allMissions.length}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-widest text-cookbook-text/50 font-bold mt-1">
            Missões
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'bg-cookbook-primary text-white shadow-md'
                : 'bg-white border border-cookbook-border text-cookbook-text/60 hover:border-cookbook-primary/40'
            }`}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] ${
              activeFilter === filter.id ? 'bg-white/20' : 'bg-cookbook-bg'
            }`}>
              {filter.id === 'todas' ? allMissions.length : allMissions.filter(m => m.category === filter.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Mission Cards */}
      <div className="space-y-3">
        {filteredMissions.map(mission => {
          const badge = getCategoryBadge(mission.category);
          const missionStats = streaks[mission.id] || { count: 0, streak: 0 };
          
          return (
            <div 
              key={mission.id} 
              className="bg-white border border-cookbook-border rounded-xl p-4 shadow-sm transition-all hover:shadow-md group relative overflow-hidden"
            >
              {/* Top accent line based on category */}
              <div className={`absolute top-0 left-0 w-full h-0.5 ${
                mission.category === 'economia' ? 'bg-emerald-400' : 
                mission.category === 'desafio' ? 'bg-amber-400' : 'bg-violet-400'
              }`} />
              
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-3xl mt-0.5 shrink-0">{mission.icon}</div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif italic text-sm text-cookbook-text leading-tight">{mission.title}</h4>
                      {mission.desc && (
                        <p className="font-sans text-[10px] text-cookbook-text/50 mt-0.5 leading-relaxed">
                          {mission.desc}
                        </p>
                      )}
                    </div>
                    
                    {/* Edit/delete buttons (hover) */}
                    {isEditable(mission) && (
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleEditClick(mission)}
                          className="text-cookbook-text/30 hover:text-cookbook-primary transition-colors p-1"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteMission(mission)}
                          className="text-cookbook-text/30 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom row: badge + stats + action */}
                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {/* Category badge */}
                      <span className={`px-2 py-0.5 rounded-full font-sans text-[7px] uppercase tracking-widest font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      
                      {/* Reward */}
                      {mission.reward > 0 && (
                        <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-primary font-bold">
                          R$ {mission.reward}
                        </span>
                      )}
                      
                      {/* Streak indicator */}
                      {missionStats.streak > 0 && (
                        <span className="flex items-center gap-0.5 font-sans text-[9px] text-amber-500 font-bold">
                          <Flame size={10} />
                          {missionStats.streak}
                        </span>
                      )}
                      
                      {/* Count */}
                      {missionStats.count > 0 && (
                        <span className="font-sans text-[9px] text-cookbook-text/40">
                          ×{missionStats.count}
                        </span>
                      )}
                    </div>
                    
                    {/* Complete button */}
                    <button
                      onClick={() => {
                        setSelectedMission(mission);
                        if (mission.reward > 0) setAmount(mission.reward.toString());
                        else setAmount('');
                      }}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 bg-cookbook-bg border border-cookbook-border px-3 py-1.5 rounded-lg text-[9px] font-sans uppercase tracking-widest font-bold text-cookbook-text hover:bg-cookbook-primary hover:text-white hover:border-cookbook-primary transition-all disabled:opacity-50 active:scale-95"
                    >
                      <CheckCircle2 size={11} />
                      <span>Cumpri!</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Mission Button */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-cookbook-bg border border-dashed border-cookbook-border text-cookbook-text/60 font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold hover:bg-white hover:border-cookbook-primary hover:text-cookbook-primary transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Nova Missão</span>
        </button>
      ) : (
        <div className="bg-white border border-cookbook-primary/30 rounded-xl p-5 shadow-md space-y-4 animate-modal-enter">
          <div className="flex items-center justify-between">
            <h4 className="font-serif italic text-sm text-cookbook-text">Criar Missão</h4>
            <button onClick={() => setShowAddForm(false)} className="text-cookbook-text/40 hover:text-cookbook-text">
              <X size={16} />
            </button>
          </div>
          
          {/* Category selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setNewCategory('desafio')}
              className={`flex-1 py-2 rounded-lg font-sans text-[9px] uppercase tracking-widest font-bold border transition-all ${
                newCategory === 'desafio' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-cookbook-bg border-cookbook-border text-cookbook-text/50'
              }`}
            >
              ⚔️ Desafio
            </button>
            <button
              onClick={() => setNewCategory('economia')}
              className={`flex-1 py-2 rounded-lg font-sans text-[9px] uppercase tracking-widest font-bold border transition-all ${
                newCategory === 'economia' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-cookbook-bg border-cookbook-border text-cookbook-text/50'
              }`}
            >
              💚 Economia
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="⭐"
              className="w-14 bg-cookbook-bg border border-cookbook-border rounded-lg px-2 py-2.5 font-serif text-center text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              maxLength={2}
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nome da missão"
              className="flex-1 bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-2.5 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
            />
          </div>
          
          {newCategory === 'desafio' && (
            <>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-2.5 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />
              <div className="flex gap-2 items-center">
                <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-bold whitespace-nowrap">R$</span>
                <input
                  type="number"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  placeholder="Recompensa (ex: 100)"
                  className="flex-1 bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-2.5 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                />
              </div>
            </>
          )}
          
          <button
            onClick={handleAddMission}
            disabled={!newTitle.trim() || isSavingEdit}
            className="w-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-lg font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
          >
            {isSavingEdit ? 'Criando...' : 'Criar Missão'}
          </button>
        </div>
      )}

      {/* ========================================
          Complete Mission Modal 
          ======================================== */}
      {selectedMission && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-modal-backdrop" 
          style={{ background: 'rgba(253,251,247,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedMission(null)}
        >
          <div 
            className="bg-white border border-cookbook-border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter"
            onClick={e => e.stopPropagation()}
          >
            {/* Colored accent */}
            <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${
              selectedMission.category === 'economia' ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 
              selectedMission.category === 'desafio' ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 
              'bg-gradient-to-r from-violet-400 to-violet-300'
            }`} />
            
            <button 
              onClick={() => setSelectedMission(null)}
              className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6 pt-2">
              <span className="text-5xl block mb-4">{selectedMission.icon}</span>
              <h3 className="font-serif italic text-xl text-cookbook-text mb-1">{selectedMission.title}</h3>
              {selectedMission.desc && (
                <p className="font-sans text-[10px] text-cookbook-text/50 leading-relaxed">
                  {selectedMission.desc}
                </p>
              )}
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold mt-3">
                {selectedMission.reward > 0 ? `Recompensa: R$ ${selectedMission.reward}` : 'Quanto você economizou?'}
              </p>
            </div>

            <div className="space-y-4">
              {selectedMission.reward === 0 && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-lg">R$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-cookbook-bg border border-cookbook-border rounded-xl py-4 pl-12 pr-4 font-serif text-2xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                    autoFocus
                  />
                </div>
              )}
              
              <button
                onClick={handleComplete}
                disabled={isSubmitting || (selectedMission.reward === 0 && (!amount || Number(amount) <= 0))}
                className={`w-full text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold disabled:opacity-50 transition-all active:scale-95 shadow-lg ${
                  selectedMission.category === 'economia' 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500' 
                    : selectedMission.category === 'desafio'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500'
                    : 'bg-gradient-to-r from-violet-500 to-violet-400 hover:from-violet-600 hover:to-violet-500'
                }`}
              >
                {isSubmitting ? 'Guardando...' : selectedMission.reward > 0 ? `Guardar R$ ${selectedMission.reward}` : 'Guardar no Pote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          Edit Mission Modal
          ======================================== */}
      {editingMission && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-modal-backdrop" 
          style={{ background: 'rgba(253,251,247,0.85)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white border border-cookbook-border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter">
            <button 
              onClick={() => setEditingMission(null)}
              className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-serif text-xl text-cookbook-text mb-5">Editar Missão</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  placeholder="🍱"
                  className="w-14 bg-cookbook-bg border border-cookbook-border rounded-lg px-2 py-3 font-serif text-center text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título"
                  className="flex-1 bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                />
              </div>
              {editingMission.category === 'desafio' && (
                <>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Descrição"
                    className="w-full bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                  />
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-lg">R$</span>
                    <input
                      type="number"
                      value={editReward}
                      onChange={(e) => setEditReward(e.target.value)}
                      placeholder="100"
                      className="w-full bg-cookbook-bg border border-cookbook-border rounded-lg py-3 pl-12 pr-4 font-serif text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setEditingMission(null)}
                className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded-lg font-bold hover:bg-cookbook-border/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-lg font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
              >
                {isSavingEdit ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
