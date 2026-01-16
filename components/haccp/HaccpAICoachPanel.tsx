// components/haccp/HaccpAICoachPanel.tsx
import React, { useState } from 'react';
import { HaccpLog } from '../../types';
import { Icon } from '../common/Icon';
import { callGemini } from '../../src/lib/ai/callGemini';

interface HaccpAICoachPanelProps {
  haccpLogs: HaccpLog[];
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
}

const HaccpAICoachPanel: React.FC<HaccpAICoachPanelProps> = ({
  haccpLogs,
  withApiKeyCheck,
}) => {
  const [aiText, setAiText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAskHaccpCoach = () => {
    if (haccpLogs.length === 0) {
      setAiError('Δεν υπάρχουν HACCP καταγραφές για ανάλυση.');
      return;
    }

    setAiError(null);
    setAiText(null);

    withApiKeyCheck(() => {
      (async () => {
        try {
          setIsLoading(true);

          // Δίνουμε στο AI ένα περιορισμένο snapshot των logs (JSON)
          const logsSnapshot = JSON.stringify(haccpLogs.slice(0, 50));

          const prompt = `
Είσαι σύμβουλος ασφάλειας τροφίμων και HACCP για επαγγελματική κουζίνα.

Σου δίνω ένα JSON snapshot από HACCP καταγραφές (θερμοκρασίες, ελέγχους, κ.λπ.).
Μην προσπαθήσεις να το αναλύσεις σαν κώδικα, δες το σαν δομημένα δεδομένα.

HACCP logs (JSON):
${logsSnapshot}

Θέλω στα Ελληνικά, σε 5–8 bullets:
1. Τι παρατηρείς συνολικά (χωρίς να αναφέρεις τεχνικές λεπτομέρειες JSON).
2. Πιθανούς κινδύνους (π.χ. θερμοκρασίες, συχνότητα καταγραφών, κενά).
3. Τι ελέγχους / σημεία θα τσέκαρες πιο συχνά.
4. Προτάσεις για βελτίωση ρουτίνας HACCP (π.χ. training, υπενθυμίσεις, τυποποίηση).
5. 2–3 πρακτικές κινήσεις που μπορεί να κάνει η ομάδα σήμερα.

Μίλα πρακτικά, με bullets (•), όχι τεράστια θεωρία.
          `.trim();

          // Call via Supabase Edge Function proxy
          const response = await callGemini({
            feature: 'haccp_coach',
            prompt,
            model: 'gemini-2.0-flash',
          });

          if (response.error) {
            throw new Error(response.error);
          }

          const text = response.text || 'Δεν λήφθηκε απάντηση.';
          setAiText(text);
          });

          if (!response.ok) {
            const text = await response.text();
            console.error('Gemini API error (HACCP coach):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') ||
            'Δεν λήφθηκε απάντηση από το AI.';

          setAiText(text);
        } catch (e: any) {
          console.error('HACCP AI coach error', e);
          setAiError(
            e?.message || 'Σφάλμα κατά την ανάλυση των HACCP δεδομένων.'
          );
        } finally {
          setIsLoading(false);
        }
      })();
    });
  };

  return (
    <div className="mt-4 bg-sky-50/80 dark:bg-sky-900/40 border border-sky-200/80 dark:border-sky-700/70 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon
            name="shield"
            className="w-5 h-5 text-sky-500 dark:text-sky-300"
          />
          <div>
            <h3 className="text-sm font-heading font-semibold text-sky-800 dark:text-sky-100">
              HACCP AI Coach
            </h3>
            <p className="text-[11px] text-sky-700/80 dark:text-sky-200/80">
              Γρήγορη ανασκόπηση HACCP & ασφάλειας τροφίμων.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAskHaccpCoach}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full border border-sky-400 text-sky-700 text-xs font-semibold hover:bg-sky-50 dark:border-sky-500 dark:text-sky-200 dark:hover:bg-sky-500/10 transition-colors"
        >
          <Icon name="sparkles" className="w-4 h-4" />
          {isLoading ? 'Ανάλυση...' : 'Ρώτα το HACCP AI'}
        </button>
      </div>

      <div className="mt-2 text-sm text-sky-900 dark:text-sky-100 max-h-60 overflow-y-auto border-t border-sky-200/60 dark:border-sky-700/60 pt-2">
        {aiError && (
          <p className="text-sm text-red-600 dark:text-red-300">{aiError}</p>
        )}

        {!aiError && aiText && (
          <pre className="whitespace-pre-wrap font-sans">{aiText}</pre>
        )}

        {!aiError && !aiText && !isLoading && (
          <p className="text-sm">
            Κατέγραψε μερικά HACCP logs (θερμοκρασίες, καθαριότητα, παραλαβές κ.λπ.)
            και πάτα <strong>“Ρώτα το HACCP AI”</strong> για να πάρεις προτάσεις
            βελτίωσης ρουτίνας και ασφάλειας τροφίμων.
          </p>
        )}
      </div>
    </div>
  );
};

export default HaccpAICoachPanel;
