import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { FilePlus, List, Truck, LogOut, User, Users } from 'lucide-react';
import logo from '@/assets/logo.png';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'New Order', icon: FilePlus },
  { path: '/orders', label: 'Orders', icon: List },
  { path: '/dispatch', label: 'Dispatch', icon: Truck },
  { path: '/parties', label: 'Parties', icon: Users },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
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

          {/* Navigation */}
          <nav className="flex gap-1 mt-3 -mb-3 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-background text-foreground'
                      : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center text-muted-foreground text-sm py-6 no-print">
        <p>© {new Date().getFullYear()} Indotech Metals Pvt Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AppLayout;
