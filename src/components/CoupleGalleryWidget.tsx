import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useGallery } from "../hooks/useGallery";
import { AddMediaModal } from "./AddMediaModal";

export const CoupleGalleryWidget: React.FC<{ addToast: any }> = ({ addToast }) => {
  const { photos, addPhoto, addPhotoUrl, removePhoto } = useGallery();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="mb-4 relative z-10 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans tracking-widest uppercase text-[10px] font-bold text-cookbook-text/40">
          Nosso Álbum
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-8 h-8 rounded-full bg-cookbook-gold/10 flex items-center justify-center text-cookbook-gold hover:bg-cookbook-gold hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="relative">
        {photos.length > 0 ? (
          <div className="flex overflow-x-auto gap-3 pb-4 pt-1 snap-x snap-mandatory hide-scrollbar px-1">
            {photos.map((p) => (
              <div key={p.id} className="relative shrink-0 w-56 h-72 rounded-3xl overflow-hidden snap-center group shadow-md border border-cookbook-border/20 bg-cookbook-bg">
                <img 
                  src={p.imageUrl || p.imageBase64 || ""} 
                  alt="Momento" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md hover:bg-red-500/80"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 border border-dashed border-cookbook-border/50 rounded-3xl">
            <p className="text-cookbook-text/40 font-sans text-[10px] uppercase tracking-widest text-center px-8">
              Adicione fotos para inspirar a jornada de vocês
            </p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMediaModal
          onClose={() => setShowAddModal(false)}
          onAddBase64={addPhoto}
          onAddLink={async (url) => {
            const isImage = url.match(/\.(jpeg|jpg|gif|png)$/) != null;
            if (isImage) {
              await addPhotoUrl(url);
            } else {
              const thumUrl = `https://image.thum.io/get/width/600/crop/800/${url}`;
              await addPhotoUrl(thumUrl);
            }
          }}
          addToast={addToast}
        />
      )}
    </div>
  );
};
