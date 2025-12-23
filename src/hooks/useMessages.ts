import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Message, Profile } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Conversation {
  otherUser: Profile;
  lastMessage: Message | null;
  unreadCount: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, { messages: Message[]; unreadCount: number }>();
      
      messages.forEach((message) => {
        const otherId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        
        if (!conversationMap.has(otherId)) {
          conversationMap.set(otherId, { messages: [], unreadCount: 0 });
        }
        
        const conv = conversationMap.get(otherId)!;
        conv.messages.push(message);
        
        if (message.receiver_id === user.id && !message.read) {
          conv.unreadCount++;
        }
      });

      // Get profiles for all conversation partners
      const conversations: Conversation[] = [];
      
      for (const [otherId, { messages, unreadCount }] of conversationMap) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherId)
          .maybeSingle();
        
        if (profile) {
          conversations.push({
            otherUser: profile,
            lastMessage: messages[0] || null,
            unreadCount,
          });
        }
      }

      return conversations.sort((a, b) => {
        const aDate = a.lastMessage?.created_at || '';
        const bDate = b.lastMessage?.created_at || '';
        return bDate.localeCompare(aDate);
      });
    },
    enabled: !!user,
  });
};

export const useMessages = (otherUserId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to realtime updates for this conversation
  useEffect(() => {
    if (!user || !otherUserId) return;

    const channel = supabase
      .channel(`messages-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === otherUserId) ||
            (newMessage.sender_id === otherUserId && newMessage.receiver_id === user.id)
          ) {
            queryClient.invalidateQueries({ queryKey: ['messages', otherUserId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId, queryClient]);
  
  return useQuery({
    queryKey: ['messages', otherUserId],
    queryFn: async () => {
      if (!user || !otherUserId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Mark messages as read
      if (data.some(m => m.receiver_id === user.id && !m.read)) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('sender_id', otherUserId)
          .eq('receiver_id', user.id)
          .eq('read', false);
      }

      return data as Message[];
    },
    enabled: !!user && !!otherUserId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.receiver_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
