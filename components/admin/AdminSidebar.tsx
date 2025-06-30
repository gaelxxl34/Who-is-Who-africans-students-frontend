'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FaUsers,
  FaGraduationCap,
  FaBuilding,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaChevronDown,
  FaBell,
  FaUniversity
} from 'react-icons/fa';

interface AdminSidebarProps {
  user: any;
  onLogout: () => void;
  onClose?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  submenu?: { name: string; href: string }[];
}

export default function AdminSidebar({ user, onLogout, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [universitiesDropdownOpen, setUniversitiesDropdownOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: FaChartLine 
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: FaUsers 
    },
    { 
      name: 'Universities', 
      href: '/admin/universities', 
      icon: FaUniversity,
      submenu: [
        { name: 'Manage Universities', href: '/admin/universities' },
        { name: 'University Admins', href: '/admin/university-administrators' }
      ]
    },
    { 
      name: 'Credentials', 
      href: '/admin/credentials', 
      icon: FaGraduationCap 
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: FaCog 
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    if (onClose) onClose();
  };

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg border-r border-gray-200">
      {/* Header with logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg w-8 h-8 flex items-center justify-center font-bold text-lg">
            W
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">
              <span className="text-green-700">Who is</span> <span className="text-blue-700">Who</span>
            </h2>
            <p className="text-[10px] text-gray-500 leading-tight -mt-1">East Africa Education Platform</p>
          </div>
        </Link>
        
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <FaTimes className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
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
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            pathname === subitem.href
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User profile and logout section */}
      <div className="border-t border-gray-200 p-4">
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {(user?.firstName || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {(() => {
                  // Try multiple data sources for the name
                  const profile = user?.profile;
                  const firstName = profile?.first_name || user?.firstName;
                  const lastName = profile?.last_name || user?.lastName;
                  
                  if (firstName && lastName) {
                    return `${firstName} ${lastName}`;
                  } else if (firstName) {
                    return firstName;
                  } else if (user?.displayName) {
                    return user.displayName;
                  } else {
                    return 'Admin User';
                  }
                })()}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
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
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-600 bg-white hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
