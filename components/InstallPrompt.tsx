import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      // Para iOS
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) {
      console.log('✅ App ya está instalada (standalone)');
      return;
    }

    // Detectar si la app es instalable
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📲 Evento beforeinstallprompt detectado');
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setInstallPrompt(event);
      
      // Verificar si el usuario ya descartó antes
      const dismissedBefore = localStorage.getItem('installPromptDismissed');
      const dismissedTime = dismissedBefore ? parseInt(dismissedBefore, 10) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Mostrar después de 2 segundos si no fue descartado en los últimos 7 días
      if (!dismissedBefore || daysSinceDismissed > 7) {
        setTimeout(() => {
          setShowPrompt(true);
          console.log('✅ Mostrando prompt de instalación');
        }, 2000);
      }
    };

    // Detectar cuando se instala
    const handleAppInstalled = () => {
      console.log('✅ App instalada exitosamente');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('appInstalled', 'true');
      // Mostrar notificación de éxito
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Conferente instalado', {
          body: 'La app está lista para usar',
          icon: '/icon-192.png'
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar si ya está instalada al cargar
    if (!checkInstalled()) {
      const wasInstalled = localStorage.getItem('appInstalled');
      if (wasInstalled === 'true') {
        setIsInstalled(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ Usuario aceptó instalar la app');
          setIsInstalled(true);
          setShowPrompt(false);
          localStorage.setItem('appInstalled', 'true');
          // Mostrar notificación de éxito
          try {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Conferente instalado', {
                body: 'La app está lista para usar',
                icon: '/icon-192.png'
              });
            }
          } catch (err) {
            console.warn('Error showing notification:', err);
          }
        } else {
          console.log('❌ Usuario rechazó instalar la app');
          handleDismiss();
        }
      } catch (error) {
        console.error('Error al instalar:', error);
        handleDismiss();
      }
      
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // No mostrar si ya está instalada o descartada
  if (isInstalled || dismissed) {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-4 left-4 right-4 z-[10000] max-w-md mx-auto pointer-events-none">
      {/* Mostrar botón flotante si se tiene el prompt o como fallback */}
      {(showPrompt || installPrompt) && (
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
      )}
    </div>,
    document.body
  );
}
