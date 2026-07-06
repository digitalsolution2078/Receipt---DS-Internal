import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { LogOut, Receipt, LayoutDashboard, PlusCircle, Users, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Create Receipt', path: '/create', icon: PlusCircle },
    { name: 'Receipts', path: '/receipts', icon: Receipt },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ name: 'Staff Users', path: '/users', icon: Users });
    navItems.push({ name: 'Settings', path: '/settings', icon: SettingsIcon });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-200">
          <div className="w-10 h-10 bg-purple-900 rounded-sm flex items-center justify-center text-white font-bold text-xl">DS</div>
          <span className="font-bold text-purple-900 text-lg leading-tight">Digital Solution</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-sm font-semibold transition-colors",
                  isActive
                    ? "bg-purple-50 text-purple-900 border-l-4 border-purple-900"
                    : "text-gray-500 hover:bg-gray-50 border-l-4 border-transparent"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-sm bg-orange-50 flex items-center justify-center text-orange-600 font-bold border border-orange-200 text-sm uppercase">
              {profile?.email?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-purple-900 truncate" title={profile?.email}>{profile?.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-bold text-red-600 rounded-sm border border-red-100 hover:bg-red-50 transition-colors uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden font-sans text-gray-800">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 bg-purple-900 rounded-sm flex items-center justify-center text-white font-bold text-sm">DS</div>
            <h1 className="text-lg font-bold text-purple-900">Digital Solution</h1>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-end">
             <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 rounded-sm border border-gray-200 hover:bg-gray-50 transition-colors uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
          </div>
          <button onClick={handleLogout} className="text-gray-500 md:hidden">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-white md:bg-gray-50">
          <Outlet />
        </main>
        
        {/* Mobile Nav */}
        <nav className="bg-white border-t border-gray-200 p-2 flex justify-around md:hidden">
          {navItems.slice(0,4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center p-2 rounded-md transition-colors",
                  isActive ? "text-purple-900" : "text-gray-500"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
