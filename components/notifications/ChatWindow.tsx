import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Channel } from '../../types';
import { Icon } from '../common/Icon';
import WalkieTalkieButton from './WalkieTalkieButton';

interface ChatWindowProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onStartCall: (userId: string) => void;
  currentUser: User;
  allUsers: User[];
  allChannels: Channel[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, messages, onSendMessage, onStartCall, currentUser, allUsers, allChannels }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationInfo = React.useMemo(() => {
    const isChannel = conversationId.startsWith('channel-');
    if (isChannel) {
      return allChannels.find(c => c.id === conversationId);
    } else {
      const userIds = conversationId.split('-');
      const otherUserId = userIds.find(id => id !== currentUser.id);
      return allUsers.find(u => u.id === otherUserId);
    }
  }, [conversationId, allChannels, allUsers, currentUser.id]);

  const conversationMessages = React.useMemo(() => 
    messages.filter(m => m.conversationId === conversationId).sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [messages, conversationId]
  );
  
  const isDirectMessage = !conversationId.startsWith('channel-');
  const targetUser = isDirectMessage ? conversationInfo as User : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    onSendMessage(text);
  };

  const getSender = (senderId: string) => allUsers.find(u => u.id === senderId);

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-3 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="flex items-center gap-3">
          {isDirectMessage && targetUser ? (
            <>
              <img src={`https://i.pravatar.cc/40?u=${targetUser.email}`} alt={targetUser.name} className="w-10 h-10 rounded-full" />
              <h2 className="text-lg font-bold">{targetUser.name}</h2>
            </>
          ) : (
            <>
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                    <span className="font-bold text-xl text-gray-500">#</span>
                </div>
                <h2 className="text-lg font-bold">{(conversationInfo as Channel)?.name || 'Select a chat'}</h2>
            </>
          )}
        </div>
        {isDirectMessage && targetUser && (
          <div className="flex items-center gap-2">
            <button onClick={() => onStartCall(targetUser.id)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20" title="Start Call">
              <Icon name="phone" className="w-5 h-5"/>
            </button>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {conversationMessages.map(message => {
          const sender = getSender(message.senderId);
          const isCurrentUser = message.senderId === currentUser.id;
          return (
            <div key={message.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
               {!isCurrentUser && <img src={`https://i.pravatar.cc/40?u=${sender?.email}`} alt={sender?.name} className="w-8 h-8 rounded-full flex-shrink-0"/>}
               <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isCurrentUser ? 'bg-brand-yellow text-brand-dark rounded-br-lg' : 'bg-black/5 dark:bg-white/10 rounded-bl-lg'}`}>
                  {!isCurrentUser && <p className="font-bold text-sm mb-1">{sender?.name}</p>}
                  <p>{message.content}</p>
                  <p className="text-xs opacity-60 mt-1 text-right">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
               </div>
               {isCurrentUser && <img src={`https://i.pravatar.cc/40?u=${currentUser.email}`} alt={currentUser.name} className="w-8 h-8 rounded-full flex-shrink-0"/>}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200/80 dark:border-gray-700/80">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Recording..." : "Type a message..."}
              disabled={isRecording}
              className="w-full pl-4 pr-12 py-3 rounded-full bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:shadow-aura-yellow disabled:bg-gray-200 dark:disabled:bg-gray-700"
            />
            <button onClick={handleSend} disabled={isRecording} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand-dark text-white rounded-full hover:opacity-90 disabled:opacity-50">
              <Icon name="send" className="w-5 h-5"/>
            </button>
          </div>
          <WalkieTalkieButton 
            onTranscriptionComplete={handleTranscriptionComplete}
            onRecordingStateChange={setIsRecording}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;