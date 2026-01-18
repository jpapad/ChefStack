import React, { useState } from 'react';
import { Recipe, User, RecipeComment } from '../../types';
import { Icon } from './Icon';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { useTranslation } from '../../i18n';

interface RecipeCommentsProps {
  recipe: Recipe;
  currentUser: User;
  users: User[];
  comments: RecipeComment[];
  onAddComment: (comment: Omit<RecipeComment, 'id' | 'createdAt'>) => void;
  onUpvote: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
}

export const RecipeComments: React.FC<RecipeCommentsProps> = ({
  recipe,
  currentUser,
  users,
  comments,
  onAddComment,
  onUpvote,
  onReply
}) => {
  const { t } = useTranslation();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  const getUserName = (userId: string) => {
    return users?.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'μόλις τώρα';
    if (diffMins < 60) return `πριν ${diffMins} λεπτά`;
    if (diffHours < 24) return `πριν ${diffHours} ώρες`;
    if (diffDays < 7) return `πριν ${diffDays} μέρες`;
    
    return date.toLocaleDateString('el-GR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    // Extract mentions
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(commentText)) !== null) {
      const username = match[1];
      const user = users.find(u => u.name.toLowerCase().includes(username.toLowerCase()));
      if (user && !mentions.includes(user.id)) {
        mentions.push(user.id);
      }
    }

    onAddComment({
      recipeId: recipe.id,
      userId: currentUser.id,
      content: commentText,
      mentions,
      upvotes: []
    });

    setCommentText('');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    onReply(commentId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleMentionInsert = (userName: string) => {
    const cursorPos = commentText.lastIndexOf('@');
    const newText = commentText.substring(0, cursorPos) + `@${userName} ` + commentText.substring(cursorPos + mentionSearch.length + 1);
    setCommentText(newText);
    setShowMentions(false);
    setMentionSearch('');
  };

  const handleTextChange = (text: string) => {
    setCommentText(text);
    
    // Detect @ symbol for mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex >= 0) {
      const textAfterAt = text.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const filteredUsers = mentionSearch
    ? (users || []).filter(u => 
        u.name.toLowerCase().includes(mentionSearch.toLowerCase()) &&
        u.id !== currentUser.id
      )
    : [];

  // Sort comments: parent comments first, then replies
  const parentComments = comments.filter(c => !c.parentId);
  const getReplies = (commentId: string) => 
    comments.filter(c => c.parentId === commentId);

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 relative">
              <Textarea
                placeholder="Προσθέστε ένα σχόλιο... (χρησιμοποιήστε @ για mentions)"
                value={commentText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={3}
                className="resize-none"
              />
              
              {/* Mentions Dropdown */}
              {showMentions && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-border rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleMentionInsert(user.name)}
                      className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{user.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommentText('')}
              disabled={!commentText.trim()}
            >
              Ακύρωση
            </Button>
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              <Icon name="send" className="w-4 h-4 mr-2" />
              Σχόλιο
            </Button>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {parentComments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="message-circle" className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Δεν υπάρχουν σχόλια ακόμα</p>
            <p className="text-sm">Γίνε ο πρώτος που θα σχολιάσει!</p>
          </div>
        ) : (
          parentComments.map(comment => {
            const replies = getReplies(comment.id);
            const isUpvoted = comment.upvotes?.includes(currentUser.id);
            
            return (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">
                      {getUserName(comment.userId).charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {getUserName(comment.userId)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                      {comment.mentions && comment.mentions.length > 0 && (
                        <Icon name="bell" className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    
                    <p className="text-sm mb-3 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onUpvote(comment.id)}
                        className={`flex items-center gap-1 text-xs hover:text-primary transition-colors ${
                          isUpvoted ? 'text-primary font-semibold' : 'text-muted-foreground'
                        }`}
                      >
                        <Icon name="thumbs-up" className="w-4 h-4" />
                        <span>{comment.upvotes?.length || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon name="message-circle" className="w-4 h-4" />
                        Απάντηση
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 pl-4 border-l-2 border-primary space-y-2">
                        <Textarea
                          placeholder="Γράψε την απάντησή σου..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Ακύρωση
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyText.trim()}
                          >
                            Απάντηση
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-border">
                        {replies.map(reply => {
                          const isReplyUpvoted = reply.upvotes?.includes(currentUser.id);
                          
                          return (
                            <div key={reply.id} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold">
                                  {getUserName(reply.userId).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {getUserName(reply.userId)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm mb-2 whitespace-pre-wrap break-words">
                                  {reply.content}
                                </p>
                                <button
                                  onClick={() => onUpvote(reply.id)}
                                  className={`flex items-center gap-1 text-xs hover:text-primary transition-colors ${
                                    isReplyUpvoted ? 'text-primary font-semibold' : 'text-muted-foreground'
                                  }`}
                                >
                                  <Icon name="thumbs-up" className="w-4 h-4" />
                                  <span>{reply.upvotes?.length || 0}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecipeComments;
