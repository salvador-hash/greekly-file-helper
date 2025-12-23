import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { useConversations, useMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfiles';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(searchParams.get('user'));
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: loadingConversations } = useConversations();
  const { data: messages, isLoading: loadingMessages } = useMessages(selectedUserId || undefined);
  const { data: selectedUserProfile } = useProfile(selectedUserId || undefined);
  const sendMessage = useSendMessage();

  // Update URL when selecting a user
  useEffect(() => {
    if (selectedUserId) {
      setSearchParams({ user: selectedUserId });
    } else {
      setSearchParams({});
    }
  }, [selectedUserId, setSearchParams]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUserId) return;
    
    try {
      await sendMessage.mutateAsync({
        receiverId: selectedUserId,
        content: message.trim(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get conversation for selected user (may be a new conversation)
  const selectedConversation = conversations?.find(c => c.otherUser.id === selectedUserId);
  const displayUser = selectedConversation?.otherUser || selectedUserProfile;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 animate-fade-in">
      {/* Conversations List */}
      <div className={cn(
        "w-72 card-premium p-3 space-y-2 shrink-0",
        selectedUserId ? "hidden md:block" : "block w-full md:w-72"
      )}>
        <h2 className="font-semibold text-foreground px-2 py-1">Mensajes</h2>
        {loadingConversations ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.otherUser.id}
                onClick={() => setSelectedUserId(conv.otherUser.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                  selectedUserId === conv.otherUser.id 
                    ? "bg-primary/10" 
                    : "hover:bg-secondary/50"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.otherUser.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {conv.otherUser.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{conv.otherUser.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage?.content || 'Inicia una conversación'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay conversaciones. Conecta con miembros para empezar a chatear.
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 card-premium flex flex-col",
        !selectedUserId && "hidden md:flex"
      )}>
        {selectedUserId && displayUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setSelectedUserId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src={displayUser.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {displayUser.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{displayUser.name}</p>
                <p className="text-sm text-muted-foreground">{displayUser.fraternity}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-auto space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages && messages.length > 0 ? (
                <>
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary text-foreground rounded-bl-md"
                          )}
                        >
                          <p>{msg.content}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {format(new Date(msg.created_at), 'HH:mm', { locale: es })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Envía un mensaje para comenzar la conversación
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border flex gap-2">
              <Input 
                placeholder="Escribe un mensaje..." 
                value={message} 
                onChange={e => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-secondary/50" 
              />
              <Button 
                onClick={handleSend}
                disabled={!message.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Selecciona una conversación para empezar a chatear
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
