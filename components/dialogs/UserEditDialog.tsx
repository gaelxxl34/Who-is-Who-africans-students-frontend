import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaUserTag, FaToggleOn, FaToggleOff, 
  FaPhone, FaBuilding, FaGlobe, FaMapMarkerAlt, FaIndustry } from 'react-icons/fa';

// Updated User interface to match ACTUAL database structure
interface UserData {
  id: string;
  email: string;
  user_type: 'student' | 'employer' | 'admin';
  is_email_verified: boolean;
  created_at: string;
  profile?: {
    id?: string;
    // Common fields (all tables have these)
    first_name?: string;
    last_name?: string;
    phone?: string;
    
    // Student-specific fields (ONLY what exists in student_profiles table)
    // Note: No date_of_birth, gender, etc. - only first_name, last_name, phone
    
    // Employer-specific fields (actual employer_profiles columns)
    company_name?: string;
    industry?: string;
    country?: string;
    city?: string;
    
    // Admin-specific fields (actual admin_profiles columns)
    role?: string;
    permissions?: string[];
    is_active?: boolean;
    last_login?: string;
    
    [key: string]: any; // Keep for flexibility
  };
}

interface UserEditDialogProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserData) => Promise<void>;
}

export default function UserEditDialog({ user, isOpen, onClose, onSave }: UserEditDialogProps) {
  const [formData, setFormData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      console.log('📋 Loading complete user data into form:', user);
      console.log('📋 Profile data available:', user.profile);
      
      // Add comprehensive debugging
      console.log('🔍 FULL USER OBJECT:', JSON.stringify(user, null, 2));
      console.log('🔍 PROFILE OBJECT:', JSON.stringify(user.profile, null, 2));
      
      // Ensure profile exists before copying
      const profile = user.profile || {};
      console.log('📋 Profile object keys:', Object.keys(profile));
      console.log('📋 Profile object values:', profile);
      
      // Log each field individually to debug
      console.log('📋 Individual profile fields:');
      console.log('  - id:', profile.id);
      console.log('  - first_name:', profile.first_name);
      console.log('  - last_name:', profile.last_name);
      console.log('  - phone:', profile.phone);
      console.log('  - company_name:', profile.company_name);
      console.log('  - industry:', profile.industry);
      console.log('  - country:', profile.country);
      console.log('  - city:', profile.city);
      
      // Check if profile data actually exists
      if (!profile || Object.keys(profile).length === 0) {
        console.error('❌ CRITICAL: Profile object is empty or undefined!');
        console.error('❌ User object received:', user);
        console.error('❌ This indicates the profile transformation failed in loadUsers()');
      }
      
      // Create a deep copy with ALL available data - FIX: Use actual values, not empty fallbacks
      const initialFormData: UserData = {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
        profile: {
          // Copy actual values, don't default to empty strings unless they're truly empty
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          // Employer fields
          company_name: profile.company_name,
          industry: profile.industry,
          country: profile.country,
          city: profile.city,
          // Admin fields
          role: profile.role,
          permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
          is_active: profile.is_active !== false,
          last_login: profile.last_login
        }
      };

      console.log('🔧 Complete form data initialized:', initialFormData);
      console.log('📋 First name in form data:', initialFormData.profile?.first_name);
      console.log('📋 Last name in form data:', initialFormData.profile?.last_name);
      console.log('📋 Phone in form data:', initialFormData.profile?.phone);
      
      // Verify the form data has the expected values
      if (user.user_type === 'student' && (!initialFormData.profile?.first_name || !initialFormData.profile?.last_name)) {
        console.error('❌ CRITICAL: Student profile data missing after transformation!');
      } else if (user.user_type === 'employer' && !initialFormData.profile?.company_name) {
        console.error('❌ CRITICAL: Employer profile data missing after transformation!');
      } else if (user.user_type === 'admin' && (!initialFormData.profile?.first_name || !initialFormData.profile?.last_name)) {
        console.error('❌ CRITICAL: Admin profile data missing after transformation!');
      } else {
        console.log('✅ Profile data successfully loaded into form');
      }
      
      setFormData(initialFormData);
      setError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log(`📝 Field changed: ${name} = "${value}"`);
    
    // Handle profile fields
    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '');
      setFormData(prev => {
        if (!prev) return null;
        
        // Ensure profile object exists
        const currentProfile = prev.profile || {};
        
        const updatedFormData = {
          ...prev,
          profile: {
            ...currentProfile,
            [profileField]: value
          }
        };
        
        console.log(`🔧 Updated form data after ${name} change:`, updatedFormData);
        return updatedFormData;
      });
    } else {
      // Handle top-level fields
      setFormData(prev => {
        if (!prev) return null;
        
        const updatedFormData = { ...prev, [name]: value };
        console.log(`🔧 Updated form data after ${name} change:`, updatedFormData);
        return updatedFormData;
      });
    }
  };

  const handleToggleEmailVerified = () => {
    setFormData(prev => {
      if (!prev) return null;
      
      const updatedFormData = { ...prev, is_email_verified: !prev.is_email_verified };
      console.log('📧 Email verification toggled:', updatedFormData.is_email_verified);
      return updatedFormData;
    });
  };

  // Render fields specific to student users - ONLY actual database fields
  const renderStudentFields = () => (
    <div className="mt-4 p-4 bg-green-50 rounded-lg">
      <h4 className="text-sm font-medium text-green-800 mb-3">
        Student Information
      </h4>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="profile.first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="profile.first_name"
                name="profile.first_name"
                value={formData.profile?.first_name || ''}
                onChange={handleChange}
                className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First name"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="profile.last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="profile.last_name"
                name="profile.last_name"
                value={formData.profile?.last_name || ''}
                onChange={handleChange}
                className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last name"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="profile.phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="tel"
              id="profile.phone"
              name="profile.phone"
              value={formData.profile?.phone || ''}
              onChange={handleChange}
              className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+256 7XX XXX XXX"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render fields specific to employer users
  const renderEmployerFields = () => (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <h4 className="text-sm font-medium text-blue-800 mb-3">
        Employer Information
      </h4>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="profile.company_name" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBuilding className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="profile.company_name"
              name="profile.company_name"
              value={formData.profile?.company_name || ''}
              onChange={handleChange}
              className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="profile.industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaIndustry className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="profile.industry"
              name="profile.industry"
              value={formData.profile?.industry || ''}
              onChange={handleChange}
              className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Technology, Education, etc."
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="profile.country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGlobe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="profile.country"
                name="profile.country"
                value={formData.profile?.country || ''}
                onChange={handleChange}
                className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Uganda"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="profile.city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="profile.city"
                name="profile.city"
                value={formData.profile?.city || ''}
                onChange={handleChange}
                className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Kampala"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="profile.phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="tel"
              id="profile.phone"
              name="profile.phone"
              value={formData.profile?.phone || ''}
              onChange={handleChange}
              className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+256 7XX XXX XXX"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render fields specific to admin users - ONLY actual database fields
  const renderAdminFields = () => (
    <div className="mt-4 p-4 bg-red-50 rounded-lg">
      <h4 className="text-sm font-medium text-red-800 mb-3">
        Admin Information
      </h4>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="profile.first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="profile.first_name"
                name="profile.first_name"
                value={formData.profile?.first_name || ''}
                onChange={handleChange}
                className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First name"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="profile.last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="profile.last_name"
                name="profile.last_name"
                value={formData.profile?.last_name || ''}
                onChange={handleChange}
                className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last name"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="profile.phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="tel"
              id="profile.phone"
              name="profile.phone"
              value={formData.profile?.phone || ''}
              onChange={handleChange}
              className="pl-10 w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+256 7XX XXX XXX"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('💾 Saving user data:', formData);
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('❌ Error saving user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Edit {formData.user_type.charAt(0).toUpperCase() + formData.user_type.slice(1)} - {formData.email}
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

          <form onSubmit={handleSubmit}>
            {/* Email verification toggle - no duplicate email field */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Email: <span className="font-normal text-gray-600">{formData.email}</span>
                </label>
                <button 
                  type="button"
                  onClick={handleToggleEmailVerified}
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  {formData.is_email_verified ? (
                    <>
                      <FaToggleOn className="h-5 w-5 text-green-500" />
                      <span className="text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <FaToggleOff className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-500">Unverified</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Render user type specific fields */}
            {formData.user_type === 'student' && renderStudentFields()}
            {formData.user_type === 'employer' && renderEmployerFields()}
            {formData.user_type === 'admin' && renderAdminFields()}

            <div className="flex justify-end space-x-3 mt-6">
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
                    Saving...
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
