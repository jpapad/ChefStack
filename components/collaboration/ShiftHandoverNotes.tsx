import React, { useState, useMemo } from 'react';
import { Shift, User, Team } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

export interface HandoverNote {
  id: string;
  shiftId: string;
  fromUserId: string;
  toUserId: string;
  teamId: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

interface ShiftHandoverNotesProps {
  shifts: Shift[];
  users: User[];
  currentUserId: string;
  currentTeamId: string;
  handoverNotes: HandoverNote[];
  onAddNote: (note: Omit<HandoverNote, 'id' | 'createdAt' | 'acknowledged'>) => void;
  onAcknowledgeNote: (noteId: string) => void;
}

const ShiftHandoverNotes: React.FC<ShiftHandoverNotesProps> = ({
  shifts,
  users,
  currentUserId,
  currentTeamId,
  handoverNotes,
  onAddNote,
  onAcknowledgeNote,
}) => {
  const { t, language } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showFilter, setShowFilter] = useState<'all' | 'received' | 'sent'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | HandoverNote['priority']>('all');

  const [formData, setFormData] = useState({
    shiftId: '',
    toUserId: '',
    content: '',
    priority: 'medium' as HandoverNote['priority'],
  });

  // Filter notes
  const filteredNotes = useMemo(() => {
    let notes = handoverNotes.filter(note => {
      if (showFilter === 'received') return note.toUserId === currentUserId;
      if (showFilter === 'sent') return note.fromUserId === currentUserId;
      return note.fromUserId === currentUserId || note.toUserId === currentUserId;
    });

    if (priorityFilter !== 'all') {
      notes = notes.filter(note => note.priority === priorityFilter);
    }

    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [handoverNotes, currentUserId, showFilter, priorityFilter]);

  // Unacknowledged notes count
  const unacknowledgedCount = useMemo(() => {
    return handoverNotes.filter(note => note.toUserId === currentUserId && !note.acknowledged).length;
  }, [handoverNotes, currentUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shiftId || !formData.toUserId || !formData.content.trim()) {
      alert('Συμπληρώστε όλα τα πεδία');
      return;
    }

    onAddNote({
      shiftId: formData.shiftId,
      fromUserId: currentUserId,
      toUserId: formData.toUserId,
      teamId: currentTeamId,
      content: formData.content.trim(),
      priority: formData.priority,
    });

    setFormData({
      shiftId: '',
      toUserId: '',
      content: '',
      priority: 'medium',
    });
    setIsFormOpen(false);
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getShiftInfo = (shiftId: string): string => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return 'Unknown Shift';
    const date = new Date(shift.date).toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US');
    return `${shift.shiftType} - ${date}`;
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };

  const priorityIcons = {
    low: 'arrow-down',
    medium: 'minus',
    high: 'arrow-up',
  };

  const priorityLabels = {
    low: language === 'el' ? 'Χαμηλή' : 'Low',
    medium: language === 'el' ? 'Μεσαία' : 'Medium',
    high: language === 'el' ? 'Υψηλή' : 'High',
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="clipboard" className="w-6 h-6 text-brand-yellow" />
          <div>
            <h2 className="text-2xl font-heading font-bold text-light-text dark:text-dark-text">
              {language === 'el' ? 'Σημειώσεις Αλλαγής Βάρδιας' : 'Shift Handover Notes'}
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {language === 'el' ? 'Επικοινωνία μεταξύ βαρδιών' : 'Communication between shifts'}
            </p>
          </div>
          {unacknowledgedCount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              {unacknowledgedCount} {language === 'el' ? 'νέες' : 'new'}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-light-text rounded-lg hover:bg-opacity-90 transition-all shadow-md"
        >
          <Icon name="plus" className="w-4 h-4" />
          {language === 'el' ? 'Νέα Σημείωση' : 'New Note'}
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-light-text dark:text-dark-text">
                {language === 'el' ? 'Βάρδια' : 'Shift'}
              </label>
              <select
                value={formData.shiftId}
                onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text"
                required
              >
                <option value="">{language === 'el' ? 'Επιλέξτε βάρδια' : 'Select shift'}</option>
                {shifts
                  .filter(s => s.teamId === currentTeamId)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 20)
                  .map(shift => (
                    <option key={shift.id} value={shift.id}>
                      {shift.shiftType} - {new Date(shift.date).toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-light-text dark:text-dark-text">
                {language === 'el' ? 'Προς' : 'To'}
              </label>
              <select
                value={formData.toUserId}
                onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text"
                required
              >
                <option value="">{language === 'el' ? 'Επιλέξτε χρήστη' : 'Select user'}</option>
                {users
                  .filter(u => u.teamId === currentTeamId && u.id !== currentUserId)
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1 text-light-text dark:text-dark-text">
              {language === 'el' ? 'Προτεραιότητα' : 'Priority'}
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                    formData.priority === priority
                      ? priorityColors[priority] + ' ring-2 ring-offset-2 ring-brand-yellow'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {priorityLabels[priority]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1 text-light-text dark:text-dark-text">
              {language === 'el' ? 'Σημείωση' : 'Note'}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text resize-none"
              placeholder={language === 'el' ? 'Γράψε τη σημείωση σου εδώ...' : 'Write your note here...'}
              required
            />
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setFormData({ shiftId: '', toUserId: '', content: '', priority: 'medium' });
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              {language === 'el' ? 'Ακύρωση' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-yellow text-light-text rounded-lg hover:bg-opacity-90"
            >
              {language === 'el' ? 'Αποθήκευση' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 items-center flex-wrap">
        <div className="flex gap-2">
          {(['all', 'received', 'sent'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setShowFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                showFilter === filter
                  ? 'bg-brand-yellow text-light-text'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {filter === 'all' && (language === 'el' ? 'Όλες' : 'All')}
              {filter === 'received' && (language === 'el' ? 'Ληφθείσες' : 'Received')}
              {filter === 'sent' && (language === 'el' ? 'Απεσταλμένες' : 'Sent')}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-slate-600" />

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
          className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text text-sm"
        >
          <option value="all">{language === 'el' ? 'Όλες οι προτεραιότητες' : 'All priorities'}</option>
          <option value="high">{priorityLabels.high}</option>
          <option value="medium">{priorityLabels.medium}</option>
          <option value="low">{priorityLabels.low}</option>
        </select>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <Icon name="clipboard" className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'el' ? 'Δεν υπάρχουν σημειώσεις' : 'No notes found'}
            </p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const isReceived = note.toUserId === currentUserId;
            const fromUser = getUserName(note.fromUserId);
            const toUser = getUserName(note.toUserId);
            const shiftInfo = getShiftInfo(note.shiftId);
            const timeAgo = new Date(note.createdAt).toLocaleString(language === 'el' ? 'el-GR' : 'en-US');

            return (
              <div
                key={note.id}
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border-l-4 ${
                  note.priority === 'high' ? 'border-red-500' :
                  note.priority === 'medium' ? 'border-yellow-500' :
                  'border-green-500'
                } ${!note.acknowledged && isReceived ? 'ring-2 ring-brand-yellow' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        name={isReceived ? 'arrow-down-circle' : 'arrow-up-circle'}
                        className={`w-4 h-4 ${isReceived ? 'text-blue-500' : 'text-purple-500'}`}
                      />
                      <span className="text-sm font-semibold text-light-text dark:text-dark-text">
                        {isReceived ? `${language === 'el' ? 'Από' : 'From'}: ${fromUser}` : `${language === 'el' ? 'Προς' : 'To'}: ${toUser}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[note.priority]}`}>
                        <Icon name={priorityIcons[note.priority]} className="w-3 h-3 inline mr-1" />
                        {priorityLabels[note.priority]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {shiftInfo} • {timeAgo}
                    </p>
                  </div>

                  {isReceived && !note.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeNote(note.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-all"
                    >
                      <Icon name="check" className="w-3 h-3" />
                      {language === 'el' ? 'Επιβεβαίωση' : 'Acknowledge'}
                    </button>
                  )}

                  {note.acknowledged && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Icon name="check-circle" className="w-3 h-3" />
                      {language === 'el' ? 'Επιβεβαιώθηκε' : 'Acknowledged'}
                    </span>
                  )}
                </div>

                <p className="text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShiftHandoverNotes;
