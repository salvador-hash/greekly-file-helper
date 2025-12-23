import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Connection, ConnectionRequest, Profile } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';

export interface ConnectionWithProfile extends Connection {
  profile: Profile | null;
}

export interface ConnectionRequestWithProfile extends ConnectionRequest {
  fromUser: Profile | null;
  toUser: Profile | null;
}

export const useConnections = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);
      
      if (error) throw error;

      // Get profile for each connection
      const connectionsWithProfiles = await Promise.all(
        data.map(async (connection) => {
          const otherId = connection.user_id === user.id 
            ? connection.connected_user_id 
            : connection.user_id;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .maybeSingle();
          
          return { ...connection, profile } as ConnectionWithProfile;
        })
      );

      return connectionsWithProfiles;
    },
    enabled: !!user,
  });
};

export const usePendingRequests = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['connectionRequests', 'pending', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('to_user_id', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;

      // Get profile for each request
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          const { data: fromUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', request.from_user_id)
            .maybeSingle();
          
          return { ...request, fromUser, toUser: null } as ConnectionRequestWithProfile;
        })
      );

      return requestsWithProfiles;
    },
    enabled: !!user,
  });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (toUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if request already exists
      const { data: existing } = await supabase
        .from('connection_requests')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', toUserId)
        .maybeSingle();
      
      if (existing) {
        throw new Error('Connection request already sent');
      }

      // Check if already connected
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('id')
        .or(`and(user_id.eq.${user.id},connected_user_id.eq.${toUserId}),and(user_id.eq.${toUserId},connected_user_id.eq.${user.id})`)
        .maybeSingle();
      
      if (existingConnection) {
        throw new Error('Already connected');
      }
      
      const { data, error } = await supabase
        .from('connection_requests')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
    },
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, accept }: { requestId: string; accept: boolean }) => {
      if (accept) {
        // Get the request first
        const { data: request, error: fetchError } = await supabase
          .from('connection_requests')
          .select('*')
          .eq('id', requestId)
          .single();
        
        if (fetchError) throw fetchError;

        // Create connection
        const { error: connectionError } = await supabase
          .from('connections')
          .insert({
            user_id: request.from_user_id,
            connected_user_id: request.to_user_id,
          });
        
        if (connectionError) throw connectionError;

        // Update request status
        const { error: updateError } = await supabase
          .from('connection_requests')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', requestId);
        
        if (updateError) throw updateError;
      } else {
        // Reject request
        const { error } = await supabase
          .from('connection_requests')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', requestId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
};
