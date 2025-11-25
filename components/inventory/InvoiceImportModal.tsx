import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { ExtractedInvoiceItem } from '../../types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

interface InvoiceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (items: ExtractedInvoiceItem[]) => void;
}

const InvoiceImportModal: React.FC<InvoiceImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Παρακαλώ επιλέξτε ένα αρχείο PDF.');
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleProcessInvoice = async () => {
    if (!file) {
        setError('Παρακαλώ επιλέξτε ένα αρχείο.');
        return;
    }
    setIsLoading(true);
    setError(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                if (!process.env.API_KEY) {
                    throw new Error("API_KEY is not configured.");
                }
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                const dataUrl = reader.result as string;
                const base64Data = dataUrl.split(',')[1];

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: {
                        parts: [
                            { text: "Analyze the attached invoice PDF. Extract all line items including item name, quantity, unit of measure, and unit price. Return the data as a JSON array matching the provided schema. All text must be in Greek." },
                            { inlineData: { mimeType: 'application/pdf', data: base64Data } }
                        ]
                    },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    itemName: { type: Type.STRING, description: 'Το όνομα του προϊόντος.' },
                                    quantity: { type: Type.NUMBER, description: 'Η ποσότητα.' },
                                    unit: { type: Type.STRING, description: 'Η μονάδα μέτρησης (π.χ., ΚΙΛ, ΤΕΜ).' },
                                    unitPrice: { type: Type.NUMBER, description: 'Η τιμή ανά μονάδα.' }
                                },
                                required: ['itemName', 'quantity', 'unit', 'unitPrice']
                            }
                        }
                    }
                });

                const parsedItems = JSON.parse(response.text);
                onSuccess(parsedItems);

            } catch (e: any) {
                console.error("AI processing failed:", e);
                const errorMessage = e.message.includes("API_KEY")
                    ? "Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί."
                    : `AI Error: ${e.message || 'Failed to process invoice.'}`;
                setError(errorMessage);
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
             setError("Failed to read file.");
             setIsLoading(false);
        };
    } catch (e: any) {
        setError(`Error: ${e.message}`);
        setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('invoice_import_title')}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center min-h-[250px]">
                <Icon name="loader-2" className="w-16 h-16 text-brand-yellow animate-spin"/>
                <p className="mt-4 text-lg font-semibold text-muted-foreground">{t('invoice_import_analyzing')}</p>
            </div>
        ) : (
          <>
            <div className="space-y-4">
              {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg">{error}</p>}
              <div 
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                className={`flex justify-center items-center w-full h-48 rounded-lg border-2 border-dashed ${isDragging ? 'border-brand-yellow' : 'border-gray-300 dark:border-gray-600'} transition-colors`}>
                <div className="text-center">
                    <Icon name="file-up" className="mx-auto h-12 w-12 text-gray-400"/>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('invoice_import_prompt')}</p>
                    <input type="file" accept="application/pdf" onChange={e => handleFileChange(e.target.files?.[0] || null)} className="hidden"/>
                </div>
              </div>
              {file && (
                <div className="text-center font-semibold text-green-700 dark:text-green-300">
                    Επιλέχθηκε: {file.name}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
              <Button type="button" onClick={handleProcessInvoice} disabled={!file} className="gap-2">
                <Icon name="sparkles" className="w-4 h-4"/>
                Ανάλυση
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceImportModal;
