import { Link, useLocation } from 'react-router';
import { ShoppingCart, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Logo } from './Logo';
import { useState } from 'react';

export function Header() {
  const { getCartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const cartCount = getCartCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" showText={true} showTagline={true} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`transition-colors ${
                location.pathname === '/'
                  ? 'text-[#2E7D32] font-medium'
                  : 'text-[#6B6B6B] hover:text-[#2E7D32]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`transition-colors ${
                location.pathname === '/shop'
                  ? 'text-[#2E7D32] font-medium'
                  : 'text-[#6B6B6B] hover:text-[#2E7D32]'
              }`}
            >
              Shop
            </Link>
            {isAdmin && (
              <Link
                to="/dashboard"
                className={`transition-colors ${
                  location.pathname.startsWith('/dashboard')
                    ? 'text-[#2E7D32] font-medium'
                    : 'text-[#6B6B6B] hover:text-[#2E7D32]'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Side: Login/Account & Cart */}
          <div className="flex items-center gap-3">
            {/* Dashboard Button (Admin only) */}
            {isAdmin && (
              <Link to="/dashboard" className="hidden lg:block">
                <Button
                  variant={location.pathname.startsWith('/dashboard') ? 'default' : 'ghost'}
                  className="gap-2"
                  style={
                    location.pathname.startsWith('/dashboard')
                      ? { backgroundColor: '#2E7D32', color: 'white' }
                      : { color: '#2E7D32' }
                  }
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}

            {/* Login / Account Button */}
            <Link to={isAuthenticated ? '/account' : '/login'} className="hidden md:block">
              <Button
                variant={location.pathname === '/account' || location.pathname === '/login' ? 'default' : 'ghost'}
                className="gap-2"
                style={
                  location.pathname === '/account' || location.pathname === '/login'
                    ? { backgroundColor: '#2E7D32', color: 'white' }
                    : { color: '#2E7D32' }
                }
              >
                <User className="h-4 w-4" />
                {isAuthenticated ? 'Account' : 'Login'}
              </Button>
            </Link>

            {/* Cart Button */}
            <Link to="/cart">
              <Button
                variant={location.pathname === '/cart' ? 'default' : 'outline'}
                className="relative"
                style={
                  location.pathname === '/cart'
                    ? { backgroundColor: '#2E7D32', color: 'white' }
                    : { borderColor: '#2E7D32', color: '#2E7D32' }
                }
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                    style={{ backgroundColor: '#2E7D32' }}
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" style={{ color: '#2E7D32' }} />
              ) : (
                <Menu className="h-6 w-6" style={{ color: '#2E7D32' }} />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`transition-colors ${
                location.pathname === '/'
                  ? 'text-[#2E7D32] font-medium'
                  : 'text-[#6B6B6B]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={`transition-colors ${
                location.pathname === '/shop'
                  ? 'text-[#2E7D32] font-medium'
                  : 'text-[#6B6B6B]'
              }`}
            >
              Shop
            </Link>
            {isAdmin && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  location.pathname.startsWith('/dashboard')
                    ? 'text-[#2E7D32] font-medium'
                    : 'text-[#6B6B6B]'
                }`}
              >
                Dashboard
              </Link>
            )}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className={`transition-colors ${
                location.pathname === '/account' || location.pathname === '/login'
                  ? 'text-[#2E7D32] font-medium'
                  : 'text-[#6B6B6B]'
              }`}
            >
              {isAuthenticated ? 'My Account' : 'Login'}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}