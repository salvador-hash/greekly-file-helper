import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const Connections = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-foreground">Connections</h1><p className="text-muted-foreground">Manage your Greek network</p></div>
      
      <div className="card-premium p-4">
        <h2 className="font-semibold text-foreground mb-3">Pending Requests</h2>
        <div className="text-center py-4 text-muted-foreground text-sm">
          No pending requests
        </div>
      </div>

      <div className="card-premium p-4">
        <h2 className="font-semibold text-foreground mb-3">Your Connections</h2>
        <div className="text-center py-4 text-muted-foreground text-sm">
          No connections yet. Find members in the Search page!
        </div>
      </div>
    </div>
  );
};

export default Connections;