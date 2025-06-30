'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import UniversityAdminLayout from '../../../components/university-admin/UniversityAdminLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  FaAward, 
  FaFileAlt, 
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChartLine,
  FaCalendarAlt,
  FaDownload
} from 'react-icons/fa';

interface DashboardStats {
  totalCertificates: number;
  pendingCertificates: number;
  approvedCertificates: number;
  totalTranscripts: number;
  pendingTranscripts: number;
  approvedTranscripts: number;
}

interface RecentActivity {
  id: string;
  type: 'certificate' | 'transcript';
  action: string;
  studentName: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function UniversityAdminDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCertificates: 0,
    pendingCertificates: 0,
    approvedCertificates: 0,
    totalTranscripts: 0,
    pendingTranscripts: 0,
    approvedTranscripts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data since university admin endpoints are in development
      const mockStats: DashboardStats = {
        totalCertificates: 156,
        pendingCertificates: 12,
        approvedCertificates: 144,
        totalTranscripts: 89,
        pendingTranscripts: 7,
        approvedTranscripts: 82,
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'certificate',
          action: 'Certificate Request',
          studentName: 'John Doe',
          date: '2024-01-15T10:30:00Z',
          status: 'pending'
        },
        {
          id: '2',
          type: 'transcript',
          action: 'Transcript Request',
          studentName: 'Jane Smith',
          date: '2024-01-14T14:20:00Z',
          status: 'approved'
        },
        {
          id: '3',
          type: 'certificate',
          action: 'Certificate Issued',
          studentName: 'Michael Johnson',
          date: '2024-01-14T09:15:00Z',
          status: 'approved'
        },
        {
          id: '4',
          type: 'transcript',
          action: 'Transcript Request',
          studentName: 'Sarah Wilson',
          date: '2024-01-13T16:45:00Z',
          status: 'pending'
        },
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <FaClock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <FaExclamationTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <FaClock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['university_admin']}>
        <UniversityAdminLayout user={user} onLogout={logout}>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </UniversityAdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['university_admin']}>
      <UniversityAdminLayout 
        user={user} 
        onLogout={logout}
        title="University Admin Dashboard"
        subtitle="Manage certificates, transcripts and institutional records"
      >
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.profile?.firstName || 'Administrator'}!
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your university's credential management today.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Certificates */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaAward className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Certificates</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCertificates}</p>
              </div>
            </div>
          </div>

          {/* Pending Certificates */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaClock className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Certificates</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingCertificates}</p>
              </div>
            </div>
          </div>

          {/* Total Transcripts */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaFileAlt className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Transcripts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTranscripts}</p>
              </div>
            </div>
          </div>

          {/* Pending Transcripts */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaClock className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Transcripts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingTranscripts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaCalendarAlt className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {activity.type === 'certificate' ? (
                            <FaAward className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FaFileAlt className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500">
                            Student: {activity.studentName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getStatusColor(activity.status)}`}>
                          {getStatusIcon(activity.status)}
                          <span className="ml-1 capitalize">{activity.status}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <FaAward className="w-4 h-4 mr-2" />
                  Manage Certificates
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                  <FaFileAlt className="w-4 h-4 mr-2" />
                  Manage Transcripts
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <FaChartBar className="w-4 h-4 mr-2" />
                  View Reports
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <FaDownload className="w-4 h-4 mr-2" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaChartLine className="w-5 h-5 mr-2 text-green-500" />
                  Performance
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Certificate Approval Rate</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transcript Processing</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">2.3 days avg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UniversityAdminLayout>
    </ProtectedRoute>
  );
}
