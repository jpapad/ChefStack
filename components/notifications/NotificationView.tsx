import React, { useMemo, useState, useRef, useEffect } from 'react';
import { User, Message, Channel } from '../../types';
import { Icon } from '../common/Icon';
import { api } from '../../services/api';

type WalkieSettings = {
  soundEnabled: boolean;
  desktopEnabled: boolean;
};

interface NotificationViewProps {
  currentUser: User;
  currentTeamId: string;
  allUsers: User[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  allChannels: Channel[];
  setAllChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  walkieSettings: WalkieSettings;
  setWalkieSettings: React.Dispatch<React.SetStateAction<WalkieSettings>>;
}

/** 🔢 Quick templates με shortcuts */
const QUICK_SERVICE_TEMPLATES = [
  { key: '1', text: 'Order up στο pass!' },
  { key: '2', text: 'Νέα παραγγελία σε αναμονή' },
  { key: '3', text: 'Χαμηλό απόθεμα – έλεγχος αποθήκης' },
  { key: '4', text: 'Χρειάζομαι βοήθεια στην κουζίνα' },
  { key: '5', text: 'Καθαρισμός πάγκων τώρα' }
];

const QUICK_HACCP_TEMPLATES = [
  { key: '6', text: 'Έλεγχος θερμοκρασίας ψυγείων' },
  { key: '7', text: 'Έλεγχος ημερομηνιών λήξης' },
  { key: '8', text: 'Έλεγχος καθαριότητας πάγκων' },
  { key: '9', text: 'Έλεγχος απολύμανσης εργαλείων' }
];

const ALL_QUICK_TEMPLATES = [
  ...QUICK_SERVICE_TEMPLATES,
  ...QUICK_HACCP_TEMPLATES
];

type ViewMode = 'announcements' | 'chat' | 'quick';

const NotificationView: React.FC<NotificationViewProps> = ({
  currentUser,
  currentTeamId,
  allUsers,
  messages,
  setMessages,
  allChannels,
  setAllChannels,
  walkieSettings,
  setWalkieSettings
}) => {
  // 🔀 Κανάλια μόνο για την τρέχουσα ομάδα
  const teamChannels = useMemo(
    () => allChannels.filter((c) => c.teamId === currentTeamId),
    [allChannels, currentTeamId]
  );

  // 📌 Pinned κανάλια (localStorage)
  const pinnedStorageKey = useMemo(
    () => `walkie_pinned_${currentUser.id}_${currentTeamId}`,
    [currentUser.id, currentTeamId]
  );
  const [pinnedChannelIds, setPinnedChannelIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(pinnedStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setPinnedChannelIds(parsed);
      }
    } catch (e) {
      console.warn('[NotificationView] failed to parse pinned channels', e);
    }
  }, [pinnedStorageKey]);

  // Καθάρισμα pinned που δεν υπάρχουν πλέον
  useEffect(() => {
    setPinnedChannelIds((prev) => {
      const validIds = prev.filter((id) =>
        teamChannels.some((c) => c.id === id)
      );
      if (validIds.length !== prev.length) {
        try {
          localStorage.setItem(pinnedStorageKey, JSON.stringify(validIds));
        } catch (e) {
          console.warn('[NotificationView] failed to save pinned channels', e);
        }
      }
      return validIds;
    });
  }, [teamChannels, pinnedStorageKey]);

  const togglePinChannel = (channelId: string) => {
    setPinnedChannelIds((prev) => {
      let next: string[];
      if (prev.includes(channelId)) {
        next = prev.filter((id) => id !== channelId);
      } else {
        next = [...prev, channelId];
      }
      try {
        localStorage.setItem(pinnedStorageKey, JSON.stringify(next));
      } catch (e) {
        console.warn('[NotificationView] failed to persist pinned channels', e);
      }
      return next;
    });
  };

  // Κανάλια με pinned πρώτα
  const sortedChannels = useMemo(() => {
    const base = [...teamChannels];
    base.sort((a, b) => {
      const aPinned = pinnedChannelIds.includes(a.id);
      const bPinned = pinnedChannelIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return a.name.localeCompare(b.name, 'el');
    });
    return base;
  }, [teamChannels, pinnedChannelIds]);

  // 🎯 Επιλεγμένο κανάλι
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    sortedChannels[0]?.id ?? null
  );

  useEffect(() => {
    if (!selectedChannelId && sortedChannels.length > 0) {
      setSelectedChannelId(sortedChannels[0].id);
    }
  }, [selectedChannelId, sortedChannels]);

  // 🧭 Προβολή (Announcements / Chat / Quick)
  const [viewMode, setViewMode] = useState<ViewMode>('chat');

  // ✍️ Input για νέο μήνυμα
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🔍 Αναζήτηση μέσα στο κανάλι
  const [searchTerm, setSearchTerm] = useState('');

  // ⚙️ Ανοιχτό μενού ⋯ για κανάλι
  const [openMenuChannelId, setOpenMenuChannelId] = useState<string | null>(
    null
  );

  // 📦 localStorage key για unread state
  const readStorageKey = useMemo(
    () => `walkie_read_${currentUser.id}_${currentTeamId}`,
    [currentUser.id, currentTeamId]
  );

  /**
   * 📚 channelReadState:
   * channelId -> ISO timestamp τελευταίου "διαβασμένου" μηνύματος
   */
  const [channelReadState, setChannelReadState] = useState<
    Record<string, string>
  >({});

  // Φόρτωμα από localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(readStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setChannelReadState(parsed);
      }
    } catch (e) {
      console.warn('[NotificationView] failed to parse read-state', e);
    }
  }, [readStorageKey]);

  // Αρχικοποίηση default read state για όσα κανάλια δεν έχουν ακόμα
  useEffect(() => {
    setChannelReadState((prev) => {
      const next = { ...prev };
      let changed = false;

      teamChannels.forEach((ch) => {
        if (!next[ch.id]) {
          // Παίρνουμε το νεότερο μήνυμα του καναλιού (αν υπάρχει) ως "ήδη διαβασμένο"
          const chMessages = messages.filter(
            (m) => (m as any).channelId === ch.id
          );
          let lastReadDate = new Date();
          if (chMessages.length > 0) {
            const newest = chMessages.reduce((acc, m) => {
              const d =
                (m as any).createdAt instanceof Date
                  ? (m as any).createdAt
                  : new Date((m as any).createdAt);
              return d > acc ? d : acc;
            }, new Date(0));
            if (newest.getTime() > 0) {
              lastReadDate = newest;
            }
          }
          next[ch.id] = lastReadDate.toISOString();
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [teamChannels, messages]);

  // Αποθήκευση στο localStorage όταν αλλάζει το read state
  useEffect(() => {
    try {
      localStorage.setItem(readStorageKey, JSON.stringify(channelReadState));
    } catch (e) {
      console.warn('[NotificationView] failed to save read-state', e);
    }
  }, [channelReadState, readStorageKey]);

  // 🔍 Μηνύματα μόνο του τρέχοντος καναλιού (όλα)
  const allChannelMessages = useMemo(() => {
    if (!selectedChannelId) return [] as Message[];
    return messages
      .filter((m) => (m as any).channelId === selectedChannelId)
      .sort((a, b) => {
        const ta =
          (a as any).createdAt instanceof Date
            ? (a as any).createdAt.getTime()
            : new Date((a as any).createdAt).getTime();
        const tb =
          (b as any).createdAt instanceof Date
            ? (b as any).createdAt.getTime()
            : new Date((b as any).createdAt).getTime();
        return ta - tb;
      });
  }, [messages, selectedChannelId]);

  // 🔍 Φιλτραρισμένα σύμφωνα με searchTerm
  const visibleChannelMessages = useMemo(() => {
    if (!searchTerm.trim()) return allChannelMessages;
    const q = searchTerm.toLowerCase();

    return allChannelMessages.filter((m) => {
      const text = ((m as any).content || '')
        .toString()
        .toLowerCase();
      const user = allUsers.find((u) => u.id === (m as any).userId);
      const uname = (user?.name || '').toLowerCase();
      return text.includes(q) || uname.includes(q);
    });
  }, [allChannelMessages, searchTerm, allUsers]);

  // 📌 Όταν ανοίγουμε ένα κανάλι, το θεωρούμε "διαβασμένο" μέχρι το πιο πρόσφατο μήνυμα
  useEffect(() => {
    if (!selectedChannelId || allChannelMessages.length === 0) return;

    const newest = allChannelMessages[allChannelMessages.length - 1];
    const newestDate =
      (newest as any).createdAt instanceof Date
        ? (newest as any).createdAt
        : new Date((newest as any).createdAt);

    setChannelReadState((prev) => {
      const prevIso = prev[selectedChannelId];
      if (prevIso) {
        const prevDate = new Date(prevIso);
        if (prevDate.getTime() >= newestDate.getTime()) {
          return prev; // δεν υπάρχει κάτι νεότερο
        }
      }
      return {
        ...prev,
        [selectedChannelId]: newestDate.toISOString()
      };
    });
  }, [selectedChannelId, allChannelMessages]);

  // Scroll πάντα στο τέλος όταν αλλάζουν τα μηνύματα (και ΔΕΝ έχει ενεργή αναζήτηση)
  useEffect(() => {
    if (messagesEndRef.current && !searchTerm.trim()) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleChannelMessages, searchTerm]);

  const selectedChannel = useMemo(
    () => teamChannels.find((c) => c.id === selectedChannelId) || null,
    [teamChannels, selectedChannelId]
  );

  // 🧮 Γρήγορα statistics per channel (σύνολο + UNREAD)
  const channelMeta = useMemo(() => {
    const meta: Record<
      string,
      { lastMessageAt: string | null; count: number; unread: number }
    > = {};

    for (const ch of teamChannels) {
      meta[ch.id] = { lastMessageAt: null, count: 0, unread: 0 };
    }

    for (const m of messages) {
      const chId = (m as any).channelId as string | undefined;
      if (!chId || !meta[chId]) continue;

      const created =
        (m as any).createdAt instanceof Date
          ? (m as any).createdAt
          : new Date((m as any).createdAt);

      meta[chId].count += 1;
      meta[chId].lastMessageAt = created.toLocaleTimeString('el-GR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const lastReadIso = channelReadState[chId];
      const lastReadDate = lastReadIso ? new Date(lastReadIso) : null;
      if (!lastReadDate || created.getTime() > lastReadDate.getTime()) {
        meta[chId].unread += 1;
      }
    }

    return meta;
  }, [messages, teamChannels, channelReadState]);

  // 🧑‍🍳 Typing indicator (local – για τον τρέχοντα χρήστη)
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const registerTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  // 💬 @mentions state
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const mentionSuggestions = useMemo(() => {
    if (!mentionQuery.trim()) return allUsers.filter(u => u.id !== currentUser.id);
    const q = mentionQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.id !== currentUser.id &&
        (u.name || '').toLowerCase().includes(q)
    );
  }, [mentionQuery, allUsers, currentUser.id]);

  const updateMentionState = (text: string) => {
    const match = /@([^\s@]{0,20})$/.exec(text);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentionList(true);
    } else {
      setMentionQuery('');
      setShowMentionList(false);
    }
  };

  const handleSelectMention = (userToMention: User) => {
    setMessageInput((prev) =>
      prev.replace(/@([^\s@]{0,20})$/, '@' + userToMention.name + ' ')
    );
    setShowMentionList(false);
  };

  const handleSendMessage = async () => {
    if (!selectedChannelId) {
      alert('Επίλεξε πρώτα ένα κανάλι.');
      return;
    }
    const text = messageInput.trim();
    if (!text) return;

    setIsSending(true);
    try {
      const saved = await api.saveMessage({
        teamId: currentTeamId as any,
        channelId: selectedChannelId as any,
        userId: currentUser.id as any,
        content: text as any
      } as any);

      setMessages((prev) =>
        prev.some((m) => (m as any).id === (saved as any).id)
          ? prev
          : [...prev, saved]
      );

      setMessageInput('');
      setShowMentionList(false);
      setMentionQuery('');
    } catch (e) {
      console.error('Failed to send message', e);
      alert('Αποτυχία αποστολής μηνύματος.');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickMessage = (template: string) => {
    setMessageInput((prev) =>
      prev && !prev.endsWith(' ')
        ? prev + ' ' + template
        : (prev || '') + template
    );
    updateMentionState(
      (messageInput && !messageInput.endsWith(' ')
        ? messageInput + ' ' + template
        : (messageInput || '') + template) || ''
    );
  };

  const handleCreateChannel = async () => {
    const name = window.prompt(
      'Όνομα νέου καναλιού (π.χ. Κουζίνα, Σάλα, Pass):'
    );
    if (!name) return;

    try {
      const saved = await api.saveChannel({
        name: name as any,
        teamId: currentTeamId as any
      } as any);

      setAllChannels((prev) =>
        prev.some((c) => c.id === saved.id) ? prev : [...prev, saved]
      );
      setSelectedChannelId(saved.id);
    } catch (e) {
      console.error('Failed to create channel', e);
      alert('Αποτυχία δημιουργίας καναλιού.');
    }
  };

  const handleRenameChannel = async (channel: Channel) => {
    const newName = window.prompt('Νέο όνομα καναλιού:', channel.name);
    if (!newName) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === channel.name) return;

    try {
      const saved = await api.saveChannel({
        ...channel,
        name: trimmed
      } as any);

      setAllChannels((prev) =>
        prev.map((c) => (c.id === saved.id ? saved : c))
      );
      setOpenMenuChannelId(null);
    } catch (e) {
      console.error('Failed to rename channel', e);
      alert('Αποτυχία μετονομασίας καναλιού.');
    }
  };

  const handleDeleteChannel = async (channel: Channel) => {
    const ok = window.confirm(
      `Σίγουρα θέλεις να διαγράψεις το κανάλι "${channel.name}" ;`
    );
    if (!ok) return;

    try {
      await api.deleteChannel(channel.id);

      setAllChannels((prev) => prev.filter((c) => c.id !== channel.id));

      // Αν διαγράφεται το ενεργό κανάλι, διάλεξε κάποιο άλλο
      setSelectedChannelId((current) => {
        if (current !== channel.id) return current;
        const remaining = teamChannels.filter((c) => c.id !== channel.id);
        return remaining[0]?.id ?? null;
      });

      // Καθάρισε και το read-state για αυτό το κανάλι
      setChannelReadState((prev) => {
        const { [channel.id]: _removed, ...rest } = prev;
        return rest;
      });

      setOpenMenuChannelId(null);
    } catch (e) {
      console.error('Failed to delete channel', e);
      alert('Αποτυχία διαγραφής καναλιού.');
    }
  };

  /** ⌨️ Keyboard shortcuts:
   *  - Ctrl/Cmd + Enter -> Send
   *  - 1–9 -> Quick templates (εκτός input)
   */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          (target as any).isContentEditable);

      // Ctrl/Cmd + Enter -> Send (και όταν γράφεις μέσα στο textarea)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
        return;
      }

      // Αριθμοί 1–9 για quick templates, ΜΟΝΟ εκτός input/textarea
      if (isEditable) return;

      const found = ALL_QUICK_TEMPLATES.find((tpl) => tpl.key === e.key);
      if (found) {
        e.preventDefault();
        handleQuickMessage(found.text);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quickMessagesService = QUICK_SERVICE_TEMPLATES;
  const quickMessagesHaccp = QUICK_HACCP_TEMPLATES;

  // 🧩 Helper: Label ανά ημέρα (Σήμερα / Χθες / ημερομηνία)
  const formatDayLabel = (d: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(d, today)) return 'Σήμερα';
    if (isSameDay(d, yesterday)) return 'Χθες';

    return d.toLocaleDateString('el-GR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  // 👇 Grouping per day
  const groupedMessages = useMemo(() => {
    const groups: {
      label: string;
      dateKey: string;
      items: Message[];
    }[] = [];

    visibleChannelMessages.forEach((m) => {
      const created =
        (m as any).createdAt instanceof Date
          ? (m as any).createdAt
          : new Date((m as any).createdAt);

      const dateKey = created.toISOString().slice(0, 10); // YYYY-MM-DD
      let group = groups.find((g) => g.dateKey === dateKey);
      if (!group) {
        group = {
          label: formatDayLabel(created),
          dateKey,
          items: []
        };
        groups.push(group);
      }
      group.items.push(m);
    });

    return groups;
  }, [visibleChannelMessages]);

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@\S+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        return (
          <span key={idx} className="text-amber-300 font-semibold">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // 🔊 Ρυθμίσεις Walkie
  const toggleSound = () => {
    setWalkieSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const toggleDesktop = () => {
    // Αν ενεργοποιείται, ζήτα άδεια από το browser Notification API
    if (!walkieSettings.desktopEnabled && typeof window !== 'undefined') {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              setWalkieSettings((prev) => ({
                ...prev,
                desktopEnabled: true
              }));
            }
          });
          return;
        }
        if (Notification.permission === 'granted') {
          setWalkieSettings((prev) => ({
            ...prev,
            desktopEnabled: true
          }));
          return;
        }
        // Αν είναι denied, απλά δεν αλλάζουμε σε true
        return;
      }
    }

    // Αν απενεργοποιείται ή δεν υπάρχει Notification API
    setWalkieSettings((prev) => ({
      ...prev,
      desktopEnabled: !prev.desktopEnabled
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
      {/* 🧭 Sidebar: Κανάλια */}
      <aside className="bg-white/70 dark:bg-slate-900/70 backdrop-blur border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-md p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold flex items-center gap-2">
            <Icon name="radio" className="w-4 h-4 text-brand-yellow" />
            Κανάλια
          </h2>
          <button
            type="button"
            onClick={handleCreateChannel}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            title="Νέο κανάλι"
          >
            <Icon name="plus" className="w-4 h-4" />
          </button>
        </div>

        {sortedChannels.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Δεν υπάρχουν κανάλια για αυτή την ομάδα. Δημιούργησε ένα νέο.
          </p>
        ) : (
          <ul className="flex-1 overflow-y-auto space-y-1 text-sm">
            {sortedChannels.map((ch) => {
              const meta = channelMeta[ch.id] || {
                count: 0,
                lastMessageAt: null,
                unread: 0
              };
              const isActive = ch.id === selectedChannelId;
              const isMenuOpen = openMenuChannelId === ch.id;
              const isPinned = pinnedChannelIds.includes(ch.id);

              return (
                <li key={ch.id} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChannelId(ch.id);
                      setOpenMenuChannelId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs ${
                      isActive
                        ? 'bg-brand-yellow text-brand-dark'
                        : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-black/10 dark:hover:bg-white/15'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold truncate flex items-center gap-1">
                        {ch.name}
                        {isPinned && (
                          <Icon
                            name="star"
                            className="w-3 h-3 text-amber-300"
                          />
                        )}
                      </span>
                      <span className="text-[10px] opacity-80">
                        Μηνύματα: {meta.count}
                        {meta.lastMessageAt && ` • Τελ.: ${meta.lastMessageAt}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {meta.unread > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] px-1 h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {meta.unread}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinChannel(ch.id);
                        }}
                        className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        title={
                          isPinned
                            ? 'Ξεκαρφίτσωμα καναλιού'
                            : 'Καρφίτσωμα καναλιού'
                        }
                      >
                        <Icon
                          name="star"
                          className={`w-3 h-3 ${
                            isPinned
                              ? 'text-amber-300'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuChannelId((prev) =>
                            prev === ch.id ? null : ch.id
                          );
                        }}
                        className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        title="Επιλογές καναλιού"
                      >
                        <Icon name="more-vertical" className="w-3 h-3" />
                      </button>
                    </div>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-2 top-9 z-20 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleRenameChannel(ch)}
                        className="w-full px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
                      >
                        <Icon name="edit-2" className="w-3 h-3" />
                        Μετονομασία
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChannel(ch)}
                        className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center gap-2"
                      >
                        <Icon name="trash-2" className="w-3 h-3" />
                        Διαγραφή
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* 📡 Κεντρικό: Μηνύματα καναλιού */}
      <section className="lg:col-span-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-md p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-heading font-semibold flex items-center gap-2">
              <Icon
                name="message-circle"
                className="w-4 h-4 text-emerald-500"
              />
              {selectedChannel ? selectedChannel.name : 'Χωρίς κανάλι'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Εσωτερική επικοινωνία ομάδας – Walkie Talkie mode.
            </p>
          </div>

          {/* Toggle για mode (UI μόνο προς το παρόν) */}
          <div className="inline-flex rounded-full bg-black/5 dark:bg-white/10 p-1 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode('chat')}
              className={`px-2 py-1 rounded-full ${
                viewMode === 'chat'
                  ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-slate-50'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setViewMode('announcements')}
              className={`px-2 py-1 rounded-full ${
                viewMode === 'announcements'
                  ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-slate-50'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              Ανακοινώσεις
            </button>
            <button
              type="button"
              onClick={() => setViewMode('quick')}
              className={`px-2 py-1 rounded-full ${
                viewMode === 'quick'
                  ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-slate-50'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              Quick
            </button>
          </div>
        </div>

        {/* 🔍 Αναζήτηση στο κανάλι */}
        <div className="mb-3">
          <div className="relative">
            <Icon
              name="search"
              className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Αναζήτηση στα μηνύματα του καναλιού (κείμενο ή όνομα)..."
              className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
            />
          </div>
        </div>

        {/* Λίστα μηνυμάτων */}
        <div className="flex-1 overflow-y-auto border border-slate-100/70 dark:border-slate-700/70 rounded-xl p-3 mb-2 bg-white/60 dark:bg-slate-900/40">
          {selectedChannelId == null ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Επίλεξε ένα κανάλι για να δεις τα μηνύματα.
            </p>
          ) : allChannelMessages.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Δεν υπάρχουν μηνύματα σε αυτό το κανάλι ακόμα. Γράψε το πρώτο!
            </p>
          ) : visibleChannelMessages.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Δεν βρέθηκαν μηνύματα που να ταιριάζουν με αυτή την αναζήτηση.
            </p>
          ) : (
            <ul className="space-y-3 text-xs">
              {groupedMessages.map((group) => (
                <li key={group.dateKey}>
                  <div className="flex items-center mb-1">
                    <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
                    <span className="px-2 text-[10px] text-slate-500 dark:text-slate-400">
                      {group.label}
                    </span>
                    <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <ul className="space-y-2">
                    {group.items.map((m) => {
                      const user = allUsers.find(
                        (u) => u.id === (m as any).userId
                      );
                      const isMine = (m as any).userId === currentUser.id;
                      const ts =
                        (m as any).createdAt instanceof Date
                          ? (m as any).createdAt
                          : new Date((m as any).createdAt);
                      const timeLabel = ts.toLocaleTimeString('el-GR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const content = ((m as any).content || '') as string;

                      return (
                        <li
                          key={(m as any).id}
                          className={`flex ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                              isMine
                                ? 'bg-emerald-500 text-white rounded-br-sm'
                                : 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-slate-50 rounded-bl-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="font-semibold">
                                {user?.name || 'Μέλος'}
                              </span>
                              <span className="text-[10px] opacity-80">
                                {timeLabel}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">
                              {renderMessageContent(content)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
              <div ref={messagesEndRef} />
            </ul>
          )}
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            Πληκτρολογείς μήνυμα…
          </div>
        )}

        {/* Input για νέο μήνυμα + @mentions */}
        <div className="mt-auto">
          <div className="relative">
            <div className="flex items-center gap-2">
              <textarea
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  registerTyping();
                  updateMentionState(e.target.value);
                }}
                onKeyDown={() => {
                  registerTyping();
                }}
                rows={2}
                placeholder={
                  selectedChannel
                    ? `Μήνυμα στο κανάλι "${selectedChannel.name}"... (Ctrl+Enter για αποστολή, @όνομα για mention)`
                    : 'Επίλεξε κανάλι για να στείλεις μήνυμα...'
                }
                className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 resize-none"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!selectedChannelId || !messageInput.trim() || isSending}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-brand-yellow text-brand-dark text-xs font-semibold hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="send" className="w-4 h-4" />
                Αποστολή
              </button>
            </div>

            {/* @mention suggestions */}
            {showMentionList && mentionSuggestions.length > 0 && (
              <div className="absolute left-0 bottom-[56px] z-30 w-64 max-h-40 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg text-[11px]">
                {mentionSuggestions.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectMention(u)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-semibold">
                      {u.name?.[0] || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{u.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        @{u.email?.split('@')[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 📢 Δεξιά: Quick Walkie + Templates + Ρυθμίσεις */}
      <aside className="bg-white/70 dark:bg-slate-900/70 backdrop-blur border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-md p-4 flex flex-col gap-4">
        {/* Ρυθμίσεις Walkie */}
        <div className="border border-slate-200/70 dark:border-slate-700/70 rounded-xl p-3 bg-white/60 dark:bg-slate-900/40">
          <h3 className="text-sm font-heading font-semibold mb-2 flex items-center gap-2">
            <Icon name="sliders" className="w-4 h-4 text-sky-500" />
            Ρυθμίσεις Walkie
          </h3>
          <div className="space-y-2 text-[11px]">
            <button
              type="button"
              onClick={toggleSound}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <Icon
                  name={walkieSettings.soundEnabled ? 'volume-2' : 'volume-x'}
                  className="w-3 h-3"
                />
                Ήχος νέου μηνύματος
              </span>
              <span
                className={`inline-flex items-center justify-center w-10 h-5 rounded-full text-[10px] ${
                  walkieSettings.soundEnabled
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                }`}
              >
                {walkieSettings.soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleDesktop}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg:white/10"
            >
              <span className="flex items-center gap-2">
                <Icon
                  name="monitor"
                  className="w-3 h-3"
                />
                Desktop ειδοποιήσεις
              </span>
              <span
                className={`inline-flex items-center justify-center w-10 h-5 rounded-full text-[10px] ${
                  walkieSettings.desktopEnabled
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                }`}
              >
                {walkieSettings.desktopEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Οι ρυθμίσεις αποθηκεύονται για τον χρήστη σου σε αυτή την ομάδα.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-heading font-semibold mb-2 flex items-center gap-2">
            <Icon name="zap" className="w-4 h-4 text-amber-500" />
            Quick Service Messages
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickMessagesService.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => handleQuickMessage(q.text)}
                className="text-[11px] px-2 py-1 rounded-full border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 dark:border-amber-500 dark:text-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 flex items-center gap-1"
              >
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-200 text-[9px] font-bold">
                  {q.key}
                </span>
                {q.text}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-heading font-semibold mb-2 flex items-center gap-2">
            <Icon name="shield" className="w-4 h-4 text-emerald-500" />
            HACCP / Safety Reminders
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickMessagesHaccp.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => handleQuickMessage(q.text)}
                className="text-[11px] px-2 py-1 rounded-full border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-500 dark:text-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 flex items-center gap-1"
              >
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-200 text-[9px] font-bold">
                  {q.key}
                </span>
                {q.text}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-auto text-[11px] text-slate-500 dark:text-slate-400">
          Πάτα ένα από τα quick μηνύματα ή τα νούμερα 1–9 στο πληκτρολόγιο για
          να συμπληρωθεί το πεδίο κειμένου και στείλ’ το στο κατάλληλο κανάλι.
          Χρησιμοποίησε Ctrl+Enter για γρήγορη αποστολή, σαν walkie-talkie.
        </p>
      </aside>
    </div>
  );
};

export default NotificationView;
