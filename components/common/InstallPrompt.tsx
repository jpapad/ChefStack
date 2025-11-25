import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show install prompt after a delay (better UX)
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  // iOS install instructions
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 z-50 animate-slide-up">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        >
          <Icon name="x" className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-yellow rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="smartphone" className="w-6 h-6 text-brand-dark" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">{t('install_app_ios_title')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {t('install_app_ios_description')}
            </p>
            <ol className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Πάτα το κουμπί <Icon name="share" className="w-4 h-4 inline" /> (Share)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Επίλεξε "Add to Home Screen"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Πάτα "Add"</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop install prompt
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 z-50 animate-slide-up">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        >
          <Icon name="x" className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-yellow rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="download" className="w-6 h-6 text-brand-dark" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">{t('install_app_title')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {t('install_app_description')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-brand-yellow text-brand-dark font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                {t('install_now')}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
              >
                {t('maybe_later')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
