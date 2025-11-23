import React, { useState, useMemo } from 'react';
import { IngredientCost, Role, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import IngredientCostForm from './IngredientCostForm';
import IngredientCostList from './IngredientCostList';
import { api } from '../../services/api';

interface CostingViewProps {
  ingredientCosts: IngredientCost[];
  setIngredientCosts: React.Dispatch<React.SetStateAction<IngredientCost[]>>;
  selectedCostId: string | null;
  onSelectCost: (id: string | null) => void;
  onBack: () => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  currentTeamId: string;
  withApiKeyCheck: (action: () => void) => void;
}

const formatCurrency = (value: number) =>
  value.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });

const CostingView: React.FC<CostingViewProps> = ({
  ingredientCosts,
  setIngredientCosts,
  selectedCostId,
  onSelectCost,
  onBack,
  currentUserRole,
  rolePermissions,
  currentTeamId,
  withApiKeyCheck,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [costToEdit, setCostToEdit] = useState<IngredientCost | null>(null);
  const [costToDelete, setCostToDelete] = useState<IngredientCost | null>(null);

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_costing')
    : false;

  const selectedCost = useMemo(
    () => ingredientCosts.find(c => c.id === selectedCostId),
    [ingredientCosts, selectedCostId]
  );

  // 📊 Συνοπτικά στατιστικά για όλα τα συστατικά
  const costingStats = useMemo(() => {
    if (!ingredientCosts || ingredientCosts.length === 0) return null;

    const sorted = [...ingredientCosts].sort((a, b) => a.cost - b.cost);
    const totalItems = sorted.length;
    const totalCost = sorted.reduce((sum, c) => sum + c.cost, 0);
    const avgCost = totalCost / totalItems;
    const minItem = sorted[0];
    const maxItem = sorted[sorted.length - 1];
    const medianItem = sorted[Math.floor(sorted.length / 2)];

    return {
      totalItems,
      avgCost,
      minItem,
      maxItem,
      medianItem,
    };
  }, [ingredientCosts]);

  const handleOpenForm = (cost: IngredientCost | null = null) => {
    setCostToEdit(cost);
    setIsFormOpen(true);
  };

  const handleSaveCost = async (
    data: Omit<IngredientCost, 'id' | 'teamId'> | IngredientCost
  ) => {
    try {
      const isExisting = 'id' in data;

      const payload: any = isExisting
        ? {
            ...(data as IngredientCost),
            teamId: (data as IngredientCost).teamId ?? currentTeamId,
          }
        : {
            ...(data as any),
            teamId: currentTeamId,
          };

      const savedCost = await api.saveIngredientCost(payload);

      setIngredientCosts(prev => {
        const exists = prev.some(c => c.id === savedCost.id);
        const updated = exists
          ? prev.map(c => (c.id === savedCost.id ? savedCost : c))
          : [...prev, savedCost];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });

      if (!isExisting) {
        onSelectCost(savedCost.id);
      }

      setIsFormOpen(false);
      setCostToEdit(null);
    } catch (err: any) {
      console.error('Failed to save ingredient cost', err);
      alert(
        `Αποτυχία αποθήκευσης κόστους: ${
          err?.message || 'Άγνωστο σφάλμα'
        }`
      );
    }
  };

  const handleRequestDelete = (cost: IngredientCost) => {
    setCostToDelete(cost);
  };

  const handleConfirmDelete = async () => {
    if (costToDelete) {
      try {
        await api.deleteIngredientCost(costToDelete.id);

        setIngredientCosts(prev => prev.filter(c => c.id !== costToDelete.id));

        if (selectedCostId === costToDelete.id) {
          const remaining = ingredientCosts.filter(
            c => c.id !== costToDelete.id
          );
          onSelectCost(remaining.length > 0 ? remaining[0].id : null);
        }

        setCostToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete ingredient cost', err);
        alert(
          `Αποτυχία διαγραφής κόστους: ${
            err?.message || 'Άγνωστο σφάλμα'
          }`
        );
      }
    }
  };

  // 🧠 AI Cost Coach state
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiCostingInsights = () => {
    if (ingredientCosts.length === 0) {
      setAiError('Δεν υπάρχουν καταχωρημένα κόστη συστατικών για ανάλυση.');
      return;
    }

    setAiError(null);
    setAiInsights(null);

    withApiKeyCheck(() => {
      (async () => {
        try {
          setIsAiLoading(true);

          const apiKey = import.meta.env.VITE_GEMINI_API_KEY as
            | string
            | undefined;
          if (!apiKey) {
            throw new Error(
              'Λείπει το VITE_GEMINI_API_KEY από το .env.local.'
            );
          }

          const totalItems = ingredientCosts.length;
          const avgCost =
            ingredientCosts.reduce((sum, c) => sum + c.cost, 0) /
            Math.max(totalItems, 1);

          const topMostExpensive = ingredientCosts
            .slice()
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 15)
            .map(
              c =>
                `- ${c.name}: ${c.cost.toFixed(2)} €/ ${c.purchaseUnit}`
            )
            .join('\n');

          const byUnit: Record<
            string,
            { count: number; avgCost: number; totalCost: number }
          > = {};
          ingredientCosts.forEach(c => {
            if (!byUnit[c.purchaseUnit]) {
              byUnit[c.purchaseUnit] = {
                count: 0,
                avgCost: 0,
                totalCost: 0,
              };
            }
            const bucket = byUnit[c.purchaseUnit];
            bucket.count += 1;
            bucket.totalCost += c.cost;
          });
          Object.values(byUnit).forEach(b => {
            b.avgCost = b.totalCost / Math.max(b.count, 1);
          });

          const unitSummary = Object.entries(byUnit)
            .map(
              ([unit, info]) =>
                `- Μονάδα ${unit}: ${info.count} είδη, μέση τιμή ${info.avgCost.toFixed(
                  2
                )} €`
            )
            .join('\n');

          const focusIngredient = selectedCost
            ? `Συστατικό εστίασης:\n- ${selectedCost.name} με κόστος ${selectedCost.cost.toFixed(
                2
              )} €/ ${selectedCost.purchaseUnit}.\n`
            : 'Δεν υπάρχει συγκεκριμένο συστατικό εστίασης αυτή τη στιγμή.\n';

          const prompt = `
Είσαι F&B controller / consultant σε επαγγελματική κουζίνα.

Σου δίνω συνοπτικά τα δεδομένα κοστολόγησης πρώτων υλών (ingredient costs):

Γενική εικόνα:
- Συνολικά διαφορετικά είδη: ${totalItems}
- Μέση τιμή ανά purchase unit: ${avgCost.toFixed(2)} €

Κατανομή ανά μονάδα αγοράς:
${unitSummary || '—'}

Top ακριβότερα είδη (ανά τιμή purchase unit):
${topMostExpensive || '—'}

${focusIngredient}

Θέλω στα Ελληνικά, σε 5–8 bullets:

1. Ποια είδη φαίνονται πιο «επικίνδυνα» για το food cost (υψηλή τιμή / μονάδα, ευαισθησία σε waste).
2. Τι θα πρότεινες για renegotiation με προμηθευτές ή substitutions.
3. Ιδέες για menu engineering: ποια υλικά ίσως πρέπει να χρησιμοποιούνται σε πιο premium πιάτα, ποια να περιοριστούν.
4. Αν έχει επιλεγεί συστατικό εστίασης, δώσε 2–3 πολύ συγκεκριμένες προτάσεις για αυτό (π.χ. ελάχιστη τιμή πώλησης ανά μερίδα, έλεγχος δόσεων, ειδικά πιάτα).
5. 3–5 concrete “next actions” για τον Chef ή τον F&B Manager (π.χ. έλεγξε προσφορές για Χ, σύγκρινε τιμές με άλλον προμηθευτή, αναθεώρησε συνταγές που χρησιμοποιούν το Υ).

Μη γράψεις δοκίμιο – θέλω σύντομα, πρακτικά bullet points.
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
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
            }),
          });

          if (!response.ok) {
            const text = await response.text();
            console.error('Gemini API error (costing):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p.text)
              .join('\n') || 'Δεν λήφθηκε απάντηση από το AI.';

          setAiInsights(text);
        } catch (e: any) {
          console.error('AI costing insights error', e);
          setAiError(
            e?.message ||
              'Σφάλμα κατά την ανάλυση των δεδομένων κοστολόγησης.'
          );
        } finally {
          setIsAiLoading(false);
        }
      })();
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        {/* 🔍 Overview πάνω από το grid */}
        {costingStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/30 dark:border-slate-700/60 rounded-2xl p-4 shadow">
              <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                Συνολικά Συστατικά
              </p>
              <p className="mt-1 text-3xl font-extrabold font-heading">
                {costingStats.totalItems}
              </p>
              <p className="mt-1 text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                Καταχωρημένα στη βάση κοστολόγησης
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/30 dark:border-slate-700/60 rounded-2xl p-4 shadow">
              <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                Μέση Τιμή
              </p>
              <p className="mt-1 text-3xl font-extrabold font-heading text-brand-yellow">
                {formatCurrency(costingStats.avgCost)}
              </p>
              <p className="mt-1 text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                Μέσο κόστος ανά μονάδα αγοράς
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/30 dark:border-slate-700/60 rounded-2xl p-4 shadow">
              <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                Πιο Ακριβό Συστατικό
              </p>
              <p className="mt-1 text-sm font-semibold truncate">
                {costingStats.maxItem.name}
              </p>
              <p className="mt-1 text-xl font-bold text-red-500">
                {formatCurrency(costingStats.maxItem.cost)}
              </p>
              <p className="mt-1 text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                ανά {costingStats.maxItem.purchaseUnit}
              </p>
            </div>
          </div>
        )}

        {/* Κύριο layout: λίστα + λεπτομέρεια */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div
            className={`h-full ${
              selectedCostId ? 'hidden lg:block' : 'lg:col-span-1'
            }`}
          >
            <IngredientCostList
              ingredientCosts={ingredientCosts}
              selectedCostId={selectedCostId}
              onSelectCost={onSelectCost}
              onAdd={() => handleOpenForm(null)}
              onEdit={handleOpenForm}
              onDelete={handleRequestDelete}
              canManage={canManage}
            />
          </div>
          <div
            className={`h-full ${
              !selectedCostId ? 'hidden lg:flex' : 'lg:col-span-2'
            }`}
          >
            {selectedCost ? (
              <div className="p-6 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-y-auto">
                <button
                  onClick={onBack}
                  className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline"
                >
                  <Icon name="arrow-left" className="w-5 h-5 mr-2" />
                  Πίσω στο Κοστολόγιο
                </button>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold font-heading">
                      {selectedCost.name}
                    </h2>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-4">
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenForm(selectedCost)}
                          title="Επεξεργασία"
                          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          <Icon name="edit" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRequestDelete(selectedCost)}
                          title="Διαγραφή"
                          className="p-2 rounded-full text-light-text-secondary hover:text-red-600 dark:text-dark-text-secondary dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Icon name="trash-2" className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-6 bg-black/5 dark:bg.white/5 dark:bg-white/5 p-6 rounded-lg text-center">
                  <h4 className="text-md font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">
                    Κόστος ανά {selectedCost.purchaseUnit}
                  </h4>
                  <p className="text-4xl font-bold text-brand-yellow">
                    {formatCurrency(selectedCost.cost)}
                  </p>
                </div>

                {/* 🧠 AI Cost Coach panel */}
                <div className="mt-6 bg-purple-50/70 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-2xl shadow-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        name="sparkles"
                        className="w-5 h-5 text-purple-500 dark:text-purple-300"
                      />
                      <h3 className="text-md font-heading font-semibold text-purple-800 dark:text-purple-100">
                        AI Cost Coach
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleAiCostingInsights}
                      className="px-3 py-1 rounded-full border border-purple-400 text-purple-700 text-xs font-semibold hover:bg-purple-50 dark:border-purple-500 dark:text-purple-200 dark:hover:bg-purple-500/10 transition-colors"
                      disabled={isAiLoading}
                    >
                      {isAiLoading ? 'Γίνεται ανάλυση...' : 'Ανάλυση με Gemini'}
                    </button>
                  </div>

                  {isAiLoading && (
                    <p className="text-sm text-purple-700 dark:text-purple-200">
                      Αναλύουμε τα κόστη συστατικών...
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
                      Πάτησε <strong>“Ανάλυση με Gemini”</strong> για να πάρεις
                      πρακτικές προτάσεις για renegotiation προμηθευτών,
                      substitutions και menu engineering, με βάση όλα τα κόστη
                      συστατικών και το τρέχον επιλεγμένο υλικό.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <p>Επιλέξτε ή δημιουργήστε ένα συστατικό</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <IngredientCostForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCost}
        costToEdit={costToEdit}
      />

      <ConfirmationModal
        isOpen={!!costToDelete}
        onClose={() => setCostToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Διαγραφή Κόστους Συστατικού"
        body={
          <p>
            Είστε σίγουροι ότι θέλετε να διαγράψετε το κόστος για το "
            {costToDelete?.name}";
          </p>
        }
      />
    </>
  );
};

export default CostingView;
