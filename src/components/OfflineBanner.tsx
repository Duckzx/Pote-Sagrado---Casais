import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

/**
 * Displays a subtle banner when the user goes offline.
 * Automatically hides when connectivity is restored.
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 py-2 px-4 bg-amber-600 text-white text-xs font-sans font-medium shadow-lg animate-slide-down">
      <WifiOff size={14} />
      <span>Você está offline — as alterações serão sincronizadas ao voltar.</span>
    </div>
  );
};
