import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Event interface for beforeinstallprompt
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * InstallPrompt Component
 *
 * Manages PWA installation prompts.
 * Listens for beforeinstallprompt events and displays a native install prompt.
 * Handles user choices and prevents duplicate prompts.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  /**
   * Check if app is already installed in standalone mode
   */
  const checkIfInstalled = useCallback(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    return isStandalone;
  }, []);

  /**
   * Handle install button click
   */
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.error('❌ InstallPrompt: deferredPrompt is not available');
      return;
    }

    try {
      console.log('📱 InstallPrompt: Showing native install prompt...');
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ InstallPrompt: User accepted installation');
        setIsInstalled(true);
        setShowPrompt(false);
        localStorage.setItem('appInstalled', 'true');
        localStorage.removeItem('installPromptDismissed');

        // Send success event
        window.dispatchEvent(
          new CustomEvent('pwa-install-success', {
            detail: { timestamp: Date.now() }
          })
        );

        // Try to show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Conferente', {
              title: 'Conferente',
              body: '✅ App instalada com sucesso!',
              icon: '/icon-192.png',
              badge: '/icon-96.png'
            });
          } catch (err) {
            console.warn('Failed to show notification:', err);
          }
        }
      } else {
        console.log('❌ InstallPrompt: User dismissed installation');
        handleDismiss();
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ InstallPrompt error:', error);
      handleDismiss();
    }
  }, [deferredPrompt]);

  /**
   * Handle dismiss button click
   */
  const handleDismiss = useCallback(() => {
    console.log('📱 InstallPrompt: User dismissed prompt');
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  }, []);

  /**
   * Initialize listeners for beforeinstallprompt and custom events
   */
  useEffect(() => {
    // Check if already installed
    if (checkIfInstalled()) {
      console.log('✅ InstallPrompt: App is already installed (standalone mode)');
      setIsInstalled(true);
      return;
    }

    // Check if dismissed in localStorage
    const dismissedTime = localStorage.getItem('installPromptDismissed');
    if (dismissedTime) {
      const dismissedAt = parseInt(dismissedTime, 10);
      const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        // Don't show if dismissed less than a week ago
        setIsDismissed(true);
      }
    }

    /**
     * Listen for custom pwa-installable event from index.html
     * This event carries the beforeinstallprompt that index.html captures
     */
    const handlePwaInstallable = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('✅ InstallPrompt: PWA is installable!');

      const prompt = customEvent.detail?.prompt;
      if (prompt && typeof prompt === 'function') {
        setDeferredPrompt(prompt as unknown as BeforeInstallPromptEvent);
        // Show prompt after short delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 1500);
      }
    };

    /**
     * Listen for manual install success event
     */
    const handlePwaInstalled = () => {
      console.log('✅ InstallPrompt: PWA installed successfully!');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('appInstalled', 'true');
    };

    // Check if was previously installed
    if (localStorage.getItem('appInstalled') === 'true') {
      setIsInstalled(true);
    }

    // Register event listeners
    window.addEventListener('pwa-installable', handlePwaInstallable);
    window.addEventListener('pwa-installed', handlePwaInstalled);

    // Direct beforeinstallprompt handler (fallback)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 beforeinstallprompt event received');
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);

      setTimeout(() => {
        if (!isDismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('pwa-installable', handlePwaInstallable);
      window.removeEventListener('pwa-installed', handlePwaInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [checkIfInstalled, isDismissed, isInstalled]);

  // Don't render if:
  // - App is already installed
  // - User dismissed the prompt recently
  // - We don't have a deferred prompt
  // - We shouldn't show it yet
  if (isInstalled || isDismissed || !showPrompt || !deferredPrompt) {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-4 left-4 right-4 z-[10000] max-w-md mx-auto pointer-events-none">
      <div className="bg-surface rounded-[2rem] border border-outline-variant/20 shadow-2xl p-5 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#9e4bf6] flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-rounded text-white text-3xl">
                download
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-on-surface mb-1 font-display">
              Instalar Conferente
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Instale a app na tela inicial para acesso rápido e funcionamento offline
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-primary text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                aria-label="Instalar app agora"
              >
                <span className="material-symbols-rounded text-lg">install_mobile</span>
                <span className="hidden sm:inline">Instalar</span>
              </button>
              <button
                onClick={handleDismiss}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center active:scale-95"
                aria-label="Descartar"
                title="Descartar por 7 dias"
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
