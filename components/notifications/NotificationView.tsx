import React, { useState, useMemo } from 'react';
import { User, Message, Channel, CallState } from '../../types';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NotificationSettings from './NotificationSettings';
import ChannelForm from './ChannelForm';
import CallView from './CallView';
import { api } from '../../services/api';

interface NotificationViewProps {
  currentUser: User;
  currentTeamId: string;
  allUsers: User[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  allChannels: Channel[];
  setAllChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
}

const NotificationView: React.FC<NotificationViewProps> = ({ currentUser, currentTeamId, allUsers, messages, setMessages, allChannels, setAllChannels }) => {
  const [activeConversationId, setActiveConversationId] = useState<string>(allChannels.find(c => c.name === 'Γενικές Ανακοινώσεις')?.id || '');
  const [isChannelFormOpen, setIsChannelFormOpen] = useState(false);
  const [callState, setCallState] = useState<CallState>({ isActive: false, targetUserId: null, status: 'idle' });


  const usersInTeam = useMemo(() => 
    allUsers.filter(u => u.memberships.some(m => m.teamId === currentTeamId)),
    [allUsers, currentTeamId]
  );
  
  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
        id: `msg${Date.now()}`,
        conversationId: activeConversationId,
        teamId: currentTeamId,
        senderId: currentUser.id,
        content,
        timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSaveChannel = async (channelName: string) => {
    const newChannelData = { name: channelName, teamId: currentTeamId };
    const savedChannel = await api.saveChannel(newChannelData);
    setAllChannels(prev => [...prev, savedChannel]);
    setActiveConversationId(savedChannel.id);
    setIsChannelFormOpen(false);
  };

  const handleStartCall = (userId: string) => {
    setCallState({ isActive: true, targetUserId: userId, status: 'calling' });
  };

  const handleEndCall = () => {
    setCallState({ isActive: false, targetUserId: null, status: 'idle' });
  };
  
  if (callState.isActive && callState.targetUserId) {
    return (
        <CallView
            currentUser={currentUser}
            targetUserId={callState.targetUserId}
            allUsers={allUsers}
            onEndCall={handleEndCall}
        />
    );
  }

  return (
    <>
      <div className="h-full flex flex-col gap-6">
        <NotificationSettings />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-1 h-full">
            <ConversationList
              teamChannels={allChannels}
              usersInTeam={usersInTeam}
              currentUser={currentUser}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onAddChannel={() => setIsChannelFormOpen(true)}
            />
          </div>
          <div className="lg:col-span-3 h-full">
            <ChatWindow
                key={activeConversationId} // Re-mount component to clear state on conversation change
                conversationId={activeConversationId}
                messages={messages}
                onSendMessage={handleSendMessage}
                onStartCall={handleStartCall}
                currentUser={currentUser}
                allUsers={allUsers}
                allChannels={allChannels}
            />
          </div>
        </div>
      </div>
      <ChannelForm
        isOpen={isChannelFormOpen}
        onClose={() => setIsChannelFormOpen(false)}
        onSave={handleSaveChannel}
      />
    </>
  );
};

export default NotificationView;