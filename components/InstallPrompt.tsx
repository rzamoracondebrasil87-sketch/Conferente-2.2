import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true;
      if (isStandalone) {
        console.log('✅ App is already installed (standalone mode)');
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Si ya está instalada, no mostrar nada
    if (checkInstalled()) {
      return;
    }

    console.log('📱 InstallPrompt: Waiting for beforeinstallprompt event...');

    // Escuchar el evento personalizado de index.html
    const handlePwaInstallable = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('✅ InstallPrompt: PWA is installable!');
      const prompt = customEvent.detail?.prompt;
      if (prompt) {
        setDeferredPrompt(prompt);
        // Mostrar después de 2 segundos
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
    };

    // Escuchar el evento de instalación exitosa
    const handlePwaInstalled = () => {
      console.log('✅ InstallPrompt: App installed successfully!');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('appInstalled', 'true');
      
      // Mostrar notificación
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Conferente', {
          body: '¡App instalada correctamente!',
          icon: '/icon-192.png'
        });
      }
    };

    window.addEventListener('pwa-installable', handlePwaInstallable);
    window.addEventListener('pwa-installed', handlePwaInstalled);

    // Verificar si ya fue instalada antes
    const wasInstalled = localStorage.getItem('appInstalled');
    if (wasInstalled === 'true') {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('pwa-installable', handlePwaInstallable);
      window.removeEventListener('pwa-installed', handlePwaInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.error('InstallPrompt: deferredPrompt is not available');
      return;
    }

    try {
      console.log('📱 InstallPrompt: Showing install prompt...');
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ InstallPrompt: User accepted installation');
        setIsInstalled(true);
        setShowPrompt(false);
        localStorage.setItem('appInstalled', 'true');
        
        // Mostrar notificación
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Conferente', {
            body: '¡App instalada correctamente!',
            icon: '/icon-192.png'
          });
        }
      } else {
        console.log('❌ InstallPrompt: User dismissed installation');
        handleDismiss();
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('InstallPrompt error:', error);
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    console.log('📱 InstallPrompt: Dismissing prompt');
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // No mostrar si está instalada, descartada, o no hay prompt disponible
  if (isInstalled || dismissed || !showPrompt || !deferredPrompt) {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-4 left-4 right-4 z-[10000] max-w-md mx-auto pointer-events-none">
      <div className="bg-[#1e1626] border border-white/10 rounded-[2rem] shadow-2xl p-5 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#9e4bf6] flex items-center justify-center shadow-lg">
              <span className="material-symbols-rounded text-white text-3xl">download</span>
            </div>
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white mb-1 font-display">
              Instalar Conferente
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Instala la app en tu pantalla de inicio para acceso rápido y trabajo offline
            </p>
            
            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-primary text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded text-lg">install_mobile</span>
                Instalar Ahora
              </button>
              <button
                onClick={handleDismiss}
                className="bg-surface-container-high text-on-surface py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center"
                aria-label="Cerrar"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
