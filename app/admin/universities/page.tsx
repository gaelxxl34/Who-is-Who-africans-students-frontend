'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaGlobe,
  FaMapMarkerAlt,
  FaBuilding,
  FaCheck,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaFilter,
  FaEye
} from 'react-icons/fa';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import UniversityEditDialog from '../../../components/dialogs/UniversityEditDialog';
import Link from 'next/link';

// Updated interface to match new database schema without user relationship
interface University {
  id: string;
  name: string;
  short_name?: string;
  email: string; // Now a direct field, not from users table
  phone?: string;
  country: string;
  city: string;
  address?: string;
  website?: string;
  logo_url?: string;
  registration_number?: string;
  accreditation_body?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export default function AdminUniversitiesPage() {
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [countries, setCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching universities data...');
      
      // Get token from storage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Fetch universities data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/universities`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data?.universities) {
        throw new Error('Invalid data format returned from API');
      }
      
      // No need to transform data since the API now returns the correct format
      const fetchedUniversities: University[] = data.data.universities;
      
      console.log(`✅ Successfully loaded ${fetchedUniversities.length} universities`);
      
      // Extract unique countries for the filter
      const uniqueCountries = Array.from(
        new Set(fetchedUniversities.map(uni => uni.country).filter(Boolean))
      ) as string[];
      
      setUniversities(fetchedUniversities);
      setFilteredUniversities(fetchedUniversities);
      setCountries(uniqueCountries);
      
    } catch (error) {
      console.error('❌ Error loading universities:', error);
      
      // Fallback to mock data
      console.log('⚠️ Using mock data instead');
      const mockUniversities: University[] = [
        {
          id: '1',
          name: 'Makerere University',
          short_name: 'MAK',
          email: 'admin@mak.ac.ug',
          phone: '+256-414-123456',
          country: 'Uganda',
          city: 'Kampala',
          address: 'University Rd, Kampala',
          website: 'https://mak.ac.ug',
          is_active: true,
          is_verified: true,
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Kyambogo University',
          short_name: 'KYU',
          email: 'admin@kyu.ac.ug',
          phone: '+256-414-287123',
          country: 'Uganda',
          city: 'Kampala',
          address: 'Kyambogo Hill, Kampala',
          website: 'https://kyu.ac.ug',
          is_active: true,
          is_verified: false,
          created_at: '2023-01-15T00:00:00Z',
        }
      ];
      
      setUniversities(mockUniversities);
      setFilteredUniversities(mockUniversities);
      setCountries(['Uganda']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortUniversities();
  }, [searchTerm, selectedCountry, activeFilter, sortBy, universities]);

  const filterAndSortUniversities = () => {
    let filtered = [...universities];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(uni => 
        uni.name.toLowerCase().includes(searchLower) ||
        uni.email.toLowerCase().includes(searchLower) ||
        (uni.short_name && uni.short_name.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply country filter
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(uni => uni.country === selectedCountry);
    }
    
    // Apply active status filter
    if (activeFilter !== 'all') {
      const isActive = activeFilter === 'active';
      filtered = filtered.filter(uni => uni.is_active === isActive);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    setFilteredUniversities(filtered);
  };

  const handleStatusToggle = async (university: University) => {
    try {
      console.log(`🔄 Toggling status for ${university.name} to ${!university.is_active}`);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/universities/${university.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !university.is_active }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API returned ${response.status}`);
      }
      
      await loadUniversities(); // Reload data
      
    } catch (error) {
      console.error('❌ Error toggling university status:', error);
      alert('Failed to update university status. Please try again.');
    }
  };

  const handleEditUniversity = (university: University) => {
    setEditingUniversity(university);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUniversity = (university: University) => {
    setUniversityToDelete(university);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUniversity = async () => {
    if (!universityToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/universities/${universityToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API returned ${response.status}`);
      }
      
      await loadUniversities(); // Reload data
      setIsDeleteConfirmOpen(false);
      
    } catch (error) {
      console.error('❌ Error deleting university:', error);
      alert('Failed to delete university. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout 
        user={user} 
        onLogout={logout}
        title="University Management"
        subtitle="Manage educational institutions"
      >
        {/* Action buttons */}
        <div className="flex justify-end mb-6">
          <Link 
            href="/admin/universities/create" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New University
          </Link>
        </div>
        
        {/* Filters and search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Country filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            {/* Active filter */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
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
          </div>
        </div>

        {/* Universities list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              {loading ? (
                // Skeleton loading
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUniversities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <FaFilter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No universities found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCountry('all');
                            setActiveFilter('all');
                          }}
                          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredUniversities.map((university) => (
                      <tr key={university.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {university.logo_url ? (
                              <img 
                                src={university.logo_url} 
                                alt={university.name} 
                                className="h-10 w-10 rounded-full mr-3 object-contain bg-gray-100"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full mr-3 flex items-center justify-center bg-blue-100 text-blue-800 font-bold">
                                {university.short_name || university.name.substring(0, 1)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{university.name}</div>
                              {university.short_name && (
                                <div className="text-sm text-gray-500">{university.short_name}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{university.email}</div>
                          {university.phone && (
                            <div className="text-sm text-gray-500">{university.phone}</div>
                          )}
                          {university.website && (
                            <a 
                              href={university.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1"
                            >
                              <FaGlobe className="h-3 w-3 mr-1" />
                              Website
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{university.city}, {university.country}</div>
                          {university.address && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaMapMarkerAlt className="h-3 w-3 mr-1 text-gray-400" />
                              {university.address}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            university.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {university.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {university.is_verified && (
                            <span className="ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-blue-100 text-blue-800">
                              Verified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(university.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleStatusToggle(university)}
                              className={`p-1.5 rounded-full ${
                                university.is_active 
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={university.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {university.is_active ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />}
                            </button>
                            <button
                              onClick={() => handleEditUniversity(university)}
                              className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                              title="Edit"
                            >
                              <FaEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUniversity(university)}
                              className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                              title="Delete"
                            >
                              <FaTrash className="h-5 w-5" />
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
        
        {/* Refresh button */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={loadUniversities}
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
        
        {/* Delete confirmation dialog */}
        {isDeleteConfirmOpen && universityToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 text-center">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsDeleteConfirmOpen(false)}></div>
              <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all my-8 align-middle max-w-lg w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FaTrash className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete University
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete <strong>{universityToDelete.name}</strong>? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmDeleteUniversity}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* University Edit Dialog */}
        {editingUniversity && (
          <UniversityEditDialog
            university={editingUniversity}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={async (updatedUniversity) => {
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/universities/${updatedUniversity.id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(updatedUniversity),
                });
                
                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  throw new Error(errorData.message || `API returned ${response.status}`);
                }
                
                await loadUniversities(); // Reload data
                setIsEditDialogOpen(false);
                
              } catch (error) {
                console.error('❌ Error updating university:', error);
                throw error;
              }
            }}
          />
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
