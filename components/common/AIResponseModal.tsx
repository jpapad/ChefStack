import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Icon } from './Icon';

interface AIResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
  showConfirmButton?: boolean;
  onConfirm?: (content: string) => void;
}

const AIResponseModal: React.FC<AIResponseModalProps> = ({ isOpen, onClose, title, content, isLoading, showConfirmButton, onConfirm }) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(content);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="sparkles" className="w-5 h-5 text-purple-500"/>
            {title}
          </DialogTitle>
          <DialogDescription>
            AI-generated response
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Icon name="loader-2" className="w-12 h-12 text-brand-yellow animate-spin"/>
              <p className="mt-4 text-muted-foreground">Το AI επεξεργάζεται το αίτημά σας...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                {content}
            </pre>
          )}
        </div>
        
        <DialogFooter>
             {showConfirmButton && !isLoading && (
                 <Button
                    type="button"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 gap-2"
                    onClick={handleConfirm}
                  >
                    <Icon name="check" className="w-4 h-4"/>
                    Εφαρμογή Αλλαγών
                  </Button>
             )}
             <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Κλείσιμο
              </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIResponseModal;