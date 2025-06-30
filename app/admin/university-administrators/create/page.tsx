'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import AdminLayout from '../../../../components/admin/AdminLayout';

interface FormData {
  // University Selection
  university_id: string;
  
  // Administrator Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'registrar' | 'admin' | 'academic_officer';
  
  // Permissions
  permissions: string[];
  
  // Authentication
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  university_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  permissions?: string;
  password?: string;
  confirmPassword?: string;
}

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  is_active: boolean;
}

const availablePermissions = [
  { id: 'transcripts:read', label: 'View Transcripts', description: 'Can view student transcripts' },
  { id: 'transcripts:write', label: 'Manage Transcripts', description: 'Can create and edit transcripts' },
  { id: 'certificates:read', label: 'View Certificates', description: 'Can view certificates' },
  { id: 'certificates:write', label: 'Manage Certificates', description: 'Can create and edit certificates' },
  { id: 'students:read', label: 'View Students', description: 'Can view student profiles' },
  { id: 'students:write', label: 'Manage Students', description: 'Can edit student information' },
  { id: 'reports:read', label: 'View Reports', description: 'Can access university reports' },
];

const rolePermissions: Record<FormData['role'], string[]> = {
  registrar: ['transcripts:read', 'transcripts:write', 'certificates:read', 'certificates:write'],
  admin: ['transcripts:read', 'transcripts:write', 'certificates:read', 'certificates:write', 'students:read', 'students:write', 'reports:read'],
  academic_officer: ['transcripts:read', 'certificates:read', 'students:read', 'reports:read'],
};

export default function CreateUniversityAdminPage() {
  const { user, logout } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    university_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'registrar',
    permissions: rolePermissions.registrar,
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      console.log('🔄 Loading universities from API...');
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // FIX: Use the correct backend route that actually exists
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/universities-dropdown`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Universities API response:', data);
      
      if (!data?.success) {
        throw new Error(data?.message || 'Failed to fetch universities');
      }

      // Validate the response data
      if (!Array.isArray(data?.data)) {
        console.error('❌ Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Transform API data to match our University interface
      const apiUniversities = data.data.map((uni: any) => ({
        id: uni.id,
        name: uni.name,
        country: uni.country,
        city: uni.city,
        is_active: uni.is_active !== false
      }));

      const activeUniversities = apiUniversities.filter((u: University) => u.is_active);
      setUniversities(activeUniversities);
      
      console.log(`✅ Loaded ${activeUniversities.length} active universities from API`);
      
    } catch (error) {
      console.error('❌ Error loading universities from API:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('University loading error:', errorMessage);
      
      // Fallback to mock data for development
      console.log('⚠️ Falling back to mock data for development');
      const mockUniversities: University[] = [
        { id: 'mock-1', name: 'Makerere University (Mock)', country: 'Uganda', city: 'Kampala', is_active: true },
        { id: 'mock-2', name: 'Kyambogo University (Mock)', country: 'Uganda', city: 'Kampala', is_active: true },
        { id: 'mock-3', name: 'MUBS (Mock)', country: 'Uganda', city: 'Kampala', is_active: true },
      ];
      
      setUniversities(mockUniversities);
      setSubmitError(`Failed to load universities from server: ${errorMessage}. Using mock data for now.`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log(`📝 Field changed: ${name} = "${value}"`);
    
    if (name === 'role') {
      const roleValue = value as FormData['role'];
      // Update permissions based on role
      setFormData(prev => ({
        ...prev,
        role: roleValue,
        permissions: rolePermissions[roleValue] || []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    console.log(`🔐 Permission changed: ${permissionId} = ${checked}`);
    
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
    
    // Clear permissions error if at least one is selected
    if (checked && errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    console.log('🔍 Validating form data:', formData);

    // Required fields validation
    if (!formData.university_id?.trim()) {
      newErrors.university_id = 'University selection is required';
    }
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required';
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Permissions validation
    if (!Array.isArray(formData.permissions) || formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    console.log('🔍 Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📋 Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      console.log('🔄 Creating university administrator...');
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Prepare the data for the API
      const adminData = {
        email: formData.email.trim(),
        password: formData.password,
        university_id: formData.university_id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        title: formData.role, // Use role as title for now
        phone: formData.phone?.trim() || null,
        role: 'university_admin', // Standard role
        permissions: formData.permissions
      };

      console.log('📤 Sending data to API:', adminData);

      // FIX: Call the correct backend API endpoint that exists
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/university-admins`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(adminData)
        }
      );

      console.log('📡 Create API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ University administrator created successfully:', result);
      
      // Show success message
      alert('University administrator created successfully!');
      
      // Redirect to university administrators list
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/university-administrators';
      }
      
    } catch (error) {
      console.error('❌ Error creating university administrator:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create university administrator';
      setSubmitError(errorMessage);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
      console.log('🏁 Form submission completed');
    }
  };

  const selectedUniversity = universities.find(u => u.id === formData.university_id);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout 
        user={user} 
        onLogout={logout}
      >
        <div className="w-full max-w-4xl mx-auto">
          {/* Header - centered */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create University Administrator</h1>
            <p className="text-gray-600 mt-1">Add a new administrator to manage university operations</p>
          </div>
          
          {/* Error Message */}
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <strong>Error:</strong> {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* University Selection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">University Assignment</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="university_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Select University <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="university_id"
                    name="university_id"
                    value={formData.university_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.university_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Choose a university...</option>
                    {universities.map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name} - {university.city}, {university.country}
                      </option>
                    ))}
                  </select>
                  {errors.university_id && <p className="mt-1 text-sm text-red-600">{errors.university_id}</p>}
                  
                  {selectedUniversity && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> {selectedUniversity.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        Location: {selectedUniversity.city}, {selectedUniversity.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Administrator Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Administrator Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="admin@university.edu"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+256 XXX XXX XXX"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.role ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="registrar">Registrar</option>
                    <option value="admin">Administrator</option>
                    <option value="academic_officer">Academic Officer</option>
                  </select>
                  {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                  
                  <div className="mt-2 text-sm text-gray-600">
                    {formData.role === 'registrar' && 'Full access to transcripts and certificates management'}
                    {formData.role === 'admin' && 'Complete administrative access including student management'}
                    {formData.role === 'academic_officer' && 'Read-only access to academic records and reports'}
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Permissions</h2>
              
              <div className="space-y-4">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={permission.id}
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={permission.id} className="font-medium text-gray-700 cursor-pointer">
                        {permission.label}
                      </label>
                      <p className="text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {errors.permissions && <p className="mt-2 text-sm text-red-600">{errors.permissions}</p>}
              
              <div className="mt-4 text-sm text-gray-600">
                <strong>Selected permissions:</strong> {formData.permissions.length} of {availablePermissions.length}
              </div>
            </div>

            {/* Authentication */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Account Authentication</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.history.back();
                  }
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Administrator...
                  </>
                ) : (
                  'Create Administrator'
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
