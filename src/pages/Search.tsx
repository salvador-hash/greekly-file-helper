import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, GraduationCap, Briefcase, UserPlus, Check, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FRATERNITIES, INDUSTRIES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useProfiles } from '@/hooks/useProfiles';
import { useConnections, usePendingRequests, useSentRequests, useSendConnectionRequest } from '@/hooks/useConnections';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [fratFilter, setFratFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const { data: profiles, isLoading } = useProfiles({
    query: query || undefined,
    fraternity: fratFilter || undefined,
    industry: industryFilter || undefined,
  });

  const { data: connections } = useConnections();
  const { data: pendingRequests } = usePendingRequests();
  const { data: sentRequests } = useSentRequests();
  const sendRequest = useSendConnectionRequest();

  // Filter out the current user from results
  const filteredUsers = profiles?.filter(p => p.id !== user?.id) || [];

  // Check connection status for a user
  const getConnectionStatus = (userId: string): 'connected' | 'pending_sent' | 'pending_received' | 'none' => {
    if (connections?.some(c => c.profile?.id === userId)) {
      return 'connected';
    }
    // Check if we sent them a request
    if (sentRequests?.some(r => r.to_user_id === userId)) {
      return 'pending_sent';
    }
    // Check if they sent us a request
    if (pendingRequests?.some(r => r.from_user_id === userId)) {
      return 'pending_received';
    }
    return 'none';
  };

  const handleConnect = async (userId: string, name: string) => {
    try {
      await sendRequest.mutateAsync(userId);
      toast({ 
        title: "Solicitud enviada", 
        description: `Tu solicitud a ${name} ha sido enviada.` 
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buscar Miembros</h1>
        <p className="text-muted-foreground">Busca hermanos y hermanas de diferentes capítulos</p>
      </div>

      {/* Search & Filters */}
      <div className="card-premium p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o universidad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-secondary/50 border-border/50"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={fratFilter} onValueChange={setFratFilter}>
            <SelectTrigger className="w-48 bg-secondary/50"><SelectValue placeholder="Todas las Organizaciones" /></SelectTrigger>
            <SelectContent className="max-h-60 bg-card">{FRATERNITIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-40 bg-secondary/50"><SelectValue placeholder="Todas las Industrias" /></SelectTrigger>
            <SelectContent className="bg-card">{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
          {(fratFilter || industryFilter) && (
            <Button variant="ghost" onClick={() => { setFratFilter(''); setIndustryFilter(''); }}>Limpiar</Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-premium p-4">
              <div className="flex gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredUsers.map((profile, i) => {
            const status = getConnectionStatus(profile.id);
            return (
              <motion.div 
                key={profile.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }} 
                className="card-premium p-4 hover-lift"
              >
                <div className="flex gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">{profile.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${profile.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{profile.name}</Link>
                    <p className="text-sm text-primary font-medium">{profile.fraternity}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{profile.university}</span>
                      {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span>}
                    </div>
                    {profile.industry && <span className="inline-flex items-center gap-1 mt-2 text-xs bg-secondary px-2 py-1 rounded-full"><Briefcase className="h-3 w-3" />{profile.industry}</span>}
                  </div>
                  {status === 'connected' ? (
                    <Button size="sm" variant="secondary" className="shrink-0" disabled>
                      <Check className="h-4 w-4 mr-1" /> Conectado
                    </Button>
                  ) : status === 'pending_sent' ? (
                    <Button size="sm" variant="outline" className="shrink-0" disabled>
                      <Clock className="h-4 w-4 mr-1" /> Pendiente
                    </Button>
                  ) : status === 'pending_received' ? (
                    <Button size="sm" variant="default" className="shrink-0" asChild>
                      <Link to="/connections">Ver solicitud</Link>
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="shrink-0" 
                      onClick={() => handleConnect(profile.id, profile.name)}
                      disabled={sendRequest.isPending}
                    >
                      {sendRequest.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {!isLoading && filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No se encontraron miembros. Intenta ajustar tu búsqueda.</div>
      )}
    </div>
  );
};

export default Search;
