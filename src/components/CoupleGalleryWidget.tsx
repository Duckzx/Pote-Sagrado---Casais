import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useGallery } from "../hooks/useGallery";
import CircularGallery from "./CircularGallery";
import { AddMediaModal } from "./AddMediaModal";

export const CoupleGalleryWidget: React.FC<{ addToast: any }> = ({ addToast }) => {
  const { photos, addPhoto, addPhotoUrl } = useGallery();
  const [showAddModal, setShowAddModal] = useState(false);

  const galleryItems = photos.map((p) => ({ 
    image: p.imageUrl || p.imageBase64 || "", 
    text: "" 
  }));

  return (
    <div className="mb-8 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div />
        <h3 className="text-center font-sans tracking-widest uppercase text-xs font-bold text-cookbook-text/60">
          Nosso Álbum
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-8 h-8 rounded-full bg-cookbook-gold/10 flex items-center justify-center text-cookbook-gold hover:bg-cookbook-gold hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div style={{ height: "400px", position: "relative" }}>
        {galleryItems.length > 0 ? (
          <CircularGallery
            items={galleryItems}
            bend={3}
            textColor="#ffffff"
            borderRadius={0.05}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-cookbook-border/50 rounded-3xl">
            <p className="text-cookbook-text/40 font-sans text-xs uppercase tracking-widest text-center px-8">
              Adicione momentos ou links para inspirar a jornada de vocês
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
