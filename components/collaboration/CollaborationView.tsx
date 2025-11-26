import React, { useState } from 'react';
import { Shift, User, Team, TeamTask, ChatMessage } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import ShiftHandoverNotes, { HandoverNote } from './ShiftHandoverNotes';
import NotificationCenter, { Notification } from './NotificationCenter';
import TeamTasks from './TeamTasks';
import TeamChat from './TeamChat';

interface CollaborationViewProps {
  shifts: Shift[];
  users: User[];
  teams: Team[];
  currentUserId: string;
  currentTeamId: string;
  handoverNotes: HandoverNote[];
  notifications: Notification[];
  tasks: TeamTask[];
  chatMessages: ChatMessage[];
  onAddHandoverNote: (note: Omit<HandoverNote, 'id' | 'createdAt' | 'acknowledged'>) => void;
  onAcknowledgeNote: (noteId: string) => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onAddTask: (task: Omit<TeamTask, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<TeamTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
}

const CollaborationView: React.FC<CollaborationViewProps> = ({
  shifts,
  users,
  teams,
  currentUserId,
  currentTeamId,
  handoverNotes,
  notifications,
  tasks,
  chatMessages,
  onAddHandoverNote,
  onAcknowledgeNote,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onSendMessage,
  onDeleteMessage,
  onReactToMessage,
}) => {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'handover' | 'tasks' | 'chat'>('handover');

  const tabs = [
    { id: 'handover' as const, icon: 'clipboard', labelEl: 'Αλλαγή Βάρδιας', labelEn: 'Shift Handover' },
    { id: 'tasks' as const, icon: 'check-square', labelEl: 'Εργασίες Ομάδας', labelEn: 'Team Tasks' },
    { id: 'chat' as const, icon: 'message-circle', labelEl: 'Team Chat', labelEn: 'Team Chat' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-light-bg to-gray-50 dark:from-dark-bg dark:to-slate-900 p-6">
      {/* Header with Notification Center */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="users" className="w-8 h-8 text-brand-yellow" />
          <div>
            <h1 className="text-3xl font-heading font-bold text-light-text dark:text-dark-text">
              {language === 'el' ? 'Συνεργασία Ομάδας' : 'Team Collaboration'}
            </h1>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {language === 'el' ? 'Επικοινωνία & συντονισμός' : 'Communication & coordination'}
            </p>
          </div>
        </div>

        {/* Notification Bell */}
        <NotificationCenter
          notifications={notifications}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkNotificationAsRead}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          onDelete={onDeleteNotification}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-brand-yellow text-brand-yellow'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <Icon name={tab.icon} className="w-5 h-5" />
            {language === 'el' ? tab.labelEl : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'handover' && (
          <ShiftHandoverNotes
            shifts={shifts}
            users={users}
            currentUserId={currentUserId}
            currentTeamId={currentTeamId}
            handoverNotes={handoverNotes}
            onAddNote={onAddHandoverNote}
            onAcknowledgeNote={onAcknowledgeNote}
          />
        )}

        {activeTab === 'tasks' && (
          <TeamTasks
            tasks={tasks}
            users={users}
            currentUserId={currentUserId}
            currentTeamId={currentTeamId}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        )}

        {activeTab === 'chat' && (
          <TeamChat
            messages={chatMessages}
            users={users}
            currentUserId={currentUserId}
            currentTeamId={currentTeamId}
            onSendMessage={onSendMessage}
            onDeleteMessage={onDeleteMessage}
            onReactToMessage={onReactToMessage}
          />
        )}
      </div>
    </div>
  );
};

export default CollaborationView;
