import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../contexts/NotificationContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Acceder al contexto de notificaciones (si está disponible)
  let notifContext: any = null;
  try {
    notifContext = useNotifications();
  } catch (e) {
    notifContext = null;
  }

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
      return;
    }

    // Detectar si la app es instalable
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setInstallPrompt(event);
      // Mostrar notificación del navegador invitando a instalar (pedir permiso si hace falta)
      try {
        notifContext?.showBrowserNotification?.('Instalar Conferente', 'Toca para instalar la app en tu pantalla de inicio', '/icon-192.png');
      } catch (err) {
        // ignore
      }
      
      // Verificar si el usuario ya descartó antes
      const dismissedBefore = localStorage.getItem('installPromptDismissed');
      const dismissedTime = dismissedBefore ? parseInt(dismissedBefore, 10) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Mostrar después de 5 segundos si no fue descartado en los últimos 7 días
      if (!dismissedBefore || daysSinceDismissed > 7) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    };

    // Detectar cuando se instala
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('appInstalled', 'true');
      console.log('✅ App instalada exitosamente');
    });

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar si ya está instalada al cargar
    if (!checkInstalled()) {
      // Verificar si existe el evento de instalación en navegadores que no lo soportan bien
      const wasInstalled = localStorage.getItem('appInstalled');
      if (wasInstalled === 'true') {
        setIsInstalled(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Try to access context via hook; some component trees may not provide it at init
  const notifContext = (() => {
    try {
      return useNotifications();
    } catch (e) {
      return null;
    }
  })();

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
          notifContext?.showBrowserNotification?.('App instalada', 'Gracias por instalar Conferente', '/icon-192.png');
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

  // No mostrar si ya está instalada, descartada, o no hay prompt
  if (isInstalled || !showPrompt || dismissed || !installPrompt) {
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
