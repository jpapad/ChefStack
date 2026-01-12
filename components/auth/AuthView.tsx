import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { chefStackLogo } from '../../assets';

interface AuthViewProps {
  onAuthSuccess: (email: string, pass: string) => boolean;
  onSignUp: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  onResetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onSignUp, onResetPassword }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Simulate API call
    setTimeout(() => {
      const success = onAuthSuccess(email, password);
      if (!success) {
        setError(t('auth_error_credentials'));
      }
      setIsLoading(false);
    }, 500);
  };
  
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const result = await onSignUp(name, email, password);
    if (!result.success) {
        setError(result.message);
    }
    // On success, App.tsx will handle the state change and this component will unmount
    setIsLoading(false);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const result = await onResetPassword(email);
    if (result.success) {
      setSuccess(result.message);
      setEmail('');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div
              className="w-24 h-24 mb-4 inline-block"
              dangerouslySetInnerHTML={{ __html: chefStackLogo }}
            />
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">{t('auth_welcome')}</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
            {isForgotPassword ? t('auth_reset_prompt') : (isLoginView ? t('auth_login_prompt') : t('signup_prompt'))}
          </p>
        </div>
        
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-8 rounded-2xl shadow-xl">
          <form onSubmit={isForgotPassword ? handleResetPasswordSubmit : (isLoginView ? handleLoginSubmit : handleSignUpSubmit)}>
            {error && <p className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm font-semibold p-3 rounded-lg mb-6 text-center">{error}</p>}
            {success && <p className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 text-sm font-semibold p-3 rounded-lg mb-6 text-center">{success}</p>}
            
            <div className="space-y-6">
              {!isLoginView && !isForgotPassword && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{t('signup_name_label')}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:shadow-aura-yellow"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{t('auth_email_label')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:shadow-aura-yellow"
                />
              </div>
              {!isForgotPassword && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{t('auth_password_label')}</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLoginView ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:shadow-aura-yellow"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-3 rounded-lg bg-brand-dark text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 lift-on-hover"
              >
                {isLoading && <Icon name="loader-2" className="w-5 h-5 animate-spin mr-2" />}
                {isForgotPassword ? t('auth_reset_button') : (isLoginView ? t('auth_login_button') : t('signup_button'))}
              </button>
            </div>
          </form>
        </div>

        {isLoginView && !isForgotPassword && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsForgotPassword(true);
                setError('');
                setSuccess('');
              }}
              className="text-sm text-brand-yellow hover:underline"
            >
              {t('auth_forgot_password')}
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setIsLoginView(true);
                setError('');
                setSuccess('');
              }}
              className="font-semibold text-brand-yellow hover:underline"
            >
              {t('auth_back_to_login')}
            </button>
          ) : (
            <>
              {isLoginView ? t('auth_no_account') : t('auth_has_account')}{' '}
              <button
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setError('');
                  setSuccess('');
                }}
                className="font-semibold text-brand-yellow hover:underline"
              >
                {isLoginView ? t('auth_signup_link') : t('auth_login_link')}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthView;