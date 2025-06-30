'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  FaSearch,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import UserEditDialog from '../../../components/dialogs/UserEditDialog';
import DeleteConfirmationDialog from '../../../components/dialogs/DeleteConfirmationDialog';

interface User {
  id: string;
  email: string;
  user_type: 'student' | 'employer' | 'admin';
  is_email_verified: boolean;
  created_at: string;
  displayName: string;
  profile?: {
    id?: string;
    // Common fields (all tables have these)
    first_name?: string;
    last_name?: string;
    phone?: string;
    last_login?: string;
    
    // Student-specific fields (ONLY actual columns in student_profiles)
    // Note: student_profiles only has: first_name, last_name, phone
    
    // Employer-specific fields (actual employer_profiles columns)
    company_name?: string;
    industry?: string;
    country?: string;
    city?: string;
    
    // Admin-specific fields (actual admin_profiles columns)
    role?: string;
    permissions?: string[];
    is_active?: boolean;
  };
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    // Only load users data, let ProtectedRoute handle auth
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Connecting to backend API...');
      
      // Get the stored token
      const token = localStorage.getItem('token');
      console.log('🎫 Retrieved token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // First check if backend is running
      const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/health`, {
        method: 'GET',
      }).catch(err => {
        console.error('❌ Backend health check failed:', err);
        throw new Error('Cannot connect to backend server. Please make sure it is running.');
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Backend health check failed: ${healthResponse.status}`);
      }
      
      console.log('✅ Backend server is running');
      
      // Fetch actual users from API using correct admin endpoint
      console.log('🔄 Fetching users from API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API error:', errorData);
        throw new Error(errorData.message || `API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Users data received:', data);
      
      if (!data.success || !data.data?.users || !Array.isArray(data.data.users)) {
        console.error('❌ Invalid response format:', data);
        throw new Error('Invalid data format returned from API');
      }
      
      // Transform API data to our User interface with ONLY ACTUAL profile data
      const fetchedUsers: User[] = data.data.users.map((apiUser: any) => {
        console.log('🔧 Transforming user:', apiUser.email, 'Type:', apiUser.user_type);
        console.log('🔧 Raw API user data:', apiUser);
        
        let displayName = apiUser.email; // Default fallback
        let completeProfile = null;
        
        // FIX: Handle both object and array formats for profile data
        // Extract ONLY actual database fields for each user type
        if (apiUser.user_type === 'student') {
          // Check if student_profiles exists as object or array
          let profile = null;
          if (apiUser.student_profiles) {
            if (Array.isArray(apiUser.student_profiles) && apiUser.student_profiles.length > 0) {
              profile = apiUser.student_profiles[0];
            } else if (!Array.isArray(apiUser.student_profiles)) {
              profile = apiUser.student_profiles;
            }
          }
          
          if (profile) {
            console.log('🔧 Student profile found:', profile);
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            displayName = fullName || apiUser.email;
            
            // Store ONLY actual student_profiles columns
            completeProfile = {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              phone: profile.phone
            };
          }
          
        } else if (apiUser.user_type === 'employer') {
          // Check if employer_profiles exists as object or array
          let profile = null;
          if (apiUser.employer_profiles) {
            if (Array.isArray(apiUser.employer_profiles) && apiUser.employer_profiles.length > 0) {
              profile = apiUser.employer_profiles[0];
            } else if (!Array.isArray(apiUser.employer_profiles)) {
              profile = apiUser.employer_profiles;
            }
          }
          
          if (profile) {
            console.log('🔧 Employer profile found:', profile);
            displayName = profile.company_name || apiUser.email;
            
            // Store ONLY actual employer_profiles columns
            completeProfile = {
              id: profile.id,
              company_name: profile.company_name,
              industry: profile.industry,
              phone: profile.phone,
              country: profile.country,
              city: profile.city
            };
          }
          
        } else if (apiUser.user_type === 'admin') {
          // Check if admin_profiles exists as object or array
          let profile = null;
          if (apiUser.admin_profiles) {
            if (Array.isArray(apiUser.admin_profiles) && apiUser.admin_profiles.length > 0) {
              profile = apiUser.admin_profiles[0];
            } else if (!Array.isArray(apiUser.admin_profiles)) {
              profile = apiUser.admin_profiles;
            }
          }
          
          if (profile) {
            console.log('🔧 Admin profile found:', profile);
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            displayName = fullName || apiUser.email;
            
            // Store ONLY actual admin_profiles columns
            completeProfile = {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              phone: profile.phone,
              role: profile.role || 'admin',
              permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
              is_active: profile.is_active !== false,
              last_login: profile.last_login
            };
          }
        }
        
        if (!completeProfile) {
          console.log('❌ No profile found for user:', apiUser.email, 'Type:', apiUser.user_type);
          console.log('❌ Available profile data:', {
            student_profiles: apiUser.student_profiles,
            employer_profiles: apiUser.employer_profiles,
            admin_profiles: apiUser.admin_profiles
          });
        }
        
        const transformedUser: User = {
          id: apiUser.id,
          email: apiUser.email,
          user_type: apiUser.user_type,
          is_email_verified: apiUser.is_email_verified,
          created_at: apiUser.created_at,
          displayName: displayName,
          profile: completeProfile || undefined
        };
        
        console.log('✅ Transformed user:', transformedUser.email, 'Profile:', completeProfile ? 'Complete' : 'Missing');
        console.log('📋 Final profile data for', transformedUser.email, ':', completeProfile);
        return transformedUser;
      });
      
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      
      console.log(`✅ Successfully loaded ${fetchedUsers.length} users with complete profile data`);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      
      // Fallback to mock data for development
      console.log('⚠️ Using mock data instead');
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          user_type: 'student',
          is_email_verified: true,
          created_at: '2024-01-15T10:30:00Z',
          displayName: 'John Doe',
          profile: { 
            id: '1', 
            first_name: 'John', 
            last_name: 'Doe', 
            phone: '+256700000001',
            country: 'Uganda',
            city: 'Kampala'
          }
        },
        {
          id: '2',
          email: 'jane.smith@company.com',
          user_type: 'employer',
          is_email_verified: true,
          created_at: '2024-01-10T09:15:00Z',
          displayName: 'Tech Corp',
          profile: { 
            id: '2', 
            company_name: 'Tech Corp', 
            industry: 'Technology', 
            country: 'Uganda', 
            city: 'Kampala', 
            phone: '+256700000002',
            first_name: 'Jane',
            last_name: 'Smith'
          }
        }
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      // Add a small delay before removing loading state for smoother transition
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    filterAndSortUsers();
  }, [searchTerm, selectedRole, sortBy, users]);

  const filterAndSortUsers = () => {
    let filtered = users;

    // Filter by search term - search in email and display name
    if (searchTerm) {
      filtered = filtered.filter(user =>
        (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.user_type === selectedRole);
    }

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return (a.displayName || a.email).localeCompare(b.displayName || b.email);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'employer':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const handleEditUser = (user: User) => {
    console.log('✏️ Opening edit dialog for user:', user.email);
    console.log('📋 Complete user data being passed:', user);
    console.log('📋 User profile being passed:', user.profile);
    
    // Enhanced debugging
    if (!user.profile) {
      console.error('❌ CRITICAL: No profile data available for user:', user.email);
      console.error('❌ This means the profile transformation in loadUsers() failed');
      console.error('❌ User object:', JSON.stringify(user, null, 2));
      
      // Show user-friendly error
      alert(`No profile data available for ${user.email}. Please refresh the page and try again.`);
      return;
    }
    
    console.log('📋 Profile fields:');
    if (user.profile) {
      console.log('  - id:', user.profile.id);
      console.log('  - first_name:', user.profile.first_name);
      console.log('  - last_name:', user.profile.last_name);
      console.log('  - phone:', user.profile.phone);
      console.log('  - company_name:', user.profile.company_name);
      console.log('  - industry:', user.profile.industry);
    } else {
      console.log('  - NO PROFILE DATA!');
    }
    
    // Verify we have the minimum required data
    const hasRequiredData = user.profile && (
      (user.user_type === 'student' && (user.profile.first_name || user.profile.last_name)) ||
      (user.user_type === 'employer' && user.profile.company_name) ||
      (user.user_type === 'admin' && (user.profile.first_name || user.profile.last_name))
    );
    
    if (!hasRequiredData) {
      console.error('❌ CRITICAL: Missing required profile data for editing');
      alert(`Incomplete profile data for ${user.email}. Please contact support.`);
      return;
    }
    
    console.log('✅ All required profile data present, opening edit dialog');
    
    // No API call needed - we already have all the data!
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async (updatedUser: any) => {
    try {
      console.log('🔄 Updating user:', updatedUser);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(updatedUser)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      const data = await response.json();
      console.log('✅ User updated successfully:', data);
      
      // Refresh users list
      await loadUsers();
      
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  };

  const handleDeleteUser = (userToDelete: User) => {
    console.log('🗑️ Preparing to delete user:', userToDelete.email);
    console.log('🗑️ Full user object:', userToDelete);
    console.log('🗑️ Current logged-in admin user:', user); // Add this for debugging
    
    // FIX: Compare the user being deleted with the currently logged-in admin user
    if (userToDelete.id === user?.id) {
      console.log('❌ Self-deletion attempt blocked - user trying to delete themselves');
      console.log('❌ User to delete ID:', userToDelete.id);
      console.log('❌ Current admin ID:', user?.id);
      alert('You cannot delete your own account while logged in.');
      return;
    }

    
    console.log('✅ Setting user for deletion and opening dialog');
    console.log('✅ User to delete:', userToDelete.email, 'ID:', userToDelete.id);
    console.log('✅ Current admin:', user?.email, 'ID:', user?.id);
    setDeletingUser(userToDelete);
    setIsDeleteDialogOpen(true);
    console.log('🗑️ Dialog state set - deletingUser:', userToDelete.email, 'isOpen:', true);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) {
      console.error('❌ No user selected for deletion');
      throw new Error('No user selected for deletion');
    }

    console.log('🗑️ Executing delete API call for user:', deletingUser.id);
    console.log('🗑️ User details:', {
      id: deletingUser.id,
      email: deletingUser.email,
      displayName: deletingUser.displayName,
      user_type: deletingUser.user_type
    });

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('No authentication token found');
    }

    console.log('🔗 Making DELETE request to:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/users/${deletingUser.id}`);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/users/${deletingUser.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('📡 DELETE response status:', response.status);
    console.log('📡 DELETE response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Delete API error:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to delete user`);
    }

    const result = await response.json();
    console.log('✅ Delete API response:', result);

    if (!result.success) {
      console.error('❌ Delete operation reported failure:', result);
      throw new Error(result.message || 'Delete operation reported failure');
    }

    console.log('🔄 Refreshing users list after successful deletion');
    // Refresh the users list after successful deletion
    await loadUsers();

    return result;
  };

  const handleCloseDeleteDialog = () => {
    console.log('🚪 Closing delete dialog');
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
    console.log('🗑️ Dialog state cleared - isOpen: false, deletingUser: null');
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout 
        user={user} 
        onLogout={logout}
        title="User Management"
        subtitle="Manage all system users and their roles"
      >
        {/* Filters and search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>

            {/* Results count */}
            <div className="flex items-center text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    User Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              
              {loading ? (
                // Elegant skeleton loading for the table
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 bg-gray-200 rounded"></div>
                          <div className="h-6 w-6 bg-gray-200 rounded"></div>
                          <div className="h-6 w-6 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                // Actual data
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-center py-8">
                          <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No users found</p>
                          <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full capitalize ${
                            user.user_type === 'admin' ? 'bg-red-100 text-red-800' :
                            user.user_type === 'employer' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full capitalize ${
                            user.is_email_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            <span className={`w-2 h-2 mr-1.5 rounded-full ${
                              user.is_email_verified ? 'bg-green-500' : 'bg-gray-500'
                            }`}></span>
                            {user.is_email_verified ? 'verified' : 'unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.profile?.last_login ? new Date(user.profile.last_login).toLocaleDateString() : 
                            <span className="text-gray-400 italic">Never</span>}
                        </td>
                        {/* User table actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-green-600 hover:text-green-900 transition-colors p-1.5 rounded hover:bg-green-50"
                              title="Edit User"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1.5 rounded hover:bg-red-50"
                              title="Delete User"
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
        
        {/* Refresh button for better UX */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => loadUsers()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>
        
        {/* Pagination - fix the broken HTML structure */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 border border-gray-200 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
                  <span className="font-medium">{filteredUsers.length}</span> results
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Edit Dialog */}
        <UserEditDialog
          user={editingUser}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveUser}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={confirmDeleteUser}
          userDisplayName={deletingUser?.displayName || deletingUser?.email || 'Unknown User'}
          userEmail={deletingUser?.email || ''}
          userType={deletingUser?.user_type || ''}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
