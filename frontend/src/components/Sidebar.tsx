import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

interface SidebarProps {
  items: {
    path: string;
    name: string;
    icon: React.ReactNode;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'F';

  const handleLogout = () => {
    dispatch(logout());
    // Optionally, redirect to login page here
    window.location.href = '/login';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  return (
    <div className={`bg-white h-screen shadow-lg flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo Section */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <img
            src="/Asset 5.png"
            alt="Agro AI Logo"
            className="h-20  mx-auto my-2"
            style={{ objectFit: 'contain' }}
          />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 mb-1 transition-colors
              ${location.pathname === item.path
                ? 'bg-green-50 text-green-600 border-r-4 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center">
              {item.icon}
              {!isCollapsed && <span className="ml-3">{t(item.name)}</span>}
            </div>
          </Link>
        ))}
      </nav>

      {/* Language Switcher */}
      <div className="border-t p-4">
        <button
          onClick={toggleLanguage}
          className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } text-gray-600 hover:bg-gray-50`}
        >
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5" />
            {!isCollapsed && <span>{t(language === 'en' ? 'sidebar.urdu' : 'sidebar.english')}</span>}
          </div>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-semibold">{userInitial}</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.name || t('common.farmer')}</p>
                <p className="text-xs text-gray-500">{t('common.viewProfile')}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              {t('sidebar.logout')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;