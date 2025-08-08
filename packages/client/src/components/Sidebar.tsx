import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Code, Cloud, Server, ShieldCheck, Bot, Settings, CreditCard, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/editor', icon: Code, label: 'Editor' },
  { to: '/app/deploy', icon: Cloud, label: 'Deploy' },
  { to: '/app/servers', icon: Server, label: 'Servers' },
  { to: '/app/ip-guard', icon: ShieldCheck, label: 'IP Guard' },
  { to: '/app/billing', icon: CreditCard, label: 'Billing' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

/**
 * A reusable navigation link component for the sidebar.
 */
const SidebarLink = ({ to, icon: Icon, label }: typeof navItems[0]) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary'
      )
    }
  >
    <Icon className="h-4 w-4" />
    {label}
  </NavLink>
);

/**
 * The main sidebar component for application navigation.
 */
function Sidebar() {
  const { user, logout } = useApp();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">ALT-AI-MATE</h1>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => <SidebarLink key={item.to} {...item} />)}
      </nav>

      {/* User section at bottom */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;