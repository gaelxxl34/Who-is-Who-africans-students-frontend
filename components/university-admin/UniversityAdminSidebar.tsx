'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaUniversity, 
  FaChartBar, 
  FaUsers, 
  FaGraduationCap,
  FaCertificate,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaBook,
  FaUserCheck
} from 'react-icons/fa';

interface UniversityAdminSidebarProps {
  user?: any;
  onLogout: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/university-admin/dashboard', icon: FaChartBar },
  { name: 'Students', href: '/university-admin/students', icon: FaUsers },
  { name: 'Courses', href: '/university-admin/courses', icon: FaBook },
  { name: 'Certificates', href: '/university-admin/certificates', icon: FaCertificate },
  { name: 'Transcripts', href: '/university-admin/transcripts', icon: FaFileAlt },
  { name: 'Verification', href: '/university-admin/verification', icon: FaUserCheck },
  { name: 'Settings', href: '/university-admin/settings', icon: FaCog },
];

export default function UniversityAdminSidebar({ user, onLogout }: UniversityAdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col flex-grow bg-white overflow-y-auto border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-600">
        <FaUniversity className="h-8 w-8 text-white" />
        <div className="ml-3">
          <h1 className="text-lg font-semibold text-white">EduChain</h1>
          <p className="text-xs text-blue-100">University Admin</p>
        </div>
      </div>

      {/* User info */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FaGraduationCap className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.profile?.firstName && user?.profile?.lastName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : user?.email || 'University Admin'
              }
            </p>
            <p className="text-xs text-gray-500">
              {user?.profile?.title || 'Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <button
          onClick={onLogout}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <FaSignOutAlt className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Sign out
        </button>
      </div>
    </div>
  );
}
