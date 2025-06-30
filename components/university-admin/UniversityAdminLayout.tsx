'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaGraduationCap, 
  FaCertificate, 
  FaFileAlt, 
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUniversity,
  FaUserGraduate,
  FaBookOpen,
  FaAward,
  FaChevronDown,
  FaBell,
  FaUserCircle
} from 'react-icons/fa';

interface UniversityAdminLayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  submenu?: { name: string; href: string }[];
}

export default function UniversityAdminLayout({ 
  children, 
  user, 
  onLogout,
  title,
  subtitle 
}: UniversityAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationState, setNavigationState] = useState<'idle' | 'navigating' | 'loading'>('idle');
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { 
      name: 'Dashboard', 
      href: '/university-admin/dashboard', 
      icon: FaTachometerAlt
    },
    { 
      name: 'Academic Records', 
      href: '/university-admin/academic-records', 
      icon: FaGraduationCap
    },
    { 
      name: 'Reports', 
      href: '/university-admin/reports', 
      icon: FaChartBar
    },
    { 
      name: 'Settings', 
      href: '/university-admin/settings', 
      icon: FaCog
    }
  ];

  // Enhanced navigation with preloading and seamless transitions
  const handleNavigation = useCallback((href: string) => {
    if (pathname === href) {
      setSidebarOpen(false);
      return;
    }
    
    // Start navigation sequence
    setNextPath(href);
    setNavigationState('navigating');
    setSidebarOpen(false);
    
    // Use router.replace for instant navigation without page disappearing
    setTimeout(() => {
      router.replace(href);
    }, 50); // Very brief delay to ensure state is set
    
  }, [pathname, router]);

  // Reset navigation state when route actually changes
  useEffect(() => {
    if (pathname === nextPath && navigationState === 'navigating') {
      setNavigationState('loading');
      // Give the new page time to render
      setTimeout(() => {
        setNavigationState('idle');
        setNextPath(null);
      }, 200);
    }
  }, [pathname, nextPath, navigationState]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  // Helper functions for page title and subtitle
  const getPageTitle = () => {
    if (title) return title;
    
    const currentItem = menuItems.find(item => item.href === pathname);
    return currentItem ? currentItem.name : 'University Administration';
  };

  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    
    const subtitleMap: Record<string, string> = {
      '/university-admin/dashboard': 'Overview and analytics',
      '/university-admin/academic-records': 'Manage student certificates and transcripts',
      '/university-admin/reports': 'Analytics and reports',
      '/university-admin/settings': 'University settings'
    };
    
    return subtitleMap[pathname] || 'Manage your university operations';
  };

  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-white shadow-lg border-r border-gray-200">
      {/* Header with logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link href="/university-admin/dashboard" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg w-8 h-8 flex items-center justify-center font-bold text-lg">
            W
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">
              <span className="text-green-700">Who is</span> <span className="text-blue-700">Who</span>
            </h2>
            <p className="text-[10px] text-gray-500 leading-tight -mt-1">University Admin Portal</p>
          </div>
        </Link>
        
        <button 
          onClick={() => setSidebarOpen(false)} 
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
        >
          <FaTimes className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isNavigating = nextPath === item.href && navigationState !== 'idle';
            
            return (
              <div key={item.name} className="mb-1">
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
                        pathname.startsWith(item.href)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      <FaChevronDown 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          openSubmenu === item.name ? 'transform rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {/* Submenu */}
                    {openSubmenu === item.name && (
                      <div className="ml-9 mt-1 space-y-1">
                        {item.submenu.map((subitem) => (
                          <button
                            key={subitem.href}
                            onClick={() => handleNavigation(subitem.href)}
                            disabled={navigationState !== 'idle'}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                              pathname === subitem.href
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } ${navigationState !== 'idle' ? 'opacity-75' : ''}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            <span>{subitem.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.href)}
                    disabled={navigationState !== 'idle'}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : isNavigating
                        ? 'bg-blue-25 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    } ${navigationState !== 'idle' ? 'opacity-75' : ''}`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive || isNavigating ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <div className="flex items-center flex-1">
                      <span>{item.name}</span>
                      {isNavigating && (
                        <div className="ml-2 w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    {isActive && !isNavigating && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User profile and logout section */}
      <div className="border-t border-gray-200 p-4">
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {(user?.profile?.firstName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {(() => {
                  // Try multiple data sources for the name
                  const profile = user?.profile;
                  const firstName = profile?.firstName || user?.firstName;
                  const lastName = profile?.lastName || user?.lastName;
                  
                  if (firstName && lastName) {
                    return `${firstName} ${lastName}`;
                  } else if (firstName) {
                    return firstName;
                  } else if (user?.displayName) {
                    return user.displayName;
                  } else {
                    return 'University Admin';
                  }
                })()}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@university.edu'}</p>
            </div>
            
            <button 
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <FaBell className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          disabled={navigationState !== 'idle'}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-600 bg-white hover:bg-red-50 rounded-lg border border-gray-200 transition-colors ${
            navigationState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span>{navigationState !== 'idle' ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {renderSidebar()}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0">
        <div className="flex flex-col w-64">
          {renderSidebar()}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarOpen(true)}
                >
                  <FaBars className="h-6 w-6" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">{getPageSubtitle()}</p>
                </div>
              </div>
              
              {/* Header actions */}
              <div className="flex items-center space-x-4">
                {/* Navigation loading indicator */}
                {navigationState !== 'idle' && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span>Loading...</span>
                  </div>
                )}
                
                {/* User info on desktop */}
                <div className="hidden md:flex items-center text-sm text-gray-700">
                  <FaUserCircle className="w-6 h-6 text-gray-400 mr-2" />
                  <span>{user?.profile?.firstName || user?.firstName || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content with seamless transitions */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Content container with transition overlay */}
            <div className={`relative transition-all duration-300 ${
              navigationState === 'navigating' 
                ? 'opacity-90 scale-[0.99]' 
                : navigationState === 'loading'
                ? 'opacity-95 scale-[0.995]'
                : 'opacity-100 scale-100'
            }`}>
              {/* Seamless loading overlay - only shows during navigation */}
              {navigationState === 'navigating' && (
                <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-1 text-xs text-gray-600">Loading page...</p>
                  </div>
                </div>
              )}
              
              <div className="animate-fadeIn">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
