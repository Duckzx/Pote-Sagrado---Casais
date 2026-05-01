import { useState, useEffect, useCallback } from 'react';

interface UsePWAInstallResult {
  canInstall: boolean;
  installPrompt: any | null;
  clearInstallPrompt: () => void;
  promptInstall: () => Promise<boolean>;
}

export function usePWAInstall(): UsePWAInstallResult {
  const [installPrompt, setInstallPrompt] = useState<any | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const clearInstallPrompt = useCallback(() => {
    setInstallPrompt(null);
    setCanInstall(false);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      clearInstallPrompt();
      return true;
    }
    
    return false;
  }, [installPrompt, clearInstallPrompt]);

  return {
    canInstall,
    installPrompt,
    clearInstallPrompt,
    promptInstall
  };
}
