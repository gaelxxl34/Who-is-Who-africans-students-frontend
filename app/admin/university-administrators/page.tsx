'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUserTie,
  FaUniversity,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import EditUniversityAdminDialog from '../../../components/dialogs/EditUniversityAdminDialog';

// Define types to match backend response
interface UniversityAdmin {
  admin_id: string;
  user_id: string;
  university_id: string;
  first_name: string;
  last_name: string;
  title?: string;
  phone?: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  email: string;
  last_login?: string;
  admin_created_at: string;
  admin_updated_at: string;
  university_name: string;
  university_short_name?: string;
  university_country: string;
  university_city: string;
}

interface University {
  id: string;
  name: string;
  short_name?: string;
  country: string;
  city: string;
  is_active: boolean;
}

export default function UniversityAdministratorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<UniversityAdmin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<UniversityAdmin[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'university'>('newest');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [editingAdmin, setEditingAdmin] = useState<UniversityAdmin | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    loadUniversityAdmins();
  }, [pagination.page, selectedUniversity, selectedRole, searchTerm]);

  const loadUniversityAdmins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading university administrators from API...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🎫 Using token:', token.substring(0, 20) + '...');

      // Test backend connection first
      console.log('🔗 Testing backend connection...');
      const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/health`);
      console.log('💓 Health check status:', healthResponse.status);
      
      if (!healthResponse.ok) {
        throw new Error(`Backend health check failed: ${healthResponse.status}`);
      }
      
      console.log('✅ Backend is responding');

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      if (selectedUniversity !== 'all') queryParams.append('university_id', selectedUniversity);
      if (selectedRole !== 'all') queryParams.append('role', selectedRole);
      if (searchTerm) queryParams.append('search', searchTerm);

      const adminsUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/university-admins?${queryParams.toString()}`;
      const universitiesUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/universities-dropdown`;

      console.log('🔗 Making requests to:');
      console.log('  - Admins:', adminsUrl);
      console.log('  - Universities:', universitiesUrl);

      // Load admins and universities in parallel
      const [adminsResponse, universitiesResponse] = await Promise.all([
        fetch(adminsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(universitiesUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      console.log('📡 Response statuses:');
      console.log('  - Admins response:', adminsResponse.status, adminsResponse.ok);
      console.log('  - Universities response:', universitiesResponse.status, universitiesResponse.ok);

      // Check admins response
      if (!adminsResponse.ok) {
        const errorText = await adminsResponse.text();
        console.error('❌ Admins API error:', errorText);
        throw new Error(`Failed to fetch university admins: ${adminsResponse.status} - ${errorText}`);
      }

      // Check universities response
      if (!universitiesResponse.ok) {
        const errorText = await universitiesResponse.text();
        console.error('❌ Universities API error:', errorText);
        throw new Error(`Failed to fetch universities: ${universitiesResponse.status} - ${errorText}`);
      }

      const adminsData = await adminsResponse.json();
      const universitiesData = await universitiesResponse.json();

      console.log('✅ Raw API responses received:');
      console.log('  - Admins data:', adminsData);
      console.log('  - Universities data:', universitiesData);

      // Validate admins response
      if (!adminsData.success) {
        console.error('❌ Admins API reported failure:', adminsData.message);
        throw new Error(adminsData.message || 'Failed to fetch university administrators');
      }

      // Validate universities response
      if (!universitiesData.success) {
        console.error('❌ Universities API reported failure:', universitiesData.message);
        throw new Error(universitiesData.message || 'Failed to fetch universities');
      }

      const fetchedAdmins = adminsData.data?.universityAdmins || [];
      const fetchedUniversities = universitiesData.data || [];
      const fetchedPagination = adminsData.data?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      };

      console.log('📊 Processed data:');
      console.log(`  - Found ${fetchedAdmins.length} university administrators`);
      console.log(`  - Found ${fetchedUniversities.length} universities`);
      console.log('  - Pagination:', fetchedPagination);

      if (fetchedAdmins.length > 0) {
        console.log('📋 First admin sample:', fetchedAdmins[0]);
      } else {
        console.log('⚠️ No university administrators found');
      }

      setAdmins(fetchedAdmins);
      setUniversities(fetchedUniversities);
      setPagination(fetchedPagination);
      
      console.log('✅ Data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading university administrators:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setError(error instanceof Error ? error.message : 'Failed to load data');
      
      // Set empty data on error
      setAdmins([]);
      setUniversities([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortAdmins();
  }, [searchTerm, selectedRole, selectedUniversity, sortBy, admins]);

  const filterAndSortAdmins = () => {
    let filtered = admins;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(admin =>
        `${admin.first_name} ${admin.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.university_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(admin => admin.role === selectedRole);
    }

    // Filter by university
    if (selectedUniversity !== 'all') {
      filtered = filtered.filter(admin => admin.university_id === selectedUniversity);
    }

    // Sort admins
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.admin_created_at).getTime() - new Date(a.admin_created_at).getTime();
        case 'oldest':
          return new Date(a.admin_created_at).getTime() - new Date(b.admin_created_at).getTime();
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'university':
          return a.university_name.localeCompare(b.university_name);
        default:
          return 0;
      }
    });

    setFilteredAdmins(filtered);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'registrar':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'academic_officer':
        return 'bg-green-100 text-green-800';
      case 'university_admin':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'registrar':
        return 'Registrar';
      case 'admin':
        return 'Administrator';
      case 'academic_officer':
        return 'Academic Officer';
      case 'university_admin':
        return 'University Admin';
      default:
        return role;
    }
  };

  const handleToggleStatus = async (adminId: string, currentStatus: boolean) => {
    console.log(`🔄 Toggling status for admin ${adminId} to ${!currentStatus}`);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/university-admins/${adminId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: !currentStatus
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update admin status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update admin status');
      }

      // Update local state
      setAdmins(prev => prev.map(admin => 
        admin.admin_id === adminId 
          ? { ...admin, is_active: !currentStatus }
          : admin
      ));
      
      console.log('✅ Admin status updated successfully');
    } catch (error) {
      console.error('❌ Error updating admin status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update admin status');
    }
  };

  const handleEditAdmin = (admin: UniversityAdmin) => {
    console.log('✏️ Opening edit dialog for admin:', admin.admin_id);
    console.log('📋 Complete admin data being passed:', admin);
    
    setEditingAdmin(admin);
    setIsEditDialogOpen(true);
  };

  const handleSaveAdmin = async (updatedAdmin: UniversityAdmin) => {
    try {
      console.log('🔄 Updating university admin:', updatedAdmin);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/university-admins/${updatedAdmin.admin_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: updatedAdmin.first_name,
            last_name: updatedAdmin.last_name,
            title: updatedAdmin.title,
            phone: updatedAdmin.phone,
            university_id: updatedAdmin.university_id,
            role: updatedAdmin.role,
            permissions: updatedAdmin.permissions,
            is_active: updatedAdmin.is_active
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update administrator: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update administrator');
      }
      
      console.log('✅ Admin updated successfully:', result);
      
      // Refresh the list
      await loadUniversityAdmins();
      
    } catch (error) {
      console.error('❌ Error updating admin:', error);
      throw error;
    }
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingAdmin(null);
  };

  const handleDeleteAdmin = async (admin: UniversityAdmin) => {
    if (!confirm(`Are you sure you want to delete ${admin.first_name} ${admin.last_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting admin:', admin.email);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/university-admins/${admin.admin_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete administrator: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete administrator');
      }
      
      // Refresh the list
      await loadUniversityAdmins();
      
      console.log('✅ Admin deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting admin:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete administrator');
    }
  };

  const handleCreateAdmin = () => {
    router.push('/admin/university-administrators/create');
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout 
        user={user} 
        onLogout={logout}
      >
        <div className="w-full max-w-full">

          {/* Header with Create Button */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">University Administrators</h1>
              <p className="text-sm text-gray-600 mt-1">
                {pagination.total} total administrators across {universities.length} universities
              </p>
            </div>
            <button
              onClick={handleCreateAdmin}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <FaPlus className="w-3.5 h-3.5 mr-1.5" />
              Create Admin
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
              <div className="mt-3">
                <button
                  onClick={loadUniversityAdmins}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Filters and search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Role filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Roles</option>
                <option value="registrar">Registrars</option>
                <option value="admin">Administrators</option>
                <option value="academic_officer">Academic Officers</option>
                <option value="university_admin">University Admins</option>
              </select>

              {/* University filter */}
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Universities</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="university">University A-Z</option>
              </select>

              {/* Results count */}
              <div className="flex items-center text-xs text-gray-600">
                Showing {filteredAdmins.length} of {admins.length} administrators
              </div>
            </div>
          </div>

          {/* Admins table */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Administrator
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      University
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Role
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Permissions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Status
                    </th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                
                {loading ? (
                  <tbody>
                    {[...Array(3)].map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap">
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-gray-200">
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center">
                          <div className="text-center py-6">
                            <FaUserTie className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No university administrators found</p>
                            <p className="text-gray-400 text-sm mt-1">
                              {searchTerm || selectedUniversity !== 'all' || selectedRole !== 'all' 
                                ? 'Try adjusting your search criteria' 
                                : 'Create your first university administrator'
                              }
                            </p>
                            {!searchTerm && selectedUniversity === 'all' && selectedRole === 'all' && (
                              <button
                                onClick={handleCreateAdmin}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                              >
                                <FaPlus className="w-4 h-4" />
                                Create First Admin
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((admin) => (
                        <tr key={admin.admin_id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {admin.first_name} {admin.last_name}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-[180px]">{admin.email}</div>
                              {admin.phone && (
                                <div className="text-xs text-gray-400 truncate max-w-[180px]">{admin.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <FaUniversity className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{admin.university_name}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[140px]">{admin.university_city}, {admin.university_country}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getRoleColor(admin.role)}`}>
                              {getRoleLabel(admin.role)}
                            </span>
                          </td>
                          <td className="hidden md:table-cell px-4 py-3">
                            <div className="text-xs text-gray-500">
                              {admin.permissions?.length || 0} permissions
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleStatus(admin.admin_id, admin.is_active)}
                              className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                                admin.is_active 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {admin.is_active ? (
                                <>
                                  <FaToggleOn className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <FaToggleOff className="w-3 h-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-700">
                            {new Date(admin.admin_created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditAdmin(admin)}
                                className="text-green-600 hover:text-green-900 transition-colors p-1.5 rounded hover:bg-green-50"
                                title="Edit Administrator"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAdmin(admin)}
                                className="text-red-600 hover:text-red-900 transition-colors p-1.5 rounded hover:bg-red-50"
                                title="Delete Administrator"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                )}
              </table>
            </div>
          </div>

          {/* Pagination */}
          {!loading && filteredAdmins.length > 0 && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 border border-gray-200 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span> 
                    {' '}({pagination.total} total results)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit University Admin Dialog */}
        <EditUniversityAdminDialog
          admin={editingAdmin}
          universities={universities}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          onSave={handleSaveAdmin}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
