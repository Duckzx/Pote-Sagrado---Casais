import React, { useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { compressImage } from "../lib/imageUtils";

interface AddMediaModalProps {
  onClose: () => void;
  onAddBase64: (base64: string) => Promise<void>;
  addToast: any;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({
  onClose,
  onAddBase64,
  addToast,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setIsLoading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await compressImage(file, 800, 0.6);
        await onAddBase64(base64);
      }
      addToast("Sucesso!", files.length > 1 ? "Fotos adicionadas ao álbum." : "Foto adicionada ao álbum.", "success");
      onClose();
    } catch (err) {
      console.error(err);
      addToast("Erro", "Falha ao processar imagem.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-cookbook-surface w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-cookbook-text/50 hover:text-cookbook-text">
          <X size={20} />
        </button>
        
        <h3 className="font-serif text-2xl text-cookbook-text mb-6 mt-2 text-center font-medium">Adicionar Memória</h3>
        
        <div className="space-y-4">
          <label className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-cookbook-border rounded-2xl hover:border-cookbook-primary/50 hover:bg-cookbook-primary/5 transition-colors group ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
            {isLoading ? (
              <Loader2 size={32} className="text-cookbook-primary mb-2 animate-spin" />
            ) : (
              <UploadCloud size={32} className="text-cookbook-primary mb-2 group-hover:scale-110 transition-transform" />
            )}
            <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold">
              {isLoading ? "Enviando..." : "Selecionar Fotos"}
            </span>
            <span className="font-sans text-[10px] text-cookbook-text/40 mt-1">
              .jpg, .png (várias suportadas)
            </span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleFiles} 
              disabled={isLoading} 
            />
          </label>
        </div>
      </div>
    </div>
  );
};
