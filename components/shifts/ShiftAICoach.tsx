import React, { useMemo, useState } from 'react';
import { Shift, ShiftSchedule, User } from '../../types';
import { Icon } from '../common/Icon';

interface ShiftAICoachProps {
  shifts: Shift[];
  shiftSchedules: ShiftSchedule[];
  allUsers: User[];
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
}

const weekdayLabels = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];

const ShiftAICoach: React.FC<ShiftAICoachProps> = ({
  shifts,
  shiftSchedules,
  allUsers,
  withApiKeyCheck
}) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 🔍 Συγκεντρωτικά στατιστικά για βάρδιες
  const summary = useMemo(() => {
    if (!shifts || shifts.length === 0) {
      return {
        totalShifts: 0,
        uniqueStaffCount: 0,
        perUser: [] as {
          userId: string;
          name: string;
          shifts: number;
          hours: number;
        }[],
        perWeekday: [] as { weekday: number; label: string; count: number }[],
        scheduleSummary: [] as {
          userId: string;
          name: string;
          days: string[];
        }[]
      };
    }

    const perUserMap = new Map<
      string,
      { userId: string; name: string; shifts: number; hours: number }
    >();
    const perWeekdayMap = new Map<number, number>();

    const getUserName = (userId: string | undefined) => {
      if (!userId) return 'Άγνωστο μέλος';
      const u = allUsers.find((u) => u.id === userId);
      return u?.name || u?.email || 'Άγνωστο μέλος';
    };

    for (const s of shifts) {
      const shift: any = s as any;

      // Προσπαθούμε να καταλάβουμε start/end με διάφορα πιθανά πεδία
      let start: Date | null = null;
      let end: Date | null = null;

      if (shift.start) {
        start = new Date(shift.start);
      } else if (shift.date && shift.startTime) {
        start = new Date(`${shift.date}T${shift.startTime}`);
      } else if (shift.date) {
        start = new Date(shift.date);
      } else if (shift.start_time) {
        start = new Date(shift.start_time);
      }

      if (shift.end) {
        end = new Date(shift.end);
      } else if (shift.date && shift.endTime) {
        end = new Date(`${shift.date}T${shift.endTime}`);
      } else if (shift.end_time) {
        end = new Date(shift.end_time);
      }

      let hours = 8;
      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime();
        if (diffMs > 0) {
          hours = diffMs / 1000 / 60 / 60;
        }
      }

      const userId: string | undefined = shift.userId || shift.user_id;
      const name = getUserName(userId);

      // Per user
      if (!userId) continue;
      const existing = perUserMap.get(userId);
      if (existing) {
        existing.shifts += 1;
        existing.hours += hours;
      } else {
        perUserMap.set(userId, {
          userId,
          name,
          shifts: 1,
          hours
        });
      }

      // Per weekday
      if (start && !isNaN(start.getTime())) {
        const wd = start.getDay(); // 0=Sun
        perWeekdayMap.set(wd, (perWeekdayMap.get(wd) ?? 0) + 1);
      }
    }

    const perUser = Array.from(perUserMap.values()).sort(
      (a, b) => b.hours - a.hours
    );

    const perWeekday = weekdayLabels.map((label, index) => ({
      weekday: index,
      label,
      count: perWeekdayMap.get(index) ?? 0
    }));

    // Summary από shiftSchedules (pattern βαρδιών)
    const scheduleMap = new Map<string, { userId: string; name: string; days: Set<string> }>();

    for (const sched of shiftSchedules || []) {
      const sc: any = sched as any;
      const userId: string | undefined = sc.userId || sc.user_id;
      if (!userId) continue;
      const name = getUserName(userId);

      const day =
        typeof sc.dayOfWeek === 'number'
          ? weekdayLabels[sc.dayOfWeek] || String(sc.dayOfWeek)
          : sc.dayOfWeek || sc.day || '—';

      const existing = scheduleMap.get(userId);
      if (existing) {
        existing.days.add(String(day));
      } else {
        scheduleMap.set(userId, {
          userId,
          name,
          days: new Set([String(day)])
        });
      }
    }

    const scheduleSummary = Array.from(scheduleMap.values()).map((entry) => ({
      userId: entry.userId,
      name: entry.name,
      days: Array.from(entry.days)
    }));

    return {
      totalShifts: shifts.length,
      uniqueStaffCount: perUser.length,
      perUser,
      perWeekday,
      scheduleSummary
    };
  }, [shifts, shiftSchedules, allUsers]);

  const handleAiShiftInsights = () => {
    if (!shifts || shifts.length === 0) {
      setAiError('Δεν υπάρχουν καταχωρημένες βάρδιες για ανάλυση.');
      return;
    }

    if (typeof withApiKeyCheck !== 'function') {
      setAiError('Η AI ανάλυση δεν είναι διαθέσιμη (εσωτερικό σφάλμα withApiKeyCheck).');
      return;
    }

    withApiKeyCheck(() => {
      (async () => {
        setIsAiLoading(true);
        setAiError(null);

        try {
          const topUsers = summary.perUser
            .slice(0, 10)
            .map(
              (u) =>
                `- ${u.name}: ${u.shifts} βάρδιες / ~${u.hours.toFixed(
                  1
                )} ώρες`
            )
            .join('\n');

          const weekdaySummary = summary.perWeekday
            .map((d) => `- ${d.label}: ${d.count} βάρδιες`)
            .join('\n');

          const scheduleLines = summary.scheduleSummary
            .map(
              (s) =>
                `- ${s.name}: ${s.days.length > 0 ? s.days.join(', ') : '—'}`
            )
            .join('\n');

          const prompt = `
Είσαι F&B Manager και υπεύθυνος προγραμμάτων βαρδιών σε ξενοδοχειακή / εστιατορική μονάδα.

Σου δίνω μια σύνοψη από τις βάρδιες προσωπικού:

- Συνολικές βάρδιες: ${summary.totalShifts}
- Αριθμός μελών προσωπικού με βάρδιες: ${summary.uniqueStaffCount}

Top εργαζόμενοι (κατά ώρες / πλήθος βαρδιών):
${topUsers || '—'}

Κατανομή βαρδιών ανά ημέρα εβδομάδας:
${weekdaySummary || '—'}

Σύνοψη σταθερών προγραμμάτων (shift schedules):
${scheduleLines || '—'}

Με βάση αυτά, θέλω στα Ελληνικά, σε 6–10 bullets:

1. Παρατηρήσεις για ισορροπία φόρτου ανά εργαζόμενο (ποιοι φαίνονται υπερφορτωμένοι / υποαπασχολούμενοι).
2. Αν υπάρχουν μέρες με πιθανή υποστελέχωση ή υπερστελέχωση.
3. Προτάσεις για βελτίωση work–life balance και αποφυγή burnout.
4. Ιδέες για rotation (π.χ. να μην είναι πάντα τα ίδια άτομα στα Σ/Κ ή στις βραδινές βάρδιες).
5. Τι ενέργειες θα πρότεινες σε Head Chef / Restaurant Manager για την επόμενη εβδομάδα.
6. Αν λείπει κάτι από τη δομή του προγράμματος (π.χ. cross-training, shadowing, extra break σε μεγάλες βάρδιες).

Να είσαι πρακτικός, με bullets (•) και όχι γενικόλογη θεωρία.
          `.trim();

          const { callGemini } = await import('../../src/lib/ai/callGemini');
          const result = await callGemini({
            feature: 'ops_coach',
            prompt,
          });

          if (result.error) {
            throw new Error(result.error);
          }

          const text = result.text || 'Δεν λήφθηκε απάντηση από το AI.';

          setAiInsights(text);
        } catch (e: any) {
          console.error('AI shifts insights error', e);
          setAiError(
            e?.message || 'Σφάλμα κατά την ανάλυση των βαρδιών.'
          );
        } finally {
          setIsAiLoading(false);
        }
      })();
    });
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
            AI Shift Coach
          </h3>
        </div>
        <button
          type="button"
          onClick={handleAiShiftInsights}
          className="px-3 py-1 rounded-full border border-purple-400 text-purple-700 text-xs font-semibold hover:bg-purple-50 dark:border-purple-500 dark:text-purple-200 dark:hover:bg-purple-500/10 transition-colors"
        >
          Ανάλυση Βαρδιών
        </button>
      </div>

      {/* Μικρό summary πάνω-πάνω */}
      <div className="mb-3 text-xs text-purple-800/90 dark:text-purple-100/90 space-y-1">
        <p>
          Συνολικές βάρδιες:{' '}
          <strong>{summary.totalShifts}</strong> | Μέλη
          προσωπικού με βάρδιες:{' '}
          <strong>{summary.uniqueStaffCount}</strong>
        </p>
        <p>
          Ημέρες με τις περισσότερες βάρδιες:{' '}
          {summary.perWeekday
            .slice()
            .sort((a, b) => b.count - a.count)
            .slice(0, 2)
            .map((d) => `${d.label} (${d.count})`)
            .join(', ') || '—'}
        </p>
        {summary.perUser.length > 0 && (
          <p>
            Πιο φορτωμένο άτομο:{' '}
            <strong>
              {summary.perUser[0].name} (~
              {summary.perUser[0].hours.toFixed(1)} ώρες /
              {summary.perUser[0].shifts} βάρδιες)
            </strong>
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isAiLoading && (
          <p className="text-sm text-purple-700 dark:text-purple-200">
            Γίνεται ανάλυση του προγράμματος βαρδιών...
          </p>
        )}

        {!isAiLoading && aiError && (
          <p className="text-sm text-red-600 dark:text-red-300">
            {aiError}
          </p>
        )}

        {!isAiLoading && !aiError && aiInsights && (
          <pre className="text-sm whitespace-pre-wrap font-sans text-purple-900 dark:text-purple-100">
            {aiInsights}
          </pre>
        )}

        {!isAiLoading && !aiError && !aiInsights && (
          <p className="text-sm text-purple-700 dark:text-purple-200">
            Ρύθμισε πρώτα τις βάρδιες στο κεντρικό panel και μετά
            πάτα <strong>“Ανάλυση Βαρδιών”</strong> για να πάρεις
            προτάσεις ισορροπίας, rotation και αποφυγής burnout.
          </p>
        )}
      </div>
    </div>
  );
};

export default ShiftAICoach;
