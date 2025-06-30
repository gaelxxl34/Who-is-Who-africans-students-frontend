'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import UniversityAdminLayout from '../../../components/university-admin/UniversityAdminLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  FaUniversity,
  FaSave,
  FaGraduationCap,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaCertificate,
  FaBell,
  FaChild
} from 'react-icons/fa';

// Import tab components
import UniversityProfileTab from '../../../components/university-admin/settings/UniversityProfileTab';
import AcademicSettingsTab from '../../../components/university-admin/settings/AcademicSettingsTab';
import NotificationsTab from '../../../components/university-admin/settings/NotificationsTab';
import SecurityTab from '../../../components/university-admin/settings/SecurityTab';

interface UniversitySettings {
  // University Profile - EXACTLY matching university_profiles table
  profile: {
    // Basic Information (required fields)
    name: string;
    country: string;
    city: string;
    
    // Optional fields that exist in database
    short_name: string;
    phone: string;
    address: string;
    website: string;
    logo_url: string;
    registration_number: string;
    accreditation_body: string;
    
    // Status fields
    is_active: boolean;
    is_verified: boolean;
    
    // Fields that need to be added to database
    email: string;
    established_year: string;
    description: string;
  };
  
  // Academic Configuration - UPDATED to match simplified structure
  academic: {
    programs: Array<{ id: string; program: string; faculty: string; duration: string; is_active: boolean }>;
  };
  
  // Document Settings
  documents: {
    certificate_template: string;
    transcript_template: string;
    digital_signature_enabled: boolean;
    auto_approval: boolean;
    watermark_enabled: boolean;
    qr_verification: boolean;
  };
  
  // Notifications
  notifications: {
    document_approval_alerts: boolean;
    graduation_reminders: boolean;
    system_maintenance: boolean;
    weekly_reports: boolean;
  };
  
  // Security
  security: {
    two_factor_required: boolean;
    session_timeout: number;
    password_expiry_days: number;
    audit_log_retention: number;
    ip_whitelist: string[];
  };
}

export default function UniversitySettingsPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<UniversitySettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading university settings from API...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load settings');
      }

      console.log('✅ University settings loaded successfully:', data.data);
      setSettings(data.data);
      
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load university settings');
      
      // Fallback to mock data for development
      console.log('⚠️ Using fallback mock data');
      const mockSettings: UniversitySettings = {
        profile: {
          name: 'Sample University',
          country: 'Uganda',
          city: 'Kampala',
          short_name: 'SU',
          phone: '+256-000-000000',
          address: 'Sample Address',
          website: 'https://www.sample.edu',
          logo_url: '',
          registration_number: '',
          accreditation_body: '',
          is_active: true,
          is_verified: false,
          email: 'admin@sample.edu',
          established_year: '2000',
          description: ''
        },
        academic: {
          programs: [
            {
              id: '1',
              program: 'Bachelor of Science in Computer Science',
              faculty: 'Faculty of Science and Technology',
              duration: '4 Years',
              is_active: true
            },
            {
              id: '2',
              program: 'Master of Business Administration',
              faculty: 'Faculty of Business and Management',
              duration: '2 Years',
              is_active: true
            }
          ]
        },
        documents: {
          certificate_template: 'standard',
          transcript_template: 'detailed',
          digital_signature_enabled: true,
          auto_approval: false,
          watermark_enabled: true,
          qr_verification: true
        },
        notifications: {
          document_approval_alerts: true,
          graduation_reminders: true,
          system_maintenance: true,
          weekly_reports: false
        },
        security: {
          two_factor_required: true,
          session_timeout: 30,
          password_expiry_days: 90,
          audit_log_retention: 365,
          ip_whitelist: []
        }
      };
      setSettings(mockSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      
      console.log('💾 Saving university settings:', settings);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to save settings');
      }

      console.log('✅ Settings saved successfully:', data.data);
      setSuccess('Settings saved successfully!');
      setHasChanges(false);
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof UniversitySettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
    setHasChanges(true);
  };

  const tabs = [
    { id: 'profile', name: 'University Profile', icon: FaUniversity },
    { id: 'academic', name: 'Academic Settings', icon: FaGraduationCap },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'security', name: 'Security', icon: FaChild }
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['university_admin']}>
        <UniversityAdminLayout user={user} onLogout={logout}>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-gray-200 rounded-lg h-12"></div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
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
        title="University Settings"
        subtitle="Configure your university preferences and system settings"
      >
        <div className="space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex items-center">
                <FaCheck className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          {hasChanges && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-blue-700">You have unsaved changes</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <UniversityProfileTab 
                  settings={settings?.profile} 
                  loading={loading}
                  onUpdate={(field, value) => updateSettings('profile', field, value)}
                />
              )}
              {activeTab === 'academic' && (
                <AcademicSettingsTab 
                  settings={settings?.academic} 
                  loading={loading}
                  onUpdate={(field, value) => updateSettings('academic', field, value)}
                />
              )}
              {activeTab === 'notifications' && (
                <NotificationsTab 
                  settings={settings?.notifications} 
                  loading={loading}
                  onUpdate={(field, value) => updateSettings('notifications', field, value)}
                />
              )}
              {activeTab === 'security' && (
                <SecurityTab 
                  settings={settings?.security} 
                  loading={loading}
                  onUpdate={(field, value) => updateSettings('security', field, value)}
                />
              )}
            </div>
          </div>
        </div>
      </UniversityAdminLayout>
    </ProtectedRoute>
  );
}