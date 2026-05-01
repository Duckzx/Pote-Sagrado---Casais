import React, { useRef } from "react";
import { Plus } from "lucide-react";
import { useGallery } from "../hooks/useGallery";
import CircularGallery from "./CircularGallery";
import { compressImage } from "../lib/imageUtils";

export const CoupleGalleryWidget: React.FC<{ addToast: any }> = ({ addToast }) => {
  const { photos, addPhoto } = useGallery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImage(file, 800, 0.6);
      await addPhoto(base64);
      addToast("Sucesso!", "Foto adicionada ao álbum com sucesso.", "success");
    } catch (err) {
      console.error("Error compressing/uploading image:", err);
      addToast("Erro", "Não foi possível adicionar a foto.", "error");
    }
  };

  const galleryItems = photos.map((p) => ({ image: p.imageBase64, text: "" }));

  return (
    <div className="mb-8 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div />
        <h3 className="text-center font-sans tracking-widest uppercase text-xs font-bold text-cookbook-text/60">
          Nosso Álbum
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 rounded-full bg-cookbook-gold/10 flex items-center justify-center text-cookbook-gold hover:bg-cookbook-gold hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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
              Adicione momentos para inspirar a jornada de vocês
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
