import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, Briefcase, Sparkles, LineChart, Settings, LogOut, Menu, X, Moon, Sun, History } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const SidebarLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Find Jobs', path: '/jobs', icon: Search },
    { name: 'My Applications', path: '/applications', icon: Briefcase },
    { name: 'AI Cover Letter', path: '/cover-letter', icon: Sparkles },
    { name: 'Letter History', path: '/letter-history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-accent">JobTrack AI</h1>
            <button className="lg:hidden text-textSecondary" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="px-6 pb-6 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accentLight text-accent flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-textPrimary truncate">{user?.name}</p>
              <p className="text-xs text-textMuted truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-accent/10 text-accent font-medium' 
                      : 'text-textSecondary hover:bg-surface2 hover:text-textPrimary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} className={isActive ? 'text-accent' : ''} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-textSecondary hover:bg-surface2 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
          <div className="flex items-center">
            <button onClick={() => setIsOpen(true)} className="text-textSecondary mr-3">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-heading font-bold text-accent">JobTrack AI</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-accentLight text-accent flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full relative">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
