import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface TeamChatProps {
  messages: ChatMessage[];
  users: User[];
  currentUserId: string;
  currentTeamId: string;
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
}

const TeamChat: React.FC<TeamChatProps> = ({
  messages,
  users,
  currentUserId,
  currentTeamId,
  onSendMessage,
  onDeleteMessage,
  onReactToMessage,
}) => {
  const { language } = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentUser = users.find(u => u.id === currentUserId);

  // Sort messages by creation time
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    // Detect @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(messageText)) !== null) {
      const mentionedUser = users.find(u => 
        u.name.toLowerCase().includes(match[1].toLowerCase())
      );
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }

    onSendMessage({
      teamId: currentTeamId,
      channelId: 'general',
      senderId: currentUserId,
      content: messageText,
      mentions: mentions.length > 0 ? mentions : undefined,
      replyToId: replyingTo?.id,
      reactions: [],
    });

    setMessageText('');
    setReplyingTo(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString(language === 'el' ? 'el-GR' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return date.toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const sender = users.find(u => u.id === message.senderId);
    const isOwnMessage = message.senderId === currentUserId;
    const replyToMessage = message.replyToId 
      ? sortedMessages.find(m => m.id === message.replyToId)
      : null;

    return (
      <div className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-bold text-slate-900">
            {sender?.name.charAt(0).toUpperCase() || '?'}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-2xl ${isOwnMessage ? 'items-end' : ''}`}>
          {/* Sender Name & Time */}
          <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
            <span className="font-semibold text-sm text-light-text dark:text-dark-text">
              {sender?.name || 'Unknown'}
            </span>
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {formatTime(message.createdAt)}
            </span>
          </div>

          {/* Reply Preview */}
          {replyToMessage && (
            <div className={`text-xs mb-2 p-2 rounded-lg bg-gray-100 dark:bg-slate-700/50 border-l-2 border-brand-yellow ${
              isOwnMessage ? 'ml-auto' : ''
            }`}>
              <div className="flex items-center gap-1 mb-1">
                <Icon name="corner-down-right" className="w-3 h-3" />
                <span className="font-semibold">
                  {users.find(u => u.id === replyToMessage.senderId)?.name}
                </span>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary truncate">
                {replyToMessage.content}
              </p>
            </div>
          )}

          {/* Message Bubble */}
          <div className={`relative group ${isOwnMessage ? 'ml-auto' : ''}`}>
            <div className={`px-4 py-2 rounded-2xl ${
              isOwnMessage
                ? 'bg-brand-yellow text-slate-900 rounded-br-none'
                : 'bg-white dark:bg-slate-800 text-light-text dark:text-dark-text rounded-bl-none shadow-md'
            }`}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              
              {message.editedAt && (
                <span className="text-xs opacity-60 italic ml-2">
                  ({language === 'el' ? 'επεξ.' : 'edited'})
                </span>
              )}
            </div>

            {/* Message Actions */}
            <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} 
              opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 px-2`}>
              <button
                onClick={() => setReplyingTo(message)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700"
                title={language === 'el' ? 'Απάντηση' : 'Reply'}
              >
                <Icon name="corner-down-left" className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowEmojiPicker(message.id)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700"
                title={language === 'el' ? 'Αντίδραση' : 'React'}
              >
                <Icon name="smile" className="w-4 h-4" />
              </button>
              {isOwnMessage && (
                <button
                  onClick={() => {
                    if (confirm(language === 'el' ? 'Διαγραφή μηνύματος;' : 'Delete message?')) {
                      onDeleteMessage(message.id);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                  title={language === 'el' ? 'Διαγραφή' : 'Delete'}
                >
                  <Icon name="trash-2" className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1 mt-1">
                {message.reactions.map((reaction, idx) => (
                  <button
                    key={idx}
                    onClick={() => onReactToMessage(message.id, reaction.emoji)}
                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                      reaction.userIds.includes(currentUserId)
                        ? 'bg-brand-yellow/20 border border-brand-yellow'
                        : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="font-semibold">{reaction.userIds.length}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker === message.id && (
              <div className="absolute top-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-2 flex gap-2 z-10">
                {['👍', '❤️', '😂', '🎉', '🔥', '👏'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReactToMessage(message.id, emoji);
                      setShowEmojiPicker(null);
                    }}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => setShowEmojiPicker(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
              #{language === 'el' ? 'γενικά' : 'general'}
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {users.length} {language === 'el' ? 'μέλη' : 'members'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="users" className="w-5 h-5 text-brand-yellow" />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sortedMessages.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="message-circle" className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              {language === 'el' 
                ? 'Δεν υπάρχουν μηνύματα ακόμα. Ξεκινήστε τη συζήτηση!' 
                : 'No messages yet. Start the conversation!'}
            </p>
          </div>
        ) : (
          <>
            {sortedMessages.map(message => (
              !message.isDeleted && <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-2 p-2 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="corner-down-right" className="w-4 h-4 text-brand-yellow" />
              <span className="text-sm">
                {language === 'el' ? 'Απάντηση σε' : 'Replying to'} <strong>
                  {users.find(u => u.id === replyingTo.senderId)?.name}
                </strong>
              </span>
            </div>
            <button onClick={() => setReplyingTo(null)}>
              <Icon name="x" className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'el' ? 'Γράψτε ένα μήνυμα... (@ για mention)' : 'Type a message... (@ to mention)'}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 resize-none"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="px-4 py-2 bg-brand-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="send" className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
          {language === 'el' 
            ? 'Enter για αποστολή, Shift+Enter για νέα γραμμή' 
            : 'Enter to send, Shift+Enter for new line'}
        </p>
      </div>
    </div>
  );
};

export default TeamChat;
