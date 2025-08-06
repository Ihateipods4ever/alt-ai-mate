import { NavLink } from 'react-router-dom';
import { Code, Cloud, Server, ShieldCheck, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/app/editor', icon: Code, label: 'Editor' },
  { to: '/app/deploy', icon: Cloud, label: 'Deploy' },
  { to: '/app/servers', icon: Server, label: 'Servers' },
  { to: '/app/ip-guard', icon: ShieldCheck, label: 'IP Guard' },
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
  return (
    <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">ALT-AI-MATE</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => <SidebarLink key={item.to} {...item} />)}
      </nav>
    </aside>
  );
}

export default Sidebar;