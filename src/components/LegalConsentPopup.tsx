import React from "react";
import { Shield, Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export const LegalConsentPopup: React.FC = () => {
  const [isAccepting, setIsAccepting] = React.useState(false);

  const lgpdConsent = useAppStore(s => s.lgpdConsent);
  const hasCheckedConsent = useAppStore(s => s.hasCheckedConsent);
  const acceptLgpd = useAppStore(s => s.acceptLgpd);
  const user = useAppStore(s => s.user);

  // If we haven't loaded the consent state yet from Firestore, or if they already consented, hide
  if (!hasCheckedConsent || lgpdConsent) {
    return null;
  }

  // We should only force this popup for logged in users (since unauthenticated users see the intro page and can't use the app anyway, but we still handle both). Wait, the prompt asked to restrict to new users, keeping record.
  // We'll show a full overlay so they can't do anything else before accepting.
  if (!user) {
     return null; // Not logged in yet. They see it after login.
  }

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptLgpd();
    } catch (err) {
      console.error("Failed to accept LGPD", err);
    } finally {
      // The store update should trigger a re-render and hide the modal, 
      // but we keep loading for a bit just in case of slow Firestore sync
      setTimeout(() => setIsAccepting(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex justify-center items-end sm:items-center bg-black/80 backdrop-blur-sm sm:p-6 transition-opacity animate-fade-in">
      <div 
        className="w-full sm:w-[450px] bg-cookbook-bg sm:rounded-[32px] rounded-t-[32px] shadow-2xl flex flex-col relative overflow-hidden animate-slide-up sm:border-4 border-cookbook-primary/20"
      >
        <div className="p-8 border-b border-cookbook-border flex items-center justify-between shrink-0 bg-cookbook-bg relative z-10 text-center flex-col gap-4">
          <div className="w-16 h-16 bg-cookbook-primary/10 rounded-full flex items-center justify-center text-cookbook-primary">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-cookbook-text">Termos e Privacidade</h2>
            <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 mt-1">Pote Sagrado App</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 font-sans text-sm text-cookbook-text/80 space-y-4">
          <p>
            Bem-vindo ao <strong>Pote Sagrado</strong>. Para garantir a segurança do seu diário financeiro compartilhado e cumprir os requisitos legais da LGPD, solicitamos o seu consentimento.
          </p>
          <div className="bg-cookbook-primary/5 p-4 rounded-xl border border-cookbook-primary/10 space-y-2">
            <p className="font-bold text-cookbook-primary text-[11px] uppercase tracking-widest">O que você está aceitando:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>Processamento das suas informações financeiras registradas na plataforma.</li>
              <li>Armazenamento do seu e-mail e ID na nuvem, garantindo a sua autenticação e sincronização.</li>
              <li>A aceitação dos nossos Termos de Uso. Você poderá solicitar a exclusão da sua conta a qualquer instante.</li>
            </ul>
          </div>
          <p className="text-xs opacity-70">
            Você pode ler os documentos completos na aba de Configurações, ou clicando {" "}
            <button onClick={() => window.dispatchEvent(new CustomEvent('open-legal', { detail: 'termos' }))} className="underline text-cookbook-primary font-bold">aqui</button>.
          </p>
        </div>
        
        <div className="p-6 border-t border-cookbook-border bg-cookbook-bg/80 backdrop-blur-md">
           <button 
             onClick={handleAccept}
             disabled={isAccepting}
             className={`w-full bg-cookbook-primary text-white font-sans text-xs uppercase tracking-widest py-4 rounded-xl shadow-[0_8px_16px_rgba(197,160,89,0.3)] transition-all hover:bg-cookbook-primary-hover active:scale-[0.98] font-bold flex items-center justify-center gap-2 ${isAccepting ? 'opacity-70 grayscale cursor-wait' : ''}`}
           >
             {isAccepting ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Check size={18} />
             )}
             {isAccepting ? 'Processando...' : 'Aceitar e Continuar'}
           </button>
           <p className="text-center font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 mt-4 leading-relaxed">
            Ao clicar em aceitar, este consentimento ficará gravado no seu perfil permanentemente.
           </p>
        </div>
      </div>
    </div>
  );
};
