'use client';

import { useState, ReactNode } from 'react';
import { FaBars, FaCog, FaFileAlt, FaTachometerAlt, FaUniversity, FaUsers, FaUserTie } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  user: any;
  onLogout: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({ user, onLogout, children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/25" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <AdminSidebar 
              user={user} 
              onLogout={onLogout} 
              onClose={() => setSidebarOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar - fixed position */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-40 lg:w-64">
        <AdminSidebar user={user} onLogout={onLogout} />
      </div>

      {/* Main content - with proper padding and spacing */}
      <div className="flex-1 lg:ml-64">
        <main className="p-8">
          {/* Mobile menu button */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <FaBars className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Page header (if title is provided) */}
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
          )}

          {/* Page content */}
          {children}
        </main>
      </div>
    </div>
  );
}
