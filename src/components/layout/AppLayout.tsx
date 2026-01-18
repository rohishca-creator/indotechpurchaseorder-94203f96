import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Users, 
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const bottomNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/orders', label: 'Orders', icon: FileText },
  { path: '/new-order', label: 'New', icon: PlusCircle, isCenter: true },
  { path: '/parties', label: 'Parties', icon: Users },
  { path: '/dispatch', label: 'Dispatch', icon: Truck },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Main Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-around h-16">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              if (item.isCenter) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center justify-center -mt-5"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-primary text-primary-foreground"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={cn(
                      "text-xs mt-1 font-medium",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center py-2 px-3 min-w-[60px]"
                >
                  <Icon className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-xs mt-1 font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
