import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  PlusCircle,
  Code,
  Rocket,
  Server,
  ShieldCheck,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

// Navigation items configuration
const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/new-project', label: 'New Project', icon: PlusCircle },
  { to: '/editor', label: 'Editor', icon: Code },
  { to: '/deploy', label: 'Deploy', icon: Rocket },
  { to: '/servers', label: 'Servers', icon: Server },
  { to: '/ip-guard', label: 'IP Guard', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/**
 * A persistent, collapsible sidebar for main application navigation.
 * @param {boolean} isCollapsed - Controls the collapsed state of the sidebar.
 */
function Sidebar({ isCollapsed }: SidebarProps) {
  // Common class names for navigation links
  const linkClasses = `
    flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all 
    hover:text-primary aria-[current=page]:bg-muted aria-[current=page]:text-primary
  `;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col border-r bg-background">
        <nav className="flex flex-col gap-2 p-2">
          {navItems.map((item) => (
            isCollapsed ? (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(linkClasses, 'justify-center', isActive && 'bg-muted text-primary')
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(linkClasses, isActive && 'bg-muted text-primary')
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          ))}
        </nav>
      </div>
    </TooltipProvider>
  );
}

export default Sidebar;