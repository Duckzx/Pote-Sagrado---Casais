import React from "react";
import { Image, ExternalLink } from "lucide-react";

interface SharedAlbumWidgetProps {
  url: string;
}

export const SharedAlbumWidget: React.FC<SharedAlbumWidgetProps> = ({ url }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative overflow-hidden rounded-3xl bg-cookbook-bg/80 backdrop-blur-md border border-cookbook-border shadow-sm group active:scale-[0.98] transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cookbook-primary/5 to-cookbook-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cookbook-surface rounded-2xl shadow-inner border border-cookbook-border/50 text-cookbook-primary">
            <Image size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-cookbook-text font-medium leading-tight">
              Álbum do Casal
            </h3>
            <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 mt-1">
              Ver recordações
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-cookbook-gold/10 flex items-center justify-center text-cookbook-gold group-hover:bg-cookbook-gold group-hover:text-white transition-colors">
          <ExternalLink size={18} />
        </div>
      </div>
    </a>
  );
};
