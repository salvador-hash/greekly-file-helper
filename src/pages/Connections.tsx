import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X, MessageCircle, Loader2 } from 'lucide-react';
import { useConnections, usePendingRequests, useRespondToRequest } from '@/hooks/useConnections';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const Connections = () => {
  const navigate = useNavigate();
  const { data: connections, isLoading: loadingConnections } = useConnections();
  const { data: pendingRequests, isLoading: loadingRequests } = usePendingRequests();
  const respondToRequest = useRespondToRequest();

  const handleRespond = async (requestId: string, accept: boolean, name: string) => {
    try {
      await respondToRequest.mutateAsync({ requestId, accept });
      toast({
        title: accept ? "Conexión aceptada" : "Solicitud rechazada",
        description: accept ? `Ahora estás conectado con ${name}` : `Has rechazado la solicitud de ${name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleMessage = (userId: string) => {
    navigate(`/messages?user=${userId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conexiones</h1>
        <p className="text-muted-foreground">Gestiona tu red de contactos</p>
      </div>
      
      {/* Pending Requests */}
      <div className="card-premium p-4">
        <h2 className="font-semibold text-foreground mb-3">Solicitudes Pendientes</h2>
        {loadingRequests ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : pendingRequests && pendingRequests.length > 0 ? (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.fromUser?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {request.fromUser?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/profile/${request.from_user_id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {request.fromUser?.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{request.fromUser?.fraternity}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleRespond(request.id, true, request.fromUser?.name || '')}
                    disabled={respondToRequest.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {respondToRequest.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRespond(request.id, false, request.fromUser?.name || '')}
                    disabled={respondToRequest.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No hay solicitudes pendientes
          </div>
        )}
      </div>

      {/* Your Connections */}
      <div className="card-premium p-4">
        <h2 className="font-semibold text-foreground mb-3">Tus Conexiones</h2>
        {loadingConnections ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : connections && connections.length > 0 ? (
          <div className="space-y-3">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={connection.profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {connection.profile?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/profile/${connection.profile?.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {connection.profile?.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {connection.profile?.fraternity} · {connection.profile?.university}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMessage(connection.profile?.id || '')}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No tienes conexiones aún. ¡Busca miembros en la página de Búsqueda!
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
