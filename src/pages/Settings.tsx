import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User, Bell, Shield } from 'lucide-react';

const Settings = () => {
  const { profile, logout } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-muted-foreground">Manage your account preferences</p></div>

      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4"><User className="h-5 w-5 text-primary" /><h2 className="font-semibold text-foreground">Account Information</h2></div>
        <div className="grid gap-4">
          <div><Label>Name</Label><Input defaultValue={profile?.name} className="mt-1 bg-secondary/50" /></div>
          <div><Label>Email</Label><Input defaultValue={profile?.email} className="mt-1 bg-secondary/50" /></div>
          <div><Label>University</Label><Input defaultValue={profile?.university || ''} className="mt-1 bg-secondary/50" /></div>
        </div>
        <Button className="mt-4">Save Changes</Button>
      </div>

      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-4"><Bell className="h-5 w-5 text-primary" /><h2 className="font-semibold text-foreground">Notifications</h2></div>
        <p className="text-muted-foreground text-sm">Notification preferences coming soon.</p>
      </div>

      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-4"><Shield className="h-5 w-5 text-destructive" /><h2 className="font-semibold text-foreground">Danger Zone</h2></div>
        <Button variant="destructive" onClick={logout}><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
      </div>
    </div>
  );
};

export default Settings;