// components/common/AIImageModal.tsx
import React, { useEffect, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icon } from './Icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface BaseImageForEditing {
  data: string;      // καθαρό base64, χωρίς "data:image/..,"
  mimeType: string;  // π.χ. "image/png"
}

interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (base64Image: string) => void; // ΜΟΝΟ το base64, χωρίς header
  initialPrompt?: string;
  baseImage?: BaseImageForEditing | null;
}

const AIImageModal: React.FC<AIImageModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialPrompt,
  baseImage,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Όταν ανοίγει το modal, φρεσκάρουμε το prompt
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt || '');
      setError(null);
      setPreview(null);
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Πληκτρολόγησε μια περιγραφή για την εικόνα.');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
      setError(
        'Σφάλμα ρυθμίσεων: Δεν βρέθηκε το VITE_GEMINI_API_KEY στο .env. ' +
          'Πρόσθεσε το κλειδί σου και κάνε restart το dev server.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Για αρχή κάνουμε μόνο text→image.
      // Αν αργότερα θέλεις πραγματικό "edit" πάνω σε baseImage,
      // το επεκτείνουμε να στέλνει και την εικόνα σαν input.
      const response = await ai.models.generateImages({
        // από το list που έβγαλες: π.χ. "models/imagen-4.0-generate-001"
        model: 'models/imagen-4.0-generate-001',
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
        },
      });

      const img = response.generatedImages?.[0]?.image;
      const imageBytes = img?.imageBytes;

      if (!imageBytes) {
        throw new Error('Το AI δεν επέστρεψε δεδομένα εικόνας.');
      }

      // Δημιουργούμε data URL για προεπισκόπηση
      const dataUrl = `data:image/png;base64,${imageBytes}`;
      setPreview(dataUrl);

      // Επιστρέφουμε ΜΟΝΟ το καθαρό base64, όπως περιμένει το RecipeForm
      onConfirm(imageBytes);
      // αν ΘΕΛΕΙΣ πρώτα προεπισκόπηση και μετά confirm με κουμπί,
      // μπορείς να ΜΗΝ καλέσεις εδώ onConfirm και να βάλεις extra κουμπί.

      onClose();
    } catch (e: any) {
      console.error('AI Image Generation failed:', e);
      const raw = e?.message || e?.toString?.() || 'Άγνωστο σφάλμα από το Imagen/Gemini API.';

      if (
        raw.toLowerCase().includes('api key') ||
        raw.toLowerCase().includes('unauthorized') ||
        raw.toLowerCase().includes('permission') ||
        raw.includes('401') ||
        raw.includes('403')
      ) {
        setError(
          'Σφάλμα αυθεντικοποίησης στο Google AI API. Έλεγξε ότι το VITE_GEMINI_API_KEY είναι σωστό ' +
            'και ότι ο λογαριασμός σου έχει πρόσβαση στα Imagen models.'
        );
      } else if (raw.includes('429')) {
        setError('Το API έκανε rate limit (429). Δοκίμασε ξανά μετά από λίγο.');
      } else {
        setError(`Σφάλμα από Google AI: ${raw}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="sparkles" className="w-5 h-5 text-purple-500" />
            Δημιουργία Εικόνας με AI
          </DialogTitle>
          <DialogDescription>
            Χρησιμοποίησε το Google Imagen για να δημιουργήσεις μια εικόνα από περιγραφή
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center min-h-[250px]">
            <Icon name="loader-2" className="w-16 h-16 text-brand-yellow animate-spin" />
            <p className="mt-4 text-lg font-semibold text-muted-foreground">
              Η AI δημιουργεί την εικόνα της συνταγής...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Περιγραφή εικόνας</Label>
                <Textarea
                  id="ai-prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="π.χ. «Ρεαλιστική φωτογραφία πιάτου με Μουσακά, σε ξύλινο τραπέζι, φυσικό φως»"
                />
                {baseImage && (
                  <p className="text-xs text-muted-foreground">
                    🔁 Υπάρχει ήδη βάση εικόνας, προς το παρόν δημιουργείται νέα εικόνα από την περιγραφή.
                  </p>
                )}
              </div>

              {preview && (
                <div className="space-y-2">
                  <Label>Προεπισκόπηση τελευταίας εικόνας</Label>
                  <img
                    src={preview}
                    alt="AI preview"
                    className="w-full h-60 object-contain rounded-lg border bg-accent"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Άκυρο
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Icon name="sparkles" className="w-4 h-4 mr-2" />
                Δημιουργία εικόνας
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIImageModal;
