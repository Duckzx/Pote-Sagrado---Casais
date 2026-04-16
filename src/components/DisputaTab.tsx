import React, { useMemo, useState } from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import confetti from 'canvas-confetti';

interface DisputaTabProps {
  deposits: any[];
}

const CHALLENGES = [
  { id: 'c1', title: 'Marmita Week', desc: 'Levar marmita todos os dias úteis da semana.', reward: 100, icon: '🍱' },
  { id: 'c2', title: 'Sexta Caseira', desc: 'Trocar o barzinho por um jantar a dois em casa.', reward: 80, icon: '🍷' },
  { id: 'c3', title: 'Faxina a Dois', desc: 'Limpar a casa juntos no fim de semana.', reward: 150, icon: '🧹' },
  { id: 'c4', title: 'Desafio do Café', desc: 'Fazer café em casa a semana toda.', reward: 35, icon: '☕' },
];

export const DisputaTab: React.FC<DisputaTabProps> = ({ deposits }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChallenge = async (challenge: typeof CHALLENGES[0]) => {
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
          <span className="text-cookbook-gold">◈</span> Recompensa: Vencedor escolhe o próximo Jantar em Casa.
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
          <p className="font-sans text-xs uppercase tracking-widest text-cookbook-primary font-bold">
            {users[0].name} está na frente!
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
          {CHALLENGES.map((challenge) => (
            <div key={challenge.id} className="bg-white border border-cookbook-border rounded p-4 shadow-sm flex items-start space-x-4">
              <div className="text-3xl mt-1">{challenge.icon}</div>
              <div className="flex-1">
                <h4 className="font-serif italic text-sm text-cookbook-text">{challenge.title}</h4>
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
      </div>
    </div>
  );
};
