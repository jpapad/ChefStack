import React, { useState, useMemo } from 'react';
import { Supplier, Role, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import SupplierForm from './SupplierForm';
import SupplierList from './SupplierList';
import { api } from '../../services/api';

interface SupplierViewProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  selectedSupplierId: string | null;
  onSelectSupplier: (id: string | null) => void;
  onBack: () => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  currentTeamId: string;
}

const SupplierView: React.FC<SupplierViewProps> = ({
  suppliers,
  setSuppliers,
  selectedSupplierId,
  onSelectSupplier,
  onBack,
  currentUserRole,
  rolePermissions,
  currentTeamId,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // 🧠 AI state για Supplier Coach
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_inventory')
    : false;

  const sortedSuppliers = useMemo(
    () => [...suppliers].sort((a, b) => a.name.localeCompare(b.name)),
    [suppliers]
  );

  const selectedSupplier = useMemo(
    () => suppliers.find(s => s.id === selectedSupplierId),
    [suppliers, selectedSupplierId]
  );

  // 🔍 Μικρά στατιστικά για suppliers
  const supplierStats = useMemo(() => {
    const total = suppliers.length;
    let withPhone = 0;
    let withEmail = 0;
    let withBoth = 0;

    suppliers.forEach(s => {
      const hasPhone = !!s.phone;
      const hasEmail = !!s.email;
      if (hasPhone) withPhone++;
      if (hasEmail) withEmail++;
      if (hasPhone && hasEmail) withBoth++;
    });

    return { total, withPhone, withEmail, withBoth };
  }, [suppliers]);

  const handleOpenForm = (supplier: Supplier | null = null) => {
    setSupplierToEdit(supplier);
    setIsFormOpen(true);
  };

  const handleSaveSupplier = async (
    data: Omit<Supplier, 'id' | 'teamId'> | Supplier
  ) => {
    try {
      const isExisting = 'id' in data;

      // ✅ ΕΔΩ ΦΡΟΝΤΙΖΟΥΜΕ ΝΑ ΥΠΑΡΧΕΙ ΠΑΝΤΑ teamId
      const payload: any = isExisting
        ? {
            ...(data as Supplier),
            teamId: (data as Supplier).teamId ?? currentTeamId,
          }
        : {
            ...(data as any),
            teamId: currentTeamId,
          };

      const savedSupplier = await api.saveSupplier(payload);

      setSuppliers(prev => {
        const exists = prev.some(s => s.id === savedSupplier.id);
        return exists
          ? prev.map(s => (s.id === savedSupplier.id ? savedSupplier : s))
          : [...prev, savedSupplier];
      });

      if (!isExisting) {
        onSelectSupplier(savedSupplier.id);
      }

      setIsFormOpen(false);
      setSupplierToEdit(null);
    } catch (err: any) {
      console.error('Failed to save supplier', err);
      alert(
        `Αποτυχία αποθήκευσης προμηθευτή: ${
          err?.message || 'Άγνωστο σφάλμα'
        }`
      );
    }
  };

  const handleRequestDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      try {
        await api.deleteSupplier(supplierToDelete.id);

        setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));

        if (selectedSupplierId === supplierToDelete.id) {
          const remaining = suppliers.filter(
            s => s.id !== supplierToDelete.id
          );
          onSelectSupplier(remaining.length > 0 ? remaining[0].id : null);
        }

        setSupplierToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete supplier', err);
        alert(
          `Αποτυχία διαγραφής προμηθευτή: ${
            err?.message || 'Άγνωστο σφάλμα'
          }`
        );
      }
    }
  };

  // 🧠 Gemini – Supplier Coach
  const handleAiSupplierAdvice = () => {
    if (suppliers.length === 0) {
      setAiError('Δεν υπάρχουν καταχωρημένοι προμηθευτές για ανάλυση.');
      setAiAdvice(null);
      return;
    }

    setAiError(null);
    setAiAdvice(null);

    (async () => {
      try {
        setAiLoading(true);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY as
          | string
          | undefined;

        if (!apiKey) {
          throw new Error(
            'Λείπει το VITE_GEMINI_API_KEY στο .env.local. Πρόσθεσέ το και κάνε restart τον dev server.'
          );
        }

        const suppliersSummary = suppliers
          .slice(0, 50)
          .map(s => {
            const contact = s.contactPerson || '-';
            const phone = s.phone || '-';
            const email = s.email || '-';
            return `- ${s.name} | Επαφή: ${contact} | Τηλ: ${phone} | Email: ${email}`;
          })
          .join('\n');

        const selectedInfo = selectedSupplier
          ? `Τρέχων επιλεγμένος προμηθευτής: ${selectedSupplier.name}${
              selectedSupplier.contactPerson
                ? ` (επαφή: ${selectedSupplier.contactPerson})`
                : ''
            }`
          : 'Δεν έχει επιλεγεί συγκεκριμένος προμηθευτής.';

        const prompt = `
Είσαι σύμβουλος προμηθειών / F&B controller σε επαγγελματική κουζίνα.

Σου δίνω τη λίστα με τους προμηθευτές και βασικά στοιχεία επικοινωνίας τους.
Θέλω να με βοηθήσεις να οργανώσω καλύτερα τις συνεργασίες & τις διαπραγματεύσεις.

Συνοπτικά στατιστικά:
- Σύνολο προμηθευτών: ${supplierStats.total}
- Με τηλέφωνο: ${supplierStats.withPhone}
- Με email: ${supplierStats.withEmail}
- Με πλήρη στοιχεία (τηλέφωνο & email): ${supplierStats.withBoth}

${selectedInfo}

Λίστα προμηθευτών:
${suppliersSummary}

Θέλω στα Ελληνικά, σε 6–10 bullets, με bullets τύπου "•":
1. Πώς προτείνεις να οργανώσω τους προμηθευτές (π.χ. A/B/C vendors, κύριοι vs δευτερεύοντες).
2. Τι είδους πληροφορίες λείπουν από τους προμηθευτές (π.χ. τιμοκατάλογοι, SLA παραδόσεων, στοιχεία επικοινωνίας, backup επαφές).
3. Τι βήματα διαπραγμάτευσης θα πρότεινες για τους βασικούς προμηθευτές (π.χ. κρέας, λαχανικά, γαλακτοκομικά – ακόμη κι αν δεν βλέπεις κατηγορία, δώσε γενικές τακτικές).
4. Προειδοποιήσεις για over-dependence από λίγους προμηθευτές και πώς να το μειώσω.
5. 3–5 πολύ συγκεκριμένα “next actions” για τον Chef ή τον F&B Manager (π.χ. ζήτα updated τιμοκατάλογο, όρισε review meetings, σύγκρινε προσφορές).

Μην γράψεις τεράστιες παραγράφους· κράτα το πρακτικό, σαν σημειώσεις πριν από συνάντηση με προμηθευτές.
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
          console.error('Gemini API error (suppliers):', text);
          throw new Error('Σφάλμα από το Gemini API.');
        }

        const data = await response.json();
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p.text)
            .join('\n') || 'Δεν λήφθηκε απάντηση από το AI.';

        setAiAdvice(text);
      } catch (e: any) {
        console.error('AI supplier advisor error', e);
        setAiError(
          e?.message ||
            'Σφάλμα κατά την ανάλυση των προμηθευτών από το AI.'
        );
      } finally {
        setAiLoading(false);
      }
    })();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Αριστερά: Λίστα Προμηθευτών */}
        <div
          className={`h-full ${
            selectedSupplierId ? 'hidden lg:block' : 'lg:col-span-1'
          }`}
        >
          <SupplierList
            suppliers={sortedSuppliers}
            selectedSupplierId={selectedSupplierId}
            onSelectSupplier={onSelectSupplier}
            onAdd={() => handleOpenForm(null)}
            onEdit={handleOpenForm}
            onDelete={handleRequestDelete}
            canManage={canManage}
          />
        </div>

        {/* Δεξιά: Λεπτομέρειες + Overview + AI panel */}
        <div
          className={`h-full ${
            !selectedSupplierId ? 'hidden lg:flex' : 'lg:col-span-2'
          }`}
        >
          {selectedSupplier ? (
            <div className="p-6 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-y-auto">
              <button
                onClick={onBack}
                className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline"
              >
                <Icon name="arrow-left" className="w-5 h-5 mr-2" />
                Πίσω στους Προμηθευτές
              </button>

              {/* Header + actions */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold font-heading">
                    {selectedSupplier.name}
                  </h2>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Συνολικά προμηθευτές: <strong>{supplierStats.total}</strong> •
                    Με πλήρη στοιχεία: <strong>{supplierStats.withBoth}</strong>
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-4">
                  {canManage && (
                    <>
                      <button
                        onClick={() => handleOpenForm(selectedSupplier)}
                        title="Επεξεργασία"
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <Icon name="edit" className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRequestDelete(selectedSupplier)}
                        title="Διαγραφή"
                        className="p-2 rounded-full text-light-text-secondary hover:text-red-600 dark:text-dark-text-secondary dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Icon name="trash-2" className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Βασικές πληροφορίες προμηθευτή */}
              <div className="mt-6 space-y-4">
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">
                    Υπεύθυνος Επικοινωνίας
                  </h4>
                  <p className="text-lg font-medium">
                    {selectedSupplier.contactPerson || '-'}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">
                    Τηλέφωνο
                  </h4>
                  <p className="text-lg font-medium">
                    {selectedSupplier.phone || '-'}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">
                    Email
                  </h4>
                  <p className="text-lg font-medium">
                    {selectedSupplier.email || '-'}
                  </p>
                </div>
              </div>

              {/* 🧠 AI Supplier Coach */}
              <div className="mt-6 bg-purple-50/80 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-2xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      name="sparkles"
                      className="w-5 h-5 text-purple-500 dark:text-purple-300"
                    />
                    <div>
                      <h3 className="text-sm font-heading font-semibold text-purple-800 dark:text-purple-100">
                        AI Supplier Coach
                      </h3>
                      <p className="text-[11px] text-purple-700/80 dark:text-purple-200/80">
                        Προτάσεις για συνεργασία & διαπραγμάτευση με προμηθευτές.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAiSupplierAdvice}
                    disabled={aiLoading}
                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon name="message-circle" className="w-4 h-4" />
                    {aiLoading ? 'Γίνεται ανάλυση...' : 'Πάρε προτάσεις'}
                  </button>
                </div>

                <div className="mt-2 text-sm text-purple-900 dark:text-purple-100 max-h-64 overflow-y-auto border-t border-purple-200/60 dark:border-purple-700/60 pt-2">
                  {aiError && (
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {aiError}
                    </p>
                  )}

                  {!aiError && aiAdvice && (
                    <pre className="whitespace-pre-wrap font-sans">
                      {aiAdvice}
                    </pre>
                  )}

                  {!aiError && !aiAdvice && !aiLoading && (
                    <p className="text-sm">
                      Επίλεξε έναν προμηθευτή και πάτησε{' '}
                      <strong>“Πάρε προτάσεις”</strong> για να δεις:
                      <br />
                      • πώς να οργανώσεις καλύτερα τους προμηθευτές σου, <br />
                      • ιδέες για διαπραγμάτευση & review συνεργασιών, <br />
                      • συγκεκριμένα επόμενα βήματα για τον Chef / F&B Manager.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 h-full text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
              <div className="flex-1 flex items-center justify-center">
                <p>Επιλέξτε ή δημιουργήστε έναν προμηθευτή</p>
              </div>

              {/* Μικρό overview ακόμη κι όταν δεν έχει επιλεγεί supplier */}
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg text-xs">
                <h4 className="font-semibold mb-1">Σύνοψη Προμηθευτών</h4>
                <p>Σύνολο: {supplierStats.total}</p>
                <p>Με τηλέφωνο: {supplierStats.withPhone}</p>
                <p>Με email: {supplierStats.withEmail}</p>
                <p>Με πλήρη στοιχεία (τηλ + email): {supplierStats.withBoth}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSupplier}
        supplierToEdit={supplierToEdit}
      />

      <ConfirmationModal
        isOpen={!!supplierToDelete}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Διαγραφή Προμηθευτή"
        body={
          <p>
            Είστε σίγουροι ότι θέλετε να διαγράψετε τον προμηθευτή "
            {supplierToDelete?.name}";
          </p>
        }
      />
    </>
  );
};

export default SupplierView;
