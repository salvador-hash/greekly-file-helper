import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, GraduationCap, Briefcase, Calendar, Edit, MessageCircle, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '@/hooks/useProfiles';
import { useConnections, useSendConnectionRequest } from '@/hooks/useConnections';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    industry: '',
  });

  // If no id param, show current user's profile
  const profileId = id || user?.id;
  const isOwnProfile = !id || id === user?.id;

  const { data: viewedProfile, isLoading } = useProfile(isOwnProfile ? undefined : profileId);
  const { data: connections } = useConnections();
  const sendRequest = useSendConnectionRequest();
  const updateProfile = useUpdateProfile();

  // Use current user's profile if viewing own profile, otherwise use fetched profile
  const profile = isOwnProfile ? currentUserProfile : viewedProfile;

  // Check if connected with this user
  const isConnected = connections?.some(c => c.profile?.id === profileId);

  const handleConnect = async () => {
    if (!profileId || !profile) return;
    try {
      await sendRequest.mutateAsync(profileId);
      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud a ${profile.name} ha sido enviada.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleMessage = () => {
    if (profileId) {
      navigate(`/messages?user=${profileId}`);
    }
  };

  const handleEditOpen = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        industry: profile.industry || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: editForm,
      });
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !isOwnProfile) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card-premium overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Perfil no encontrado
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-premium overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-accent" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar className="h-24 w-24 ring-4 ring-card">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
              <p className="text-primary font-medium">{profile.fraternity}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0">
              {isOwnProfile ? (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={handleEditOpen}>
                      <Edit className="h-4 w-4 mr-2" />Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nombre</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label>Biografía</Label>
                        <Textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                          className="bg-secondary/50"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Ubicación</Label>
                        <Input
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label>Industria</Label>
                        <Input
                          value={editForm.industry}
                          onChange={(e) => setEditForm(prev => ({ ...prev, industry: e.target.value }))}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="h-4 w-4 mr-2" />Cancelar
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                          {updateProfile.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Guardar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  {isConnected ? (
                    <Button variant="outline" onClick={handleMessage}>
                      <MessageCircle className="h-4 w-4 mr-2" />Mensaje
                    </Button>
                  ) : (
                    <Button onClick={handleConnect} disabled={sendRequest.isPending}>
                      {sendRequest.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Conectar
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{profile.university}</span>
            {profile.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location}</span>}
            {profile.industry && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{profile.industry}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Clase de {profile.grad_year}</span>
          </div>
          {profile.bio && <p className="mt-4 text-foreground">{profile.bio}</p>}
        </div>
      </div>

      {/* Connections Section - Only for own profile */}
      {isOwnProfile && (
        <div className="card-premium p-6">
          <h2 className="font-semibold text-foreground mb-2">Conexiones</h2>
          <p className="text-muted-foreground">
            {connections?.length || 0} conexiones · 
            <Button variant="link" className="px-1" onClick={() => navigate('/connections')}>
              Ver todas
            </Button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
