import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  User, 
  MessageCircle, 
  Settings, 
  Users, 
  LogOut,
  Menu,
  X,
  FileText,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useUnreadMessageCount, usePendingRequestCount } from '@/hooks/useNotificationCount';

export const AppSidebar = () => {
  const location = useLocation();
  const { profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadMessages = 0 } = useUnreadMessageCount();
  const { data: pendingRequests = 0 } = usePendingRequestCount();

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/connections', icon: Users, label: 'Connections', badge: pendingRequests },
    { to: '/messages', icon: MessageCircle, label: 'Messages', badge: unreadMessages },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Ω</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">GreekLink</h1>
              <p className="text-xs text-muted-foreground">Connect. Network. Succeed.</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Legal Links */}
          <div className="border-t border-border pt-3 mb-3">
            <div className="flex gap-2 px-3">
              <NavLink
                to="/terms"
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                Términos
              </NavLink>
              <span className="text-muted-foreground">·</span>
              <NavLink
                to="/privacy"
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                Privacidad
              </NavLink>
            </div>
          </div>

          {/* User Section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.fraternity}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
