'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUniversities: 0,
    totalCredentials: 0,
    recentVerifications: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    // This would be replaced with an actual API call
    setStats({
      totalUsers: 245,
      totalUniversities: 12,
      totalCredentials: 1893,
      recentVerifications: 48
    });
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout 
        user={user} 
        onLogout={logout}
        title="Dashboard"
        subtitle="Overview of system statistics and recent activity"
      >
        {/* Dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats cards */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium">Total Universities</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUniversities}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-medium">Total Credentials</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCredentials}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-medium">Recent Verifications</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.recentVerifications}</p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {/* Activity log table or list component would go here */}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
