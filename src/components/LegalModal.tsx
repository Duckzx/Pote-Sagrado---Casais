import React, { useEffect, useState } from "react";
import { X, Shield, FileText } from "lucide-react";
import { createPortal } from "react-dom";

export type LegalDocType = "termos" | "privacidade" | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!type || !mounted) return null;

  const title = type === "termos" ? "Termos de Uso" : "Política de Privacidade (LGPD)";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-center items-end sm:items-center bg-black/60 backdrop-blur-sm sm:p-6 transition-opacity animate-fade-in">
      <div 
        className="w-full sm:w-[400px] h-[85vh] sm:h-[800px] sm:max-h-[85vh] bg-cookbook-bg sm:rounded-[32px] rounded-t-[32px] shadow-2xl flex flex-col relative overflow-hidden animate-slide-up sm:border-4 border-cookbook-border"
      >
        <div className="p-6 border-b border-cookbook-border flex items-center justify-between shrink-0 bg-cookbook-bg relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cookbook-primary/10 rounded-full flex items-center justify-center text-cookbook-primary">
              {type === "termos" ? <FileText size={20} /> : <Shield size={20} />}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-cookbook-text">{title}</h2>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60">Pote Sagrado App</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-cookbook-border/50 text-cookbook-text rounded-full hover:bg-cookbook-border active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 font-sans text-sm text-cookbook-text/80 space-y-4">
          {type === "termos" ? (
            <>
              <p><strong>1. Aceitação dos Termos</strong><br/>Ao acessar e utilizar o Pote Sagrado, você concorda com os presentes Termos de Uso.</p>
              <p><strong>2. Descrição no Serviço</strong><br/>O aplicativo oferece um ambiente fechado para controle de despesas ou poupanças e gamificação gamificada exclusiva e compartilhada entre dois usuários autorizados e confirmados previamente.</p>
              <p><strong>3. Responsabilidade Sobre Dados Adicionados</strong><br/>Todo conteúdo registrado (fotos, comentários de depósitos) são de exclusiva conta e responsabilidade dos indivíduos da dupla.</p>
              <p><strong>4. Limitação de Suporte</strong><br/>Este serviço é fornecido 'como está' sem viés comercial corporativo para devoluções financeiras; usamos banco de dados na nuvem que não garante 100% de precisão imutável de transações financeiras profissionais.</p>
            </>
          ) : (
            <>
              <p><strong>Dever de Informação & Transparência (LGPD)</strong><br/>Na qualidade de operadores, prezamos pela preservação do consentimento direto.</p>
              <p><strong>Que dados recolhemos?</strong><br/>- Identificadores Básicos de Email ao logar pelo Google.<br/>- Metadados das interações e lançamentos criados no quadro financeiro do seu casal.<br/>- Cookies essenciais de persistência.</p>
              <p><strong>Base Legal & Consentimento</strong><br/>Utilizamos a permissão consentida ativamente explícita pelo 'banner' basal para manter estatísticas na nuvem via cache do seu casal.</p>
              <p><strong>Direito ao Esquecimento</strong><br/>Você detém total e absoluto controle. Em 'Configurações' existe a ação de Eliminar. Ao utilizá-la suas contas conectadas excluem em cascata os IDs subjacentes.</p>
              <p><strong>Compartilhamento</strong><br/>Não operamos vendendo dados, as regras dos bancos isolam o acesso criptograficamente apenas entre o UID seu e do outro pareado.</p>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-cookbook-border bg-cookbook-bg/80 backdrop-blur-md">
           <button 
             onClick={onClose}
             className="w-full bg-cookbook-primary text-white font-sans text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-transform hover:bg-cookbook-primary-hover active:scale-95 font-bold"
           >
             Fechar e Retornar
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
