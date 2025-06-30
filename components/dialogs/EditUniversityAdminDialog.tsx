import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaUniversity, FaUserShield, FaToggleOn, FaToggleOff, FaBriefcase } from 'react-icons/fa';

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

interface EditUniversityAdminDialogProps {
  admin: UniversityAdmin | null;
  universities: University[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (admin: UniversityAdmin) => Promise<void>;
}

export default function EditUniversityAdminDialog({ 
  admin, 
  universities, 
  isOpen, 
  onClose, 
  onSave 
}: EditUniversityAdminDialogProps) {
  const [formData, setFormData] = useState<UniversityAdmin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (admin && isOpen) {
      console.log('📋 Loading university admin data into form:', admin);
      
      // Create a deep copy of the admin data
      const initialFormData: UniversityAdmin = {
        admin_id: admin.admin_id,
        user_id: admin.user_id,
        university_id: admin.university_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        title: admin.title || '',
        phone: admin.phone || '',
        role: admin.role,
        permissions: [...admin.permissions],
        is_active: admin.is_active,
        email: admin.email,
        last_login: admin.last_login,
        admin_created_at: admin.admin_created_at,
        admin_updated_at: admin.admin_updated_at,
        university_name: admin.university_name,
        university_short_name: admin.university_short_name,
        university_country: admin.university_country,
        university_city: admin.university_city
      };

      console.log('🔧 Form data initialized:', initialFormData);
      setFormData(initialFormData);
      setError(null);
    }
  }, [admin, isOpen]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    console.log(`📝 Field changed: ${name} = "${value}"`);
    
    setFormData(prev => {
      if (!prev) return null;
      
      const updatedFormData = {
        ...prev,
        [name]: value
      };
      
      console.log(`🔧 Updated form data after ${name} change:`, updatedFormData);
      return updatedFormData;
    });
  };

  const handleToggleActive = () => {
    setFormData(prev => {
      if (!prev) return null;
      
      const updatedFormData = { ...prev, is_active: !prev.is_active };
      console.log('🔄 Status toggled:', updatedFormData.is_active);
      return updatedFormData;
    });
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => {
      if (!prev) return null;
      
      const updatedPermissions = checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission);
      
      const updatedFormData = { ...prev, permissions: updatedPermissions };
      console.log(`🔐 Permission ${permission} ${checked ? 'added' : 'removed'}:`, updatedPermissions);
      return updatedFormData;
    });
  };

  const availablePermissions = [
    { id: 'university:read', label: 'View University Data', description: 'Can view university information' },
    { id: 'university:write', label: 'Edit University Data', description: 'Can modify university information' },
    { id: 'students:read', label: 'View Students', description: 'Can view student records' },
    { id: 'students:write', label: 'Manage Students', description: 'Can create and edit student records' },
    { id: 'courses:read', label: 'View Courses', description: 'Can view course information' },
    { id: 'courses:write', label: 'Manage Courses', description: 'Can create and edit courses' },
    { id: 'transcripts:read', label: 'View Transcripts', description: 'Can view student transcripts' },
    { id: 'transcripts:write', label: 'Issue Transcripts', description: 'Can create and issue transcripts' },
    { id: 'certificates:read', label: 'View Certificates', description: 'Can view certificates' },
    { id: 'certificates:write', label: 'Issue Certificates', description: 'Can create and issue certificates' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Basic validation
    if (!formData.first_name?.trim()) {
      setError('First name is required');
      return;
    }

    if (!formData.last_name?.trim()) {
      setError('Last name is required');
      return;
    }

    if (!formData.university_id) {
      setError('University selection is required');
      return;
    }

    if (formData.permissions.length === 0) {
      setError('At least one permission is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('💾 Saving university admin data:', formData);
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('❌ Error saving university admin:', err);
      setError(err instanceof Error ? err.message : 'Failed to update administrator');
    } finally {
      setLoading(false);
    }
  };

  const selectedUniversity = universities.find(u => u.id === formData.university_id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Dialog */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Edit University Administrator - {formData.first_name} {formData.last_name}
            </h3>
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* University Assignment */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                <FaUniversity className="w-4 h-4" />
                University Assignment
              </h4>
              
              <div>
                <label htmlFor="university_id" className="block text-sm font-medium text-gray-700 mb-2">
                  University *
                </label>
                <select
                  id="university_id"
                  name="university_id"
                  value={formData.university_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a university...</option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name} - {university.city}, {university.country}
                    </option>
                  ))}
                </select>
                
                {selectedUniversity && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
                    <strong>Selected:</strong> {selectedUniversity.name}
                    <br />
                    <span className="text-blue-600">
                      {selectedUniversity.city}, {selectedUniversity.country}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                <FaUser className="w-4 h-4" />
                Personal Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBriefcase className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Registrar, Vice Chancellor"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+256 7XX XXX XXX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                <FaUserShield className="w-4 h-4" />
                Account Status
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Account Status
                    </label>
                    <p className="text-xs text-gray-500">Enable or disable this administrator account</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleToggleActive}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    {formData.is_active ? (
                      <>
                        <FaToggleOn className="h-6 w-6 text-green-500" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="h-6 w-6 text-gray-400" />
                        <span className="text-gray-500">Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-800 mb-3 flex items-center gap-2">
                <FaUserShield className="w-4 h-4" />
                Permissions
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <div className="flex items-center h-5">
                      <input
                        id={permission.id}
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="text-sm">
                      <label htmlFor={permission.id} className="font-medium text-gray-700 cursor-pointer">
                        {permission.label}
                      </label>
                      <p className="text-gray-500 text-xs">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <strong>Selected permissions:</strong> {formData.permissions.length} of {availablePermissions.length}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
