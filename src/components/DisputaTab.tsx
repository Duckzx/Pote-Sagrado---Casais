import React, { useMemo, useState } from 'react';
import { Trophy, CheckCircle2, Pencil, X, Plus, Trash2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import confetti from 'canvas-confetti';

interface BattleChallenge {
  id: string;
  title: string;
  desc: string;
  reward: number;
  icon: string;
}

interface DisputaTabProps {
  deposits: any[];
  prize?: string;
  battleChallenges?: BattleChallenge[];
}

const DEFAULT_CHALLENGES: BattleChallenge[] = [
  { id: 'c1', title: 'Marmita Week', desc: 'Levar marmita todos os dias úteis da semana.', reward: 100, icon: '🍱' },
  { id: 'c2', title: 'Sexta Caseira', desc: 'Trocar o barzinho por um jantar a dois em casa.', reward: 80, icon: '🍷' },
  { id: 'c3', title: 'Faxina a Dois', desc: 'Limpar a casa juntos no fim de semana.', reward: 150, icon: '🧹' },
  { id: 'c4', title: 'Desafio do Café', desc: 'Fazer café em casa a semana toda.', reward: 35, icon: '☕' },
];

export const DisputaTab: React.FC<DisputaTabProps> = ({ deposits, prize, battleChallenges }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<BattleChallenge | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editReward, setEditReward] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // New challenge form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newIcon, setNewIcon] = useState('⭐');

  // Merge default challenges with Firestore custom ones
  const challenges = useMemo(() => {
    if (battleChallenges && battleChallenges.length > 0) {
      return battleChallenges;
    }
    return DEFAULT_CHALLENGES;
  }, [battleChallenges]);

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyDeposits = deposits.filter(d => {
      if (!d.createdAt?.toDate) return false;
      const date = d.createdAt.toDate();
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const userTotals: Record<string, { name: string, total: number }> = {};
    
    monthlyDeposits.forEach(d => {
      if (!userTotals[d.who]) {
        userTotals[d.who] = { name: d.whoName, total: 0 };
      }
      userTotals[d.who].total += d.amount;
    });

    const users = Object.values(userTotals).sort((a, b) => b.total - a.total);
    
    // Ensure we have at least two users for the UI, even if empty
    if (users.length === 0) {
      users.push({ name: 'Jogador 1', total: 0 }, { name: 'Jogador 2', total: 0 });
    } else if (users.length === 1) {
      users.push({ name: 'Jogador 2', total: 0 });
    }

    const total = users[0].total + users[1].total;
    const p1Percentage = total > 0 ? (users[0].total / total) * 100 : 50;
    const p2Percentage = total > 0 ? (users[1].total / total) * 100 : 50;

    return { users, total, p1Percentage, p2Percentage };
  }, [deposits]);

  const { users, p1Percentage, p2Percentage } = stats;

  const handleChallenge = async (challenge: BattleChallenge) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      await addDoc(collection(db, 'deposits'), {
        amount: challenge.reward,
        action: `Desafio Concluído: ${challenge.title}`,
        who: user.uid,
        whoName: user.displayName || user.email?.split('@')[0] || 'Alguém',
        createdAt: serverTimestamp()
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8E7F6D', '#2C2A26', '#E8E4D9']
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'deposits');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (challenge: BattleChallenge) => {
    setEditingChallenge(challenge);
    setEditTitle(challenge.title);
    setEditDesc(challenge.desc);
    setEditReward(challenge.reward.toString());
    setEditIcon(challenge.icon);
  };

  const handleSaveEdit = async () => {
    if (!editingChallenge || !editTitle.trim() || !editReward || isNaN(Number(editReward))) return;
    setIsSavingEdit(true);
    
    try {
      const updatedChallenges = challenges.map(c => 
        c.id === editingChallenge.id 
          ? { ...c, title: editTitle.trim(), desc: editDesc.trim(), reward: Number(editReward), icon: editIcon || c.icon }
          : c
      );

      await setDoc(doc(db, 'trip_config', 'main'), {
        battleChallenges: updatedChallenges,
      }, { merge: true });

      setEditingChallenge(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trip_config');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      const updatedChallenges = challenges.filter(c => c.id !== challengeId);
      await setDoc(doc(db, 'trip_config', 'main'), {
        battleChallenges: updatedChallenges,
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trip_config');
    }
  };

  const handleAddChallenge = async () => {
    if (!newTitle.trim() || !newReward || isNaN(Number(newReward))) return;
    setIsSavingEdit(true);

    try {
      const newChallenge: BattleChallenge = {
        id: `battle_${Date.now()}`,
        title: newTitle.trim(),
        desc: newDesc.trim(),
        reward: Number(newReward),
        icon: newIcon || '⭐'
      };

      const updatedChallenges = [...challenges, newChallenge];
      await setDoc(doc(db, 'trip_config', 'main'), {
        battleChallenges: updatedChallenges,
      }, { merge: true });

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

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-10">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-cookbook-text mb-2">A Grande Batalha</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Mês Atual
        </p>
      </div>

      {/* Battle Box */}
      <div className="bg-cookbook-battle border border-cookbook-border rounded-xl p-5">
        <div className="flex justify-between font-sans text-[11px] uppercase tracking-widest font-bold mb-4">
          <span>{users[0].name} ({Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[0].total)})</span>
          <span className="text-cookbook-text/50">Disputa</span>
          <span>{users[1].name} ({Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(users[1].total)})</span>
        </div>
        
        <div className="relative h-2 bg-cookbook-border rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-cookbook-primary transition-all duration-1000 ease-out"
            style={{ width: `${p1Percentage}%` }}
          />
          <div 
            className="h-full bg-cookbook-text transition-all duration-1000 ease-out"
            style={{ width: `${p2Percentage}%` }}
          />
        </div>
        
        <div className="mt-4 font-serif italic text-[13px] text-cookbook-primary flex items-center gap-2">
          <span className="text-cookbook-gold">◈</span> Recompensa: {prize || 'Quem juntar menos paga um jantar!'}
        </div>
      </div>

      {/* Leader Banner */}
      {users[0].total > users[1].total && (
        <div className="bg-white border border-cookbook-border rounded p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-text to-cookbook-primary opacity-20" />
          
          <div className="w-12 h-12 mx-auto bg-cookbook-bg rounded-full flex items-center justify-center mb-4 border border-cookbook-border">
            <Trophy size={20} className="text-cookbook-primary" />
          </div>
          
          <h3 className="font-serif italic text-lg text-cookbook-text mb-2">Liderança Atual</h3>
          <p className="font-sans text-xs uppercase tracking-widest text-cookbook-primary font-bold mb-1">
            {users[0].name} está na frente!
          </p>
          <p className="font-sans text-[10px] text-cookbook-text/60">
            Se o mês acabasse hoje, {users[1].name} pagaria a recompensa.
          </p>
        </div>
      )}

      {/* Challenges Board */}
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="font-serif text-xl text-cookbook-text mb-1">Mural de Desafios</h3>
          <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
            Cumpra missões e ganhe pontos (R$)
          </p>
        </div>

        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-white border border-cookbook-border rounded p-4 shadow-sm flex items-start space-x-4 group relative">
              <div className="text-3xl mt-1">{challenge.icon}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-serif italic text-sm text-cookbook-text">{challenge.title}</h4>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => handleEditClick(challenge)}
                      className="text-cookbook-text/30 hover:text-cookbook-primary transition-colors p-1"
                      title="Editar desafio"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteChallenge(challenge.id)}
                      className="text-cookbook-text/30 hover:text-red-500 transition-colors p-1"
                      title="Remover desafio"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="font-sans text-[10px] text-cookbook-text/60 mt-1 leading-relaxed">
                  {challenge.desc}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold">
                    Recompensa: R$ {challenge.reward}
                  </span>
                  <button
                    onClick={() => handleChallenge(challenge)}
                    disabled={isSubmitting}
                    className="flex items-center space-x-1 bg-cookbook-bg border border-cookbook-border px-3 py-1.5 rounded text-[9px] font-sans uppercase tracking-widest font-bold text-cookbook-text hover:bg-cookbook-primary hover:text-white hover:border-cookbook-primary transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={12} />
                    <span>Eu Cumpri!</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Challenge Button */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center space-x-2 bg-cookbook-bg border border-dashed border-cookbook-border text-cookbook-text/60 font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold hover:bg-white hover:border-cookbook-primary hover:text-cookbook-primary transition-colors"
          >
            <Plus size={16} />
            <span>Adicionar Desafio</span>
          </button>
        ) : (
          <div className="bg-white border border-cookbook-primary/30 rounded-xl p-5 shadow-md space-y-4 animate-modal-enter">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif italic text-sm text-cookbook-text">Novo Desafio</h4>
              <button onClick={() => setShowAddForm(false)} className="text-cookbook-text/40 hover:text-cookbook-text">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="⭐"
                className="w-16 bg-cookbook-bg border border-cookbook-border rounded px-2 py-2.5 font-serif text-center text-lg text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                maxLength={2}
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título do desafio"
                className="flex-1 bg-cookbook-bg border border-cookbook-border rounded px-4 py-2.5 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />
            </div>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descrição do desafio"
              className="w-full bg-cookbook-bg border border-cookbook-border rounded px-4 py-2.5 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
            />
            <div className="flex gap-2 items-center">
              <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold whitespace-nowrap">Recompensa R$</span>
              <input
                type="number"
                value={newReward}
                onChange={(e) => setNewReward(e.target.value)}
                placeholder="100"
                className="flex-1 bg-cookbook-bg border border-cookbook-border rounded px-4 py-2.5 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />
            </div>
            <button
              onClick={handleAddChallenge}
              disabled={!newTitle.trim() || !newReward || isSavingEdit}
              className="w-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
            >
              {isSavingEdit ? 'Salvando...' : 'Criar Desafio'}
            </button>
          </div>
        )}
      </div>

      {/* Edit Challenge Modal */}
      {editingChallenge && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-modal-backdrop" style={{ background: 'rgba(253,251,247,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white border border-cookbook-border rounded-xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter">
            <button 
              onClick={() => setEditingChallenge(null)}
              className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-serif text-xl text-cookbook-text mb-5">Editar Desafio</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  placeholder="🍱"
                  className="w-16 bg-cookbook-bg border border-cookbook-border rounded px-2 py-3 font-serif text-center text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título"
                  className="flex-1 bg-cookbook-bg border border-cookbook-border rounded px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                />
              </div>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-cookbook-bg border border-cookbook-border rounded px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-lg">R$</span>
                <input
                  type="number"
                  value={editReward}
                  onChange={(e) => setEditReward(e.target.value)}
                  placeholder="100"
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded py-3 pl-12 pr-4 font-serif text-2xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setEditingChallenge(null)}
                className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded font-bold hover:bg-cookbook-border/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
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
