import React from 'react';
import { User, Channel } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface ConversationListProps {
  teamChannels: Channel[];
  usersInTeam: User[];
  currentUser: User;
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onAddChannel: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ teamChannels, usersInTeam, currentUser, activeConversationId, onSelectConversation, onAddChannel }) => {
  const { t } = useTranslation();
  
  const getDmConversationId = (userId1: string, userId2: string): string => {
    return [userId1, userId2].sort().join('-');
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl h-full flex flex-col">
      <div className="pb-4">
        <h2 className="text-xl font-bold font-heading">{t('chat_title')}</h2>
      </div>
      <div className="space-y-2 flex-1 overflow-y-auto -mr-2 pr-2">
        {/* Channels */}
        <div className="mb-4">
            <div className="flex justify-between items-center px-2 mb-1">
                <h3 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">{t('chat_channels')}</h3>
                <button onClick={onAddChannel} className="p-1 rounded-full text-gray-500 hover:bg-black/10 dark:hover:bg-white/10" title={t('chat_new_channel')}>
                    <Icon name="plus" className="w-4 h-4" />
                </button>
            </div>
            {teamChannels.map(channel => (
                <button
                    key={channel.id}
                    onClick={() => onSelectConversation(channel.id)}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 group border ${
                        activeConversationId === channel.id
                        ? 'bg-brand-yellow/20 dark:bg-brand-yellow/30 border-brand-yellow/50'
                        : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mr-3">
                        <span className="font-bold text-lg text-gray-500">#</span>
                    </div>
                    <span className="text-md font-semibold flex-1 truncate">{channel.name}</span>
                </button>
            ))}
        </div>

        {/* Direct Messages */}
        <h3 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary pt-4 pb-1 px-2 uppercase">{t('chat_dms')}</h3>
        {usersInTeam.filter(u => u.id !== currentUser.id).map((user) => {
            const conversationId = getDmConversationId(currentUser.id, user.id);
            return (
                 <button
                    key={user.id}
                    onClick={() => onSelectConversation(conversationId)}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 group border ${
                    activeConversationId === conversationId
                        ? 'bg-brand-yellow/20 dark:bg-brand-yellow/30 border-brand-yellow/50'
                        : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                    <img src={`https://i.pravatar.cc/40?u=${user.email}`} alt={user.name} className="w-8 h-8 rounded-full mr-3"/>
                    <span className="text-md font-semibold flex-1 truncate">{user.name}</span>
                </button>
            )
        })}
      </div>
    </div>
  );
};

export default ConversationList;