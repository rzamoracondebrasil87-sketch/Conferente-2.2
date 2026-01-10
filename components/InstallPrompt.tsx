import React, { useEffect, useState } from 'react';

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detectar si la app es instalable
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Mostrar el prompt después de 3 segundos
      if (!localStorage.getItem('installPromptDismissed')) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ App instalada exitosamente');
        setShowPrompt(false);
        localStorage.setItem('appInstalled', 'true');
      }
      
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || dismissed || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-10">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-2xl">
        <div className="max-w-md mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">📱 Instalar Conferente</h3>
              <p className="text-sm text-purple-100">
                Instala la app en tu pantalla de inicio para acceso rápido
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-purple-200 hover:text-white text-xl font-bold"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleInstall}
              className="flex-1 bg-white text-purple-700 font-bold py-2 px-4 rounded-lg hover:bg-purple-50 transition"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-purple-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition border border-purple-500"
            >
              Después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
