import React from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-brand-yellow text-brand-dark w-16 h-16 rounded-full shadow-2xl flex items-center justify-center lift-on-hover z-40"
      aria-label={t('fab_scan_qr')}
      title={t('fab_scan_qr')}
    >
      <Icon name="qr-code" className="w-8 h-8" />
    </button>
  );
};

export default FloatingActionButton;
