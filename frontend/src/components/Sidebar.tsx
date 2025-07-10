import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Languages, Menu, X } from 'lucide-react';
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'F';

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'} 
        bg-white shadow-lg flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-green-50">
          {!isCollapsed && (
            <img
              src="/Asset 5.png"
              alt="Agro AI Logo"
              className="h-12 sm:h-16 lg:h-20 mx-auto my-2 transition-all duration-300"
              style={{ objectFit: 'contain' }}
            />
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center px-4 py-3 mb-1 mx-2 rounded-lg transition-all duration-200
                ${location.pathname === item.path
                  ? 'bg-green-50 text-green-600 border-r-4 border-green-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center w-full">
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="ml-3 text-sm sm:text-base font-medium">{t(item.name)}</span>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Language Switcher */}
        <div className="border-t p-4 bg-gray-50">
          <button
            onClick={toggleLanguage}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors hover:bg-gray-100
              ${isCollapsed ? 'justify-center' : 'justify-between'}
              text-gray-600 hover:text-gray-900`}
          >
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{t(language === 'en' ? 'sidebar.urdu' : 'sidebar.english')}</span>
              )}
            </div>
          </button>
        </div>

        {/* User Profile Section */}
        <div className="border-t p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-semibold text-sm">{userInitial}</span>
              </div>
              {!isCollapsed && (
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || t('common.farmer')}</p>
                  <p className="text-xs text-gray-500 truncate">{t('common.viewProfile')}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-2 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('sidebar.logout')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;