import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Users, 
  Truck, 
  LogOut, 
  User 
} from 'lucide-react';
import logo from '@/assets/logo.png';
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
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="invoice-header text-primary-foreground py-3 px-4 sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Indotech Logo" className="h-10 w-auto" />
            </Link>
            
            {/* User info & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm opacity-90">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-around h-16">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              if (item.isCenter) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center justify-center -mt-6"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-primary/90 text-primary-foreground hover:bg-primary"
                    )}>
                      <Icon className="w-7 h-7" />
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
