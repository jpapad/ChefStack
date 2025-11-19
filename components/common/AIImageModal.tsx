// components/common/AIImageModal.tsx
import React, { useEffect, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icon } from './Icon';

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

  const handleBackdropClick = () => {
    if (!isLoading) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Icon name="sparkles" className="w-6 h-6 text-purple-500" />
            Δημιουργία Εικόνας με AI
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
          >
            <Icon name="x" className="w-6 h-6" />
          </button>
        </header>

        {/* Body */}
        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center min-h-[250px]">
            <Icon name="loader-2" className="w-16 h-16 text-brand-yellow animate-spin" />
            <p className="mt-4 text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              Η AI δημιουργεί την εικόνα της συνταγής...
            </p>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {error && (
                <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg">
                  {error}
                </p>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium mb-1">
                  Περιγραφή εικόνας
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                  placeholder="π.χ. «Ρεαλιστική φωτογραφία πιάτου με Μουσακά, σε ξύλινο τραπέζι, φυσικό φως»"
                />
                {baseImage && (
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    🔁 Υπάρχει ήδη βάση εικόνας, προς το παρόν δημιουργείται νέα εικόνα από την περιγραφή.
                  </p>
                )}
              </div>

              {preview && (
                <div className="mt-4">
                  <p className="text-sm mb-1 font-medium">Προεπισκόπηση τελευταίας εικόνας</p>
                  <img
                    src={preview}
                    alt="AI preview"
                    className="w-full h-60 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-black/5"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold disabled:opacity-50"
              >
                Άκυρο
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <Icon name="sparkles" className="w-5 h-5" />
                Δημιουργία εικόνας
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default AIImageModal;
