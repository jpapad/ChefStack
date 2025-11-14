import React, { useState } from 'react';
import { MenuPrintCustomizations, MenuStyle, MenuTemplate } from '../../types';
import { Icon } from '../common/Icon';

interface MenuPrintCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customizations: MenuPrintCustomizations) => void;
  defaultTitle: string;
}

const PRESET_STYLES: Record<MenuTemplate, MenuStyle> = {
    classic: {
        templateName: 'classic',
        colors: { primary: '#333333', secondary: '#666666', accent: '#000000', background: '#FFFFFF' },
        fonts: { heading: "'Playfair Display', serif", body: "'Source Sans Pro', sans-serif" }
    },
    modern: {
        templateName: 'modern',
        colors: { primary: '#2d3748', secondary: '#718096', accent: '#e53e3e', background: '#FFFFFF' },
        fonts: { heading: "'Oswald', sans-serif", body: "'Roboto', sans-serif" }
    },
    elegant: {
        templateName: 'elegant',
        colors: { primary: '#5d4037', secondary: '#8d6e63', accent: '#3e2723', background: '#f5f5f5' },
        fonts: { heading: "'Cormorant Garamond', serif", body: "'Lato', sans-serif" }
    }
};


const MenuPrintCustomizer: React.FC<MenuPrintCustomizerProps> = ({ isOpen, onClose, onConfirm, defaultTitle }) => {
  const [title, setTitle] = useState(defaultTitle);
  const [footerText, setFooterText] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<MenuStyle>(PRESET_STYLES.classic);

  const handleConfirm = () => {
    onConfirm({ title, footerText, logoUrl, style });
  };
  
  const handleTemplateChange = (templateName: MenuTemplate) => {
      setStyle(PRESET_STYLES[templateName]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">Προσαρμογή Εκτύπωσης Μενού</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
                <h4 className="font-semibold mb-2">Πρότυπο Εμφάνισης</h4>
                <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(PRESET_STYLES) as MenuTemplate[]).map(key => (
                        <button key={key} onClick={() => handleTemplateChange(key)} className={`p-2 rounded-lg font-semibold capitalize ${style.templateName === key ? 'bg-brand-dark text-white' : 'bg-black/5 dark:bg-white/10'}`}>
                            {key}
                        </button>
                    ))}
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Τίτλος Μενού</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">Κείμενο Υποσέλιδου</label>
              <input type="text" value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="π.χ. Οι τιμές περιλαμβάνουν ΦΠΑ" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Λογότυπο</label>
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setLogoUrl(URL.createObjectURL(e.target.files[0]))} className="text-sm w-full"/>
            </div>
          </div>
          <footer className="p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold">Άκυρο</button>
            <button type="button" onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold">Επιβεβαίωση</button>
          </footer>
      </div>
    </div>
  );
};

export default MenuPrintCustomizer;
