import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  TrendingUp,
  BookOpen,
  FlaskConical,
  Calendar,
  User as UserIcon,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'Progress', path: '/progress', icon: TrendingUp },
  { name: 'Academics', path: '/academics', icon: BookOpen },
  { name: 'Research & Analysis', path: '/research', icon: FlaskConical },
  { name: 'Hackathons & Events', path: '/hackathons', icon: Calendar },
  { name: 'My Profile', path: '/profile', icon: UserIcon },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-uplivo-bg text-uplivo-text">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-uplivo-surface border-r border-uplivo-border shrink-0 fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-uplivo-border/60">
          <img src="/uplivo-logo.svg" alt="Uplivo Logo" className="w-8 h-8 rounded-lg" />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-uplivo-primary-light to-uplivo-accent bg-clip-text text-transparent">
              ALPHA++
            </span>
            <span className="text-[10px] tracking-wider text-uplivo-text-muted font-semibold uppercase -mt-1">
              Progress Report
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(`${item.path}/`));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-uplivo-primary text-white shadow-md shadow-uplivo-primary/25 font-semibold'
                    : 'text-uplivo-text-secondary hover:text-uplivo-text hover:bg-uplivo-card'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-uplivo-text-muted'}`} />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-uplivo-border/60 bg-uplivo-card/30">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-uplivo-primary/20 border border-uplivo-primary/40 flex items-center justify-center text-uplivo-primary-light font-bold text-sm shrink-0">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-uplivo-text truncate leading-tight">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-uplivo-text-muted truncate mt-0.5">
                {user?.collegeName || 'Student'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-uplivo-text-secondary hover:text-uplivo-error hover:bg-uplivo-error/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-uplivo-surface border-b border-uplivo-border z-30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/uplivo-logo.svg" alt="ALPHA++ Logo" className="w-7 h-7 rounded-lg" />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-uplivo-primary-light to-uplivo-accent bg-clip-text text-transparent">
            ALPHA++
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-uplivo-text-secondary hover:text-uplivo-text hover:bg-uplivo-card"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <aside className="fixed top-0 bottom-0 left-0 w-72 bg-uplivo-surface border-r border-uplivo-border flex flex-col z-50">
            <div className="h-16 px-6 flex items-center justify-between border-b border-uplivo-border/60">
              <div className="flex items-center gap-3">
                <img src="/uplivo-logo.svg" alt="Uplivo Logo" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-xl text-uplivo-text">Uplivo</span>
              </div>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-1.5 rounded-lg text-uplivo-text-muted hover:text-uplivo-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(`${item.path}/`));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-uplivo-primary text-white shadow-md shadow-uplivo-primary/25 font-semibold'
                        : 'text-uplivo-text-secondary hover:text-uplivo-text hover:bg-uplivo-card'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-uplivo-text-muted'}`} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-uplivo-border/60 bg-uplivo-card/30">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-9 h-9 rounded-full bg-uplivo-primary/20 border border-uplivo-primary/40 flex items-center justify-center text-uplivo-primary-light font-bold text-sm shrink-0">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-uplivo-text truncate leading-tight">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-uplivo-text-muted truncate mt-0.5">
                    {user?.collegeName || 'Student'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-uplivo-text-secondary hover:text-uplivo-error hover:bg-uplivo-error/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
