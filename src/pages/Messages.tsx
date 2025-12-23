import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const Messages = () => {
  const [message, setMessage] = useState('');

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 animate-fade-in">
      <div className="w-72 card-premium p-3 space-y-2 shrink-0 hidden md:block">
        <h2 className="font-semibold text-foreground px-2 py-1">Messages</h2>
        <div className="text-center py-8 text-muted-foreground text-sm">
          No conversations yet. Connect with members to start messaging.
        </div>
      </div>
      <div className="flex-1 card-premium flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Avatar><AvatarFallback>?</AvatarFallback></Avatar>
          <div><p className="font-medium text-foreground">Select a conversation</p></div>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="text-center text-muted-foreground text-sm py-8">Select a conversation to start messaging</div>
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)} className="bg-secondary/50" />
          <Button disabled={!message.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default Messages;