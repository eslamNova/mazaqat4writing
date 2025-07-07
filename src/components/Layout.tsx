import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenLine, Home, BookOpen, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import AnnouncementBanner from './AnnouncementBanner';
import Button from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  return (
    <div className={`min-h-screen flex flex-col w-full ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-black shadow-sm dark:border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-300">
              <BookOpen size={24} />
              <span>مذاقات أدبية</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-100"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            
            <Link to="/" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-100">
              <Home size={18} />
              <span>الرئيسية</span>
            </Link>
            <Link 
              to="/create" 
              className="flex items-center gap-1 px-4 py-2 bg-primary-500 dark:bg-primary-400 text-white dark:text-black rounded-md hover:bg-primary-600 dark:hover:bg-primary-300 transition-colors"
            >
              <PenLine size={18} />
              <span>نص جديد</span>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow w-full bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
          {location.pathname === '/' && <AnnouncementBanner />}
          <p>© {new Date().getFullYear()} - مذاقات أدبية</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;