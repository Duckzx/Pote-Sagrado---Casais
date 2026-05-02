import React, { useState, useMemo, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Heart, Send } from "lucide-react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { useAppContext } from "../context/AppContext";
import { Deposit } from "../types";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface ActivityFeedProps {
  deposits: Deposit[];
  currentUser: any;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = memo(({ deposits, currentUser }) => {
  const { casalId } = useAppContext();
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const handleAddComment = async (depositId: string) => {
    if (!commentText.trim() || !currentUser) return;

    const depositRef = doc(db, `casais/${casalId}/deposits`, depositId);
    const newComment = {
      id: Math.random().toString(36).substring(7),
      text: commentText.trim(),
      who: currentUser.uid,
      whoName: currentUser.displayName || "Usuário",
      createdAt: Date.now(),
    };

    try {
      await updateDoc(depositRef, {
        comments: arrayUnion(newComment),
      });
      setCommentText("");
      setCommentingOn(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `casais/${casalId}/deposits/${depositId}`);
    }
  };

  const handleToggleReaction = async (depositId: string, currentReactions: Record<string, string> = {}) => {
    if (!currentUser) return;
    
    // Toggle heart reaction logic
    const depositRef = doc(db, `casais/${casalId}/deposits`, depositId);
    const newReactions = { ...currentReactions };
    
    if (newReactions[currentUser.uid]) {
      delete newReactions[currentUser.uid];
    } else {
      newReactions[currentUser.uid] = "❤️";
    }

    try {
      await updateDoc(depositRef, {
        reactions: newReactions,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `casais/${casalId}/deposits/${depositId}`);
    }
  };

  // Sort deposits by date descending
  const sortedDeposits = useMemo(() => {
    return [...deposits]
      .filter(d => d.createdAt && d.createdAt.seconds)
      .sort((a, b) => b.createdAt!.seconds - a.createdAt!.seconds)
      .slice(0, 10);
  }, [deposits]);

  if (sortedDeposits.length === 0) return null;

  return (
    <div className="space-y-6 relative z-10 w-full max-w-md mx-auto mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 font-medium">
          Nossa Jornada
        </h3>
        <div className="h-[1px] flex-grow bg-cookbook-border" />
      </div>

      <div className="space-y-4">
        {sortedDeposits.map((deposit) => {
          const isExpense = deposit.type === "expense";
          const amountStr = Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(deposit.amount);
          
          const hasReacted = deposit.reactions && deposit.reactions[currentUser?.uid];
          const reactionCount = deposit.reactions ? Object.keys(deposit.reactions).length : 0;
          const comments = deposit.comments || [];

          return (
            <div key={deposit.id} className="bg-cookbook-surface border border-cookbook-border rounded-3xl p-4 shadow-sm animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cookbook-primary/20 to-transparent" />
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cookbook-border flex items-center justify-center font-bold text-cookbook-primary shrink-0">
                    {deposit.whoName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[13px] text-cookbook-text leading-tight">
                      <span className="font-bold">{deposit.whoName}</span>{' '}
                      {isExpense ? 'resgatou' : 'adicionou'}{' '}
                      <span className={isExpense ? "text-red-400 font-bold" : "text-cookbook-primary font-bold"}>
                        {amountStr}
                      </span>
                    </p>
                    <p className="font-sans text-[10px] text-cookbook-text/40 mt-0.5">
                      {formatDistanceToNow(new Date(deposit.createdAt!.seconds * 1000), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {deposit.action && (
                <div className="bg-cookbook-bg/50 rounded-xl p-3 mb-4 border border-white/5">
                  <p className="text-[13px] text-cookbook-text/80 italic">"{deposit.action}"</p>
                </div>
              )}

              {/* Interactions Box */}
              <div className="border-t border-cookbook-border/50 pt-3">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleReaction(deposit.id, deposit.reactions)}
                    className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${hasReacted ? 'text-red-400' : 'text-cookbook-text/40 hover:text-cookbook-text/60'}`}
                  >
                    <Heart size={14} className={hasReacted ? 'fill-current' : ''} />
                    {reactionCount > 0 ? reactionCount : 'Amor'}
                  </button>
                  <button 
                    onClick={() => setCommentingOn(commentingOn === deposit.id ? null : deposit.id)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-cookbook-text/40 hover:text-cookbook-text/60 transition-colors"
                  >
                    <MessageCircle size={14} />
                    {comments.length > 0 ? comments.length : 'Comentar'}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {comments.length > 0 && (
                <div className="mt-4 space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-cookbook-border/50 flex items-center justify-center font-bold text-[9px] text-cookbook-text/70 shrink-0 mt-0.5">
                        {comment.whoName.charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-cookbook-bg/80 rounded-2xl rounded-tl-none p-2.5 flex-1">
                        <p className="text-[11px] font-bold text-cookbook-text/90 mb-0.5">{comment.whoName}</p>
                        <p className="text-[12px] text-cookbook-text/70">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              {commentingOn === deposit.id && (
                <div className="mt-4 flex gap-2 items-center animate-fade-in">
                  <input
                    type="text"
                    placeholder="Escreva algo especial..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-cookbook-bg border border-cookbook-border rounded-full px-4 py-2 text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment(deposit.id);
                    }}
                    autoFocus
                  />
                  <button 
                    onClick={() => handleAddComment(deposit.id)}
                    disabled={!commentText.trim()}
                    className="w-8 h-8 rounded-full bg-cookbook-primary flex items-center justify-center text-white disabled:opacity-50 transition-opacity"
                  >
                    <Send size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
