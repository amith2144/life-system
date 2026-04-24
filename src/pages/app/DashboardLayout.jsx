import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { LogOut, LayoutDashboard, LayoutGrid, CheckSquare, Target, Inbox, Calendar, Zap, ZapOff, Moon, Sun } from 'lucide-react';

export default function DashboardLayout() {
  const { user, signOut, liteMode, toggleLiteMode } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const navItems = [
    { name: 'Today', path: '/app', icon: LayoutDashboard },
    { name: '6 Areas', path: '/app/areas', icon: LayoutGrid },
    { name: 'Habits', path: '/app/habits', icon: CheckSquare },
    { name: 'Goals', path: '/app/goals', icon: Target },
    { name: 'Capture', path: '/app/capture', icon: Inbox },
    { name: 'Weekly', path: '/app/weekly', icon: Calendar },
    { name: 'Plan Future', path: '/app/planner', icon: Calendar },
  ];

  return (
    <div className="bg-background dark:bg-dark min-h-screen text-dark dark:text-background flex selection:bg-accent selection:text-white transition-colors duration-300">
      <div className="noise-overlay"></div>
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#1A1A1A] border-r border-dark/10 dark:border-white/10 flex flex-col relative z-20 h-screen sticky top-0 transition-colors duration-300">
        <div className="p-6">
          <div className="font-heading font-bold text-2xl tracking-tight mb-8 dark:text-white">Life System</div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 radius-sys transition-colors font-sans font-medium text-sm ${
                    isActive ? 'bg-dark text-white dark:bg-white dark:text-dark' : 'text-dark/70 dark:text-white/70 hover:bg-dark/5 dark:hover:bg-white/5 hover:text-dark dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <button 
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-between px-4 py-3 radius-sys border transition-colors bg-background dark:bg-dark border-dark/10 dark:border-white/10 text-dark/60 dark:text-white/60 hover:bg-dark/5 dark:hover:bg-white/5 hover:text-dark dark:hover:text-white`}
          >
            <div className="flex items-center space-x-3">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-sans font-medium text-sm">Theme</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-white/20' : 'bg-dark/20'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-4' : ''}`}></div>
            </div>
          </button>

          <button 
            onClick={toggleLiteMode}
            className={`w-full flex items-center justify-between px-4 py-3 radius-sys border transition-colors ${
              liteMode ? 'bg-accent/10 border-accent text-accent' : 'bg-background dark:bg-dark border-dark/10 dark:border-white/10 text-dark/60 dark:text-white/60 hover:bg-dark/5 dark:hover:bg-white/5 hover:text-dark dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              {liteMode ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
              <span className="font-sans font-medium text-sm">Lite Mode</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${liteMode ? 'bg-accent' : 'bg-dark/20 dark:bg-white/20'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${liteMode ? 'translate-x-4' : ''}`}></div>
            </div>
          </button>

          <div className="pt-4 border-t border-dark/10 dark:border-white/10">
            <div className="font-data text-xs text-dark/50 dark:text-white/50 mb-3 truncate">{user?.email}</div>
            <button 
              onClick={signOut} 
              className="flex items-center space-x-3 text-dark/60 dark:text-white/60 hover:text-accent dark:hover:text-accent transition-colors font-sans font-medium text-sm w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 relative z-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
