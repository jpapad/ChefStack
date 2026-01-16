// components/common/KitchenAICoachModal.tsx
import React, { useState } from 'react';
import { Icon } from './Icon';

interface KitchenAICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
  aiGlobalContext?: string;
  currentViewTitle?: string;
  userName?: string;
  teamName?: string;
}

const KitchenAICoachModal: React.FC<KitchenAICoachModalProps> = ({
  isOpen,
  onClose,
  withApiKeyCheck,
  aiGlobalContext,
  currentViewTitle,
  userName,
  teamName
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeContext, setIncludeContext] = useState(true);

  if (!isOpen) return null;

  const handleAsk = () => {
    if (!question.trim()) {
      setError('Γράψε μια ερώτηση προς το Kitchen AI.');
      return;
    }

    setError(null);
    setAnswer(null);

    withApiKeyCheck(() => {
      (async () => {
        try {
          setIsLoading(true);

          const contextBlock =
            includeContext && aiGlobalContext
              ? `\n\nΣύνοψη κατάστασης κουζίνας από το σύστημα:\n${aiGlobalContext}\n`
              : '\n\n(Δεν έχει δοθεί δομημένη σύνοψη από το σύστημα σε αυτή την ερώτηση.)\n';

          const prompt = `
Είσαι ένας έξυπνος σύμβουλος για επαγγελματική κουζίνα (Kitchen AI Coach).

Χρήστης:
- Όνομα: ${userName || 'Χρήστης'}
- Ομάδα / Επιχείρηση: ${teamName || 'Κουζίνα'}

Τρέχουσα οθόνη στην εφαρμογή: ${currentViewTitle || 'Άγνωστη προβολή'}.

${contextBlock}

Ερώτηση χρήστη:
"${question.trim()}"

Οδηγίες απάντησης:
- Απάντησε στα Ελληνικά.
- Να είσαι πρακτικός, σύντομος, με bullets όπου βοηθά.
- Αν η ερώτηση αφορά food cost, απόθεμα, φθορά ή οργάνωση, δώσε πολύ συγκεκριμένα βήματα.
- Αν χρειάζονται υποθέσεις (π.χ. δεν έχεις ακριβή αριθμούς), πες το ξεκάθαρα.
          `.trim();

          const { callGemini } = await import('../../src/lib/ai/callGemini');
          const result = await callGemini({
            feature: 'chef_copilot',
            prompt,
          });

          if (result.error) {
            throw new Error(result.error);
          }

          const text = result.text || 'Δεν λήφθηκε απάντηση από το AI.';

          setAnswer(text);
        } catch (e: any) {
          console.error('Kitchen AI coach error', e);
          setError(
            e?.message ||
              'Σφάλμα κατά την επικοινωνία με το Kitchen AI.'
          );
        } finally {
          setIsLoading(false);
        }
      })();
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Icon
              name="sparkles"
              className="w-5 h-5 text-purple-500 dark:text-purple-300"
            />
            <div>
              <h2 className="text-lg font-heading font-semibold">
                Kitchen AI Coach
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ρώτα οτιδήποτε για food cost, φθορά, οργάνωση βαρδιών,
                menu engineering κ.λπ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-hidden">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Η ερώτησή σου
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-slate-900 resize-none"
              placeholder="Π.χ. Πώς μπορώ να μειώσω τη φθορά στα λαχανικά; / Έχουμε πολλά low stock – πώς να οργανώσω καλύτερα τις παραγγελίες;"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
              />
              <span>
                Χρησιμοποίησε και τη συνοπτική εικόνα της κουζίνας
                (recipes, απόθεμα, φθορά κ.λπ.)
              </span>
            </label>

            <button
              type="button"
              onClick={handleAsk}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="message-circle" className="w-4 h-4" />
              {isLoading ? 'Γίνεται ανάλυση...' : 'Ρώτα το Kitchen AI'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-300">
                {error}
              </p>
            )}

            {!error && answer && (
              <pre className="text-sm whitespace-pre-wrap font-sans text-slate-900 dark:text-slate-100">
                {answer}
              </pre>
            )}

            {!error && !answer && !isLoading && (
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Δώσε στο Kitchen AI ένα ερώτημα για την κουζίνα σου – μπορεί
                να αφορά:
                <br />
                • μείωση φθοράς, <br />
                • καλύτερο food cost, <br />
                • οργάνωση αποθήκης, <br />
                • staffing & βάρδιες, <br />
                • ιδέες για μενού με βάση τα αποθέματα.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenAICoachModal;
