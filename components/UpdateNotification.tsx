import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface UpdateInfo {
  version: string;
  message: string;
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si el service worker está soportado
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Obtener el registro del service worker
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      
      setRegistration(reg);

      // Escuchar mensajes del service worker sobre actualizaciones
      const handleSWMessage = (event: any) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          const version = event.data.version || 'nueva';
          const message = event.data.message || 'Nueva versión disponible';
          setUpdateInfo({ version, message });

          const dismissedVersion = localStorage.getItem('updateDismissed');
          if (dismissedVersion !== version) {
            setUpdateAvailable(true);
            setDismissed(false);
            // Mostrar notificación del navegador
            try {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Actualización disponible', {
                  body: message,
                  icon: '/icon-192.png',
                  tag: 'conferente-update'
                });
              }
            } catch (err) {
              console.warn('Error showing notification:', err);
            }
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleSWMessage);

      // Verificar actualizaciones periódicamente (cada 30 minutos)
      const checkInterval = setInterval(() => {
        reg.update().catch(() => {
          // Ignorar errores silenciosamente
        });
      }, 30 * 60 * 1000);

      // Verificar actualización al cargar
      reg.update().catch(() => {
        // Ignorar errores silenciosamente
      });

      // Detectar cuando el service worker está listo para actualizar
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión esperando
              setUpdateInfo({
                version: 'nueva',
                message: 'Nueva versión disponible. Actualiza para obtener las últimas mejoras.'
              });
              
              const dismissedVersion = localStorage.getItem('updateDismissed');
              if (dismissedVersion !== 'nueva') {
                setUpdateAvailable(true);
                setDismissed(false);
                try {
                   if ('Notification' in window && Notification.permission === 'granted') {
                     new Notification('Actualización disponible', {
                       body: 'Nueva versión lista para instalar',
                       icon: '/icon-192.png',
                       tag: 'conferente-update'
                     });
                   }
                 } catch (err) {
                   console.warn('Error showing notification:', err);
                }
              }
            }
          });
        }
      });

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      };

      return () => {
        clearInterval(checkInterval);
      };
    });
  }, []);

  const handleUpdate = async () => {
    if (!registration) return;

    try {
      // Enviar mensaje al service worker para activar
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Recargar la página para aplicar la actualización
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar:', error);
      // Si falla, simplemente recargar
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    setDismissed(true);
    if (updateInfo?.version) {
      localStorage.setItem('updateDismissed', updateInfo.version);
    }
  };

  // No mostrar si está descartada o no hay actualización
  if (!updateAvailable || dismissed || !updateInfo) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 left-4 right-4 z-[10000] max-w-md mx-auto pointer-events-none">
      <div className="bg-gradient-to-br from-orange-600 to-orange-700 border border-orange-500/30 rounded-[2rem] shadow-2xl p-5 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300">
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <span className="material-symbols-rounded text-white text-3xl">system_update</span>
            </div>
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white mb-1 font-display">
              Actualización Disponible
            </h3>
            <p className="text-xs text-white/90 leading-relaxed mb-4">
              {updateInfo.message}
            </p>
            
            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-white text-orange-700 py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-orange-50 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded text-lg">refresh</span>
                Actualizar Ahora
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white/20 text-white py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Después"
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
