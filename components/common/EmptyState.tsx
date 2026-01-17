import React from 'react';
import { Icon, IconName } from './Icon';
import { useTranslation } from '../../i18n';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  illustration?: 'recipes' | 'inventory' | 'tasks' | 'messages' | 'reports';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  illustration,
  className = ''
}) => {
  const { t } = useTranslation();

  const illustrations = {
    recipes: (
      <svg className="w-32 h-32 opacity-20" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.1" />
        <path d="M35 30h30v40H35z" fill="currentColor" opacity="0.2" />
        <rect x="40" y="35" width="20" height="3" fill="currentColor" opacity="0.3" />
        <rect x="40" y="42" width="15" height="2" fill="currentColor" opacity="0.3" />
        <rect x="40" y="48" width="18" height="2" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    inventory: (
      <svg className="w-32 h-32 opacity-20" viewBox="0 0 100 100" fill="none">
        <rect x="25" y="30" width="50" height="45" rx="4" fill="currentColor" opacity="0.1" />
        <rect x="30" y="40" width="40" height="8" fill="currentColor" opacity="0.2" />
        <rect x="30" y="52" width="40" height="8" fill="currentColor" opacity="0.2" />
        <rect x="30" y="64" width="40" height="8" fill="currentColor" opacity="0.2" />
      </svg>
    ),
    tasks: (
      <svg className="w-32 h-32 opacity-20" viewBox="0 0 100 100" fill="none">
        <circle cx="35" cy="35" r="4" fill="currentColor" opacity="0.2" />
        <rect x="43" y="32" width="25" height="2" fill="currentColor" opacity="0.3" />
        <circle cx="35" cy="50" r="4" fill="currentColor" opacity="0.2" />
        <rect x="43" y="47" width="25" height="2" fill="currentColor" opacity="0.3" />
        <circle cx="35" cy="65" r="4" fill="currentColor" opacity="0.2" />
        <rect x="43" y="62" width="25" height="2" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    messages: (
      <svg className="w-32 h-32 opacity-20" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="30" width="60" height="40" rx="8" fill="currentColor" opacity="0.1" />
        <path d="M50 50L25 35h50L50 50z" fill="currentColor" opacity="0.2" />
      </svg>
    ),
    reports: (
      <svg className="w-32 h-32 opacity-20" viewBox="0 0 100 100" fill="none">
        <rect x="30" y="60" width="10" height="20" fill="currentColor" opacity="0.2" />
        <rect x="45" y="45" width="10" height="35" fill="currentColor" opacity="0.2" />
        <rect x="60" y="30" width="10" height="50" fill="currentColor" opacity="0.2" />
      </svg>
    )
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Icon container with decorative elements */}
      <div className="relative mb-8">
        {/* Main icon circle */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-brand-yellow/20 to-amber-500/20 flex items-center justify-center shadow-lg">
          <Icon name={icon} className="w-12 h-12 text-brand-yellow" />
        </div>

        {/* Animated rings */}
        <div className="absolute inset-0 -z-10 animate-ping-slow">
          <div className="w-24 h-24 rounded-full border-2 border-brand-yellow/30" />
        </div>
        <div className="absolute inset-0 -z-20 animate-ping-slow" style={{ animationDelay: '1s' }}>
          <div className="w-24 h-24 rounded-full border-2 border-brand-yellow/20" />
        </div>

        {/* Illustration background */}
        {illustration && (
          <div className="absolute -top-8 -left-8 -z-30 text-gray-300 dark:text-gray-700">
            {illustrations[illustration]}
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-balance">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed text-balance">
        {description}
      </p>

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-yellow text-dark-bg rounded-xl font-semibold hover:opacity-90 transition-all scale-hover shadow-lg hover:shadow-xl"
        >
          {action.icon && <Icon name={action.icon} className="w-5 h-5" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

// Preset empty states for common scenarios
export const NoRecipesEmptyState: React.FC<{ onAddRecipe: () => void }> = ({ onAddRecipe }) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon="book-open"
      title="Δεν υπάρχουν συνταγές"
      description="Ξεκινήστε δημιουργώντας την πρώτη σας συνταγή. Οργανώστε τα υλικά, τις οδηγίες και τις πληροφορίες θρέψης."
      illustration="recipes"
      action={{
        label: t('add_recipe') || 'Προσθήκη Συνταγής',
        onClick: onAddRecipe,
        icon: 'plus'
      }}
    />
  );
};

export const NoInventoryEmptyState: React.FC<{ onAddItem: () => void }> = ({ onAddItem }) => (
  <EmptyState
    icon="package"
    title="Κενό απόθεμα"
    description="Προσθέστε προϊόντα στο απόθεμά σας για να παρακολουθείτε τις ποσότητες και να διαχειρίζεστε τις παραγγελίες."
    illustration="inventory"
    action={{
      label: 'Προσθήκη Προϊόντος',
      onClick: onAddItem,
      icon: 'plus'
    }}
  />
);

export const NoTasksEmptyState: React.FC = () => (
  <EmptyState
    icon="clipboard-check"
    title="Όλα ολοκληρώθηκαν!"
    description="Δεν υπάρχουν εκκρεμείς εργασίες. Συνεχίστε την εξαιρετική δουλειά!"
    illustration="tasks"
  />
);

export const NoMessagesEmptyState: React.FC = () => (
  <EmptyState
    icon="send"
    title="Κανένα μήνυμα"
    description="Ξεκινήστε μια συνομιλία με την ομάδα σας για να συντονίσετε καλύτερα."
    illustration="messages"
  />
);

export const NoResultsEmptyState: React.FC<{ searchTerm: string; onClear: () => void }> = ({ 
  searchTerm, 
  onClear 
}) => (
  <EmptyState
    icon="search"
    title="Δεν βρέθηκαν αποτελέσματα"
    description={`Δεν υπάρχουν αποτελέσματα για "${searchTerm}". Δοκιμάστε διαφορετικούς όρους αναζήτησης.`}
    action={{
      label: 'Καθαρισμός Αναζήτησης',
      onClick: onClear,
      icon: 'x'
    }}
  />
);

export const ErrorEmptyState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon="alert-circle"
    title="Κάτι πήγε στραβά"
    description="Δεν μπορέσαμε να φορτώσουμε τα δεδομένα. Παρακαλώ δοκιμάστε ξανά."
    action={{
      label: 'Δοκιμή Ξανά',
      onClick: onRetry,
      icon: 'history'
    }}
  />
);
