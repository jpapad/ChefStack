import React, { useState } from 'react';
import { MenuPrintCustomizations, MenuStyle, MenuTemplate } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Προσαρμογή Εκτύπωσης Μενού</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
            <div>
                <h4 className="font-semibold mb-2">Πρότυπο Εμφάνισης</h4>
                <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(PRESET_STYLES) as MenuTemplate[]).map(key => (
                        <Button
                          key={key}
                          variant={style.templateName === key ? 'default' : 'outline'}
                          onClick={() => handleTemplateChange(key)}
                          className="capitalize"
                        >
                            {key}
                        </Button>
                    ))}
                </div>
            </div>
            <div>
              <Label className="mb-2">Τίτλος Μενού</Label>
              <Input type="text" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
             <div>
              <Label className="mb-2">Κείμενο Υποσέλιδου</Label>
              <Input type="text" value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="π.χ. Οι τιμές περιλαμβάνουν ΦΠΑ" />
            </div>
            <div>
                <Label className="mb-2">Λογότυπο</Label>
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setLogoUrl(URL.createObjectURL(e.target.files[0]))} className="text-sm w-full"/>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Άκυρο</Button>
            <Button type="button" onClick={handleConfirm}>Επιβεβαίωση</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuPrintCustomizer;
