import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Icon } from './Icon';

interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (base64Image: string) => void;
  initialPrompt: string;
  baseImage?: {
      data: string; // base64 encoded string without header
      mimeType: string;
  } | null;
}

const AIImageModal: React.FC<AIImageModalProps> = ({ isOpen, onClose, onConfirm, initialPrompt, baseImage }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!baseImage;

  useEffect(() => {
      if (isOpen) {
          setPrompt(isEditing ? '' : initialPrompt);
          setGeneratedImage(null);
          setError(null);
      }
  }, [isOpen, initialPrompt, isEditing]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const parts: any[] = [];
      if (isEditing && baseImage) {
          parts.push({
              inlineData: {
                  data: baseImage.data,
                  mimeType: baseImage.mimeType,
              },
          });
      }
      parts.push({ text: prompt });

      // Fix: The 'contents' parameter for multimodal input must be an object with a 'parts' array.
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(part.inlineData.data);
          break;
        }
      }
    } catch (err: any) {
      console.error("AI Image Generation failed:", err);
      const errorMessage = err.message.includes("API_KEY")
          ? "Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί."
          : "Αποτυχία δημιουργίας εικόνας. Παρακαλώ δοκιμάστε ξανά.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (generatedImage) {
      onConfirm(generatedImage);
    }
  };


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Icon name="sparkles" className="w-6 h-6 text-purple-500"/>
            {isEditing ? 'Επεξεργασία Εικόνας με AI' : 'Δημιουργία Εικόνας με AI'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
            {/* Left Column: Form */}
            <div className="space-y-4">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {isEditing 
                        ? 'Περιγράψτε τις αλλαγές που θέλετε να κάνετε στην εικόνα.'
                        : 'Περιγράψτε την εικόνα που θέλετε να δημιουργήσετε. Προσπαθήστε να είστε συγκεκριμένοι!'
                    }
                </p>
                 <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={5}
                    className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                    placeholder={isEditing ? "π.χ. 'add a sprig of fresh basil on top'" : "π.χ. 'a rustic bowl of beef kokkinisto with orzo, garnished with parsley'"}
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-dark text-white font-semibold hover:opacity-90 disabled:opacity-50"
                >
                    {isLoading ? <Icon name="loader-2" className="animate-spin w-5 h-5"/> : <Icon name="sparkles" className="w-5 h-5"/>}
                    {isEditing ? 'Ενημέρωση Εικόνας' : 'Δημιουργία Εικόνας'}
                </button>
            </div>
            {/* Right Column: Image Preview */}
            <div className="flex flex-col items-center justify-center bg-black/5 dark:bg-white/10 rounded-lg min-h-[250px] p-2">
                 {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-center">
                        <Icon name="loader-2" className="w-10 h-10 text-brand-yellow animate-spin"/>
                        <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">Η AI δημιουργεί την εικόνα σας...</p>
                    </div>
                 ) : error ? (
                    <div className="text-center text-red-500 p-4">
                        <Icon name="warning" className="w-10 h-10 mx-auto mb-2"/>
                        <p className="font-semibold">{error}</p>
                    </div>
                 ) : generatedImage ? (
                    <img src={`data:image/png;base64,${generatedImage}`} alt="Generated by AI" className="max-w-full max-h-full object-contain rounded"/>
                 ) : isEditing && baseImage ? (
                    <img src={`data:${baseImage.mimeType};base64,${baseImage.data}`} alt="Current image" className="max-w-full max-h-full object-contain rounded"/>
                 ) : (
                    <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
                        <Icon name="image" className="w-12 h-12 mx-auto mb-2"/>
                        <p>Η εικόνα θα εμφανιστεί εδώ</p>
                    </div>
                 )}
            </div>
        </div>
        
        <footer className="p-4 border-t border-gray-200/80 dark:border-gray-700/80 flex justify-end gap-4">
             <button
                type="button"
                className="px-5 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold transition-colors"
                onClick={onClose}
              >
                Άκυρο
              </button>
             <button
                type="button"
                className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                onClick={handleConfirm}
                disabled={!generatedImage}
              >
                <Icon name="check" className="w-5 h-5"/>
                Χρήση Εικόνας
              </button>
        </footer>
      </div>
    </div>
  );
};

export default AIImageModal;
