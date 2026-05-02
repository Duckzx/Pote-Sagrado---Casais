import React, { useState } from "react";
import { Link, UploadCloud, X } from "lucide-react";
import { compressImage } from "../lib/imageUtils";

interface AddMediaModalProps {
  onClose: () => void;
  onAddBase64: (base64: string) => Promise<void>;
  onAddLink: (url: string) => Promise<void>;
  addToast: any;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({
  onClose,
  onAddBase64,
  onAddLink,
  addToast,
}) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const base64 = await compressImage(file, 800, 0.6);
      await onAddBase64(base64);
      addToast("Sucesso!", "Foto adicionada ao álbum.", "success");
      onClose();
    } catch (err) {
      console.error(err);
      addToast("Erro", "Falha ao processar a imagem.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      setIsLoading(true);
      // We'll generate a screenshot of the URL through a free service
      // Or just save the URL if the user prefers, but for CircularGallery we need an image.
      // So we will format the link as a screenshot URL.
      const screenshotUrl = `https://image.thum.io/get/width/600/crop/800/${url}`;
      
      // Let's proxy to base64 or just save the URL?
      // Since our schema uses imageBase64, we can fetch it and convert to base64
      // OR we update schema to support `imageUrl`.
      await onAddLink(url);
      addToast("Sucesso!", "Link integrado ao mural.", "success");
      onClose();
    } catch (err) {
      console.error(err);
      addToast("Erro", "Falha ao integrar o link.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-cookbook-surface w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-cookbook-text/50 hover:text-cookbook-text">
          <X size={20} />
        </button>
        
        <h3 className="font-serif text-2xl text-cookbook-text mb-6 mt-2 text-center font-medium">Adicionar Memória</h3>
        
        <div className="space-y-4">
          <label className="relative flex flex-col items-center justify-center h-32 border-2 border-dashed border-cookbook-border rounded-2xl hover:border-cookbook-primary/50 hover:bg-cookbook-primary/5 transition-colors cursor-pointer group">
            <UploadCloud size={32} className="text-cookbook-primary mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold">Fazer Upload</span>
            <span className="font-sans text-[10px] text-cookbook-text/40 mt-1">.jpg, .png até 5MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={isLoading} />
          </label>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-cookbook-border" />
            <span className="flex-shrink-0 mx-4 font-sans text-xs uppercase tracking-widest text-cookbook-text/40">OU</span>
            <div className="flex-grow border-t border-cookbook-border" />
          </div>

          <form onSubmit={handleLinkSubmit} className="space-y-3">
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-2">
                Conectar Link (Álbum/Rede Social)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link size={16} className="text-cookbook-text/40" />
                </div>
                <input
                  type="url"
                  placeholder="Cole o link do Google Photos, Insta..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded-xl py-3 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-cookbook-primary transition-colors text-cookbook-text"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full py-3 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {isLoading ? "Processando..." : "Integrar Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
