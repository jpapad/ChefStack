import React, { useMemo, useState } from 'react';
import { User, Message } from '../../types';
import { Icon } from '../common/Icon';

interface TeamCommsCoachProps {
  currentUser: User;
  allUsers: User[];
  messages: Message[];
}

const TeamCommsCoach: React.FC<TeamCommsCoachProps> = ({
  currentUser,
  allUsers,
  messages
}) => {
  const [draft, setDraft] = useState('');
  const [aiText, setAiText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Μικρή περίληψη πρόσφατης επικοινωνίας (τελευταία 15 μηνύματα)
  const recentSummary = useMemo(() => {
    if (!messages || messages.length === 0) return '—';

    const sorted = [...messages].sort((a, b) => {
      const ta = new Date((a as any).timestamp).getTime();
      const tb = new Date((b as any).timestamp).getTime();
      return tb - ta; // πιο πρόσφατα πρώτα
    });

    const last = sorted.slice(0, 15).reverse(); // παλιά -> νέα

    const getUserName = (id: string | undefined) => {
      if (!id) return 'Άγνωστος';
      const u = allUsers.find((u) => u.id === id);
      return u?.name || u?.email || 'Άγνωστος';
    };

    return last
      .map((m) => {
        const senderId =
          (m as any).userId || (m as any).user_id || undefined;
        const sender = getUserName(senderId);
        const text =
          (m as any).content ??
          (m as any).text ??
          (m as any).body ??
          '';
        return `${sender}: ${text}`;
      })
      .join('\n');
  }, [messages, allUsers]);

  const handleAskAI = () => {
    if (!draft.trim() && (!messages || messages.length === 0)) {
      setError(
        'Γράψε ένα προσχέδιο ανακοίνωσης ή φρόντισε να υπάρχουν μερικά πρόσφατα μηνύματα.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY as
          | string
          | undefined;

        if (!apiKey) {
          throw new Error(
            'Λείπει το VITE_GEMINI_API_KEY στο .env.local. Πρόσθεσέ το και κάνε restart τον dev server.'
          );
        }

        const prompt = `
Είσαι επικοινωνιολόγος / F&B Manager σε επαγγελματική κουζίνα.

Σου δίνω:
- Βασικό προφίλ χρήστη που στέλνει την ανακοίνωση:
  - Όνομα: ${currentUser.name || currentUser.email || 'Χρήστης'}
- Πρόσφατη ροή εσωτερικής επικοινωνίας (chat / ειδοποιήσεις):
${recentSummary || '—'}

Ο χρήστης γράφει αυτό το προσχέδιο ανακοίνωσης (αν είναι κενό, θέλω εσύ να προτείνεις από την αρχή κάτι χρήσιμο για την ομάδα):
"${draft || '— (κανένα προσχέδιο, δώσε εσύ ιδέες ανακοίνωσης)'}"

Στόχος:
- Να βγει μια καθαρή, επαγγελματική αλλά ανθρώπινη ανακοίνωση.
- Σε φιλικό τόνο, χωρίς πατρονάρισμα.
- Στα Ελληνικά.

Θέλω:
1) Μια προτεινόμενη τελική εκδοχή της ανακοίνωσης.
2) 2–3 bullets με εξήγηση του τόνου (π.χ. γιατί βοηθά συνεργασία, κλίμα, σαφήνεια).
3) Αν χρειάζεται, μια μικρή πρόταση για follow-up (π.χ. “αν έχετε ιδέες, γράψτε εδώ”).
        `.trim();

        const model = 'gemini-2.0-flash';
        const endpoint =
          'https://generativelanguage.googleapis.com/v1beta/models/' +
          model +
          ':generateContent?key=' +
          encodeURIComponent(apiKey);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          })
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Gemini API error (team comms):', text);
          throw new Error('Σφάλμα από το Gemini API.');
        }

        const data = await response.json();
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p.text)
            .join('\n') || 'Δεν λήφθηκε απάντηση από το AI.';

        setAiText(text);
      } catch (e: any) {
        console.error('AI team comms error', e);
        setError(
          e?.message ||
            'Σφάλμα κατά την ανάλυση της επικοινωνίας της ομάδας.'
        );
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <div className="bg-purple-50/70 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-2xl shadow-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon
            name="sparkles"
            className="w-5 h-5 text-purple-500 dark:text-purple-300"
          />
          <h3 className="text-md font-heading font-semibold text-purple-800 dark:text-purple-100">
            AI Coach Επικοινωνίας Ομάδας
          </h3>
        </div>
      </div>

      <p className="text-xs text-purple-800/90 dark:text-purple-100/90 mb-2">
        Γράψε εδώ ένα προσχέδιο ανακοίνωσης (ή άφησέ το κενό για να σου
        προτείνει ιδέα) και πάτα{' '}
        <strong>“Βελτίωση / Πρόταση Ανακοίνωσης”</strong>.
      </p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        className="w-full text-sm border border-purple-200 dark:border-purple-600 rounded-lg px-2 py-1 bg-white/80 dark:bg-slate-900/70 mb-3 resize-none"
        placeholder="Π.χ. ενημέρωση για αλλαγές στο μενού, νέους κανόνες, ευχαριστήριο προς την ομάδα..."
      />

      <button
        type="button"
        onClick={handleAskAI}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="magic-wand" className="w-4 h-4" />
        {isLoading
          ? 'Γίνεται ανάλυση...'
          : 'Βελτίωση / Πρόταση Ανακοίνωσης'}
      </button>

      <div className="flex-1 overflow-y-auto border-t border-purple-200/60 dark:border-purple-700/60 pt-3 mt-1">
        {error && (
          <p className="text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        )}

        {!error && aiText && (
          <pre className="text-sm whitespace-pre-wrap font-sans text-purple-900 dark:text-purple-100">
            {aiText}
          </pre>
        )}

        {!error && !aiText && !isLoading && (
          <p className="text-sm text-purple-700 dark:text-purple-200">
            Το panel αυτό κοιτάει τη γενική εικόνα του chat/ειδοποιήσεων
            και σε βοηθά να στείλεις ξεκάθαρες, ήρεμες και δίκαιες
            ανακοινώσεις στην ομάδα σου.
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamCommsCoach;
