import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Logo } from './Logo';
import { toast } from 'sonner';

export function DashboardLayout() {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="p-6" style={{ color: '#6B6B6B' }}>Loading dashboard...</div>;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return <Navigate to="/admin-login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/inventory', label: 'Inventory', icon: Package },
    { path: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/dashboard/customers', label: 'Customers', icon: Users },
    { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF5' }}>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Logo size="md" showText={true} showTagline={false} />
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
                <span className="text-sm" style={{ color: '#2E2E2E', fontWeight: 600 }}>
                  Producer Dashboard
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" size="sm" style={{ borderColor: '#2E7D32', color: '#2E7D32' }}>
                  <Store className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Website</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleLogout()}
                style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-80px)] bg-white border-r">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'font-medium' : 'hover:bg-gray-50'
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: '#A5D6A7', color: '#2E7D32' }
                        : { color: '#6B6B6B' }
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-8 border-t">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#2E7D32' }}>
                <span className="text-white font-medium">{user?.name?.charAt(0) || 'A'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: '#2E2E2E', fontWeight: 600 }}>
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs truncate" style={{ color: '#6B6B6B' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Staff'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
          <nav className="flex justify-around p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path} className="flex-1">
                  <div
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                      isActive ? '' : 'hover:bg-gray-50'
                    }`}
                    style={isActive ? { color: '#2E7D32' } : { color: '#6B6B6B' }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
