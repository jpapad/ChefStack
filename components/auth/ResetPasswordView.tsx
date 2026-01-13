import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { chefStackLogo } from '../../assets';
import { api } from '../../services/api';

interface ResetPasswordViewProps {
  onComplete: () => void;
}

const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);  // Start loading while checking session
  const [sessionReady, setSessionReady] = useState(false);
  const { t } = useTranslation();

  // Wait for Supabase to process the recovery hash and establish the session
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        // Give Supabase a moment to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session }, error: sessionError } = await api.getSession();
        
        if (sessionError || !session) {
          console.error('❌ No active recovery session:', sessionError);
          setError('Ο σύνδεσμος επαναφοράς κωδικού δεν είναι έγκυρος ή έχει λήξει. Παρακαλώ ζητήστε νέο σύνδεσμο.');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ Recovery session established successfully');
        setSessionReady(true);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error checking recovery session:', err);
        setError('Σφάλμα κατά τον έλεγχο της συνεδρίας. Παρακαλώ δοκιμάστε ξανά.');
        setIsLoading(false);
      }
    };

    checkRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Attempting to update password...');
      await api.updatePassword(newPassword);
      console.log('✅ Password updated successfully');
      setSuccess('Ο κωδικός ενημερώθηκε επιτυχώς! Μεταφορά στη σελίδα σύνδεσης...');
      
      // Clear the hash from URL
      window.location.hash = '';
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);
  // Show loading state while checking session
  if (isLoading && !sessionReady) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Icon name="loader-2" className="w-12 h-12 animate-spin text-brand-yellow mx-auto mb-4" />
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Επαλήθευση συνδέσμου επαναφοράς...
          </p>
        </div>
      </div>
    );
  }

  // Show error if session couldn't be established
  if (!sessionReady && error) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-24 h-24 mb-4 inline-block"
              dangerouslySetInnerHTML={{ __html: chefStackLogo }}
            />
            <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Επαναφορά Κωδικού
            </h1>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-8 rounded-2xl shadow-xl">
            <p className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm font-semibold p-3 rounded-lg mb-6 text-center">
              {error}
            </p>
            <button
              onClick={() => {
                window.location.hash = '';
                onComplete();
              }}
              className="w-full px-4 py-3 rounded-lg bg-brand-dark text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Επιστροφή στη σύνδεση
            </button>
          </div>
        </div>
      </div>
    );
  }

    } catch (err: any) {
      console.error('❌ Password update failed:', err);
      setError(err.message || 'Αποτυχία ενημέρωσης κωδικού. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-24 h-24 mb-4 inline-block"
            dangerouslySetInnerHTML={{ __html: chefStackLogo }}
          />
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Επαναφορά Κωδικού
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
            Εισάγετε τον νέο σας κωδικό πρόσβασης.
          </p>
        </div>
        
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit}>
            {error && (
              <p className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm font-semibold p-3 rounded-lg mb-6 text-center">
                {error}
              </p>
            )}
            {success && (
              <p className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 text-sm font-semibold p-3 rounded-lg mb-6 text-center">
                {success}
              </p>
            )}
            
            <div className="space-y-6">
              <div>
                <label 
                  htmlFor="newPassword" 
                  className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                >
                  Νέος Κωδικός
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:shadow-aura-yellow"
                />
              </div>
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                >
                  Επιβεβαίωση Κωδικού
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:shadow-aura-yellow"
                />
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading || !!success}
                className="w-full flex justify-center items-center px-4 py-3 rounded-lg bg-brand-dark text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 lift-on-hover"
              >
                {isLoading && <Icon name="loader-2" className="w-5 h-5 animate-spin mr-2" />}
                Ενημέρωση Κωδικού
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordView;
