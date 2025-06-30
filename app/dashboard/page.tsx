'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '../../services/authService';
import { FaSignOutAlt, FaUniversity, FaGraduationCap, FaCalendarAlt, FaSearch, FaEye, FaDownload, FaCheckCircle, FaTimesCircle, FaSpinner, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface UserData {
  id: string;
  email: string;
  userType: string;
}

interface ProfileData {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  industry?: string;
  phone?: string;
}

interface University {
  id: string;
  name: string;
  short_name: string;
  country: string;
  city: string;
}

interface Program {
  id: string;
  program_name: string;
  degree_level: string;
  duration_years: number;
}

interface VerificationResult {
  found: boolean;
  student?: {
    id: string;
    name: string;
    registrationNumber: string;
    university: {
      id: string;
      name: string;
      shortName: string;
    };
    program: {
      id: string;
      name: string;
      level: string;
    };
    graduationYear: string;
    isVerified: boolean;
    status: string;
  };
  certificate?: {
    available: boolean;
    url?: string;
    verified?: boolean;
    uploadDate?: string;
    message?: string;
  };
  transcript?: {
    available: boolean;
    url?: string;
    verified?: boolean;
    uploadDate?: string;
    message?: string;
  };
  message?: string;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Enhanced form state
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [graduationYears, setGraduationYears] = useState<string[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  
  const [formData, setFormData] = useState({
    registrationNumber: '',
    studentName: '',
    universityId: '',
    programId: '',
    graduationYear: '',
    verificationType: 'both' // 'certificate', 'transcript', 'both'
  });
  
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('Initializing dashboard...');
        
        const storedUser = authService.getCurrentUser();
        const token = localStorage.getItem(authService.TOKEN_KEY);
        
        if (!storedUser || !token) {
          console.log('No user or token found, redirecting to login');
          router.replace('/login');
          return;
        }
        
        console.log('Found stored user:', storedUser.email);
        
        // Directly use the stored user data for profile info
        // Instead of making a separate API call that might not exist
        if (storedUser) {
          console.log('🔍 Using stored user data for profile', storedUser);
          
          // Create a basic profile from stored user data
          const userProfile: ProfileData = {};
          
          // Check if additional profile data in user object - use correct camelCase variable names
          if (storedUser.user_type === 'student' || storedUser.userType === 'student') {
            // Use camelCase property names as defined in authService.ts
            userProfile.first_name = 
              typeof storedUser.first_name === 'string' && storedUser.first_name
                ? storedUser.first_name
                : (typeof storedUser.profile?.firstName === 'string' && storedUser.profile.firstName
                    ? storedUser.profile.firstName
                    : '');
              
            userProfile.last_name = 
              storedUser.last_name || 
              storedUser.profile?.lastName || 
              '';
          } 
          else if (storedUser.user_type === 'employer' || storedUser.userType === 'employer') {
            userProfile.company_name = 
              (typeof storedUser.company_name === 'string' && storedUser.company_name) ||
              (typeof storedUser.company === 'string' && storedUser.company) ||
              (typeof storedUser.profile?.companyName === 'string' && storedUser.profile.companyName) ||
              '';
          }
          
          console.log('📋 Created profile from stored data:', userProfile);
          console.log('📋 Profile properties:', {
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            company_name: userProfile.company_name
          });
          
          setProfile(userProfile);
        }
        
        // Load universities for the dropdown
        await loadUniversities();
        
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setError('Failed to load dashboard. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  // Load universities for dropdown
  const loadUniversities = async () => {
    try {
      console.log('🏛️ Loading universities...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/verification/universities`);
      
      if (!response.ok) {
        throw new Error('Failed to load universities');
      }
      
      const data = await response.json();
      if (data.success) {
        setUniversities(data.data);
        console.log(`✅ Loaded ${data.data.length} universities`);
      }
    } catch (error) {
      console.error('❌ Error loading universities:', error);
    }
  };

  // Load programs when university changes
  const loadPrograms = async (universityId: string) => {
    if (!universityId) {
      setPrograms([]);
      return;
    }
    
    setLoadingPrograms(true);
    try {
      console.log('📚 Loading programs for university:', universityId);
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/verification/universities/${universityId}/programs`;
      console.log('📚 Request URL:', url);
      
      const response = await fetch(url);
      
      console.log('📚 Response status:', response.status);
      console.log('📚 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Failed to load programs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📚 Programs response:', data);
      
      if (data.success) {
        setPrograms(data.data);
        console.log(`✅ Loaded ${data.data.length} programs`);
      } else {
        console.error('❌ API returned error:', data.message);
        throw new Error(data.message || 'Failed to load programs');
      }
    } catch (error) {
      console.error('❌ Error loading programs:', error);
      setError(`Failed to load programs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingPrograms(false);
    }
  };

  // Load graduation years when university changes
  const loadGraduationYears = async (universityId: string) => {
    if (!universityId) {
      setGraduationYears([]);
      return;
    }
    
    setLoadingYears(true);
    try {
      console.log('📅 Loading graduation years for university:', universityId);
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/verification/universities/${universityId}/years`;
      console.log('📅 Request URL:', url);
      
      const response = await fetch(url);
      
      console.log('📅 Response status:', response.status);
      console.log('📅 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Failed to load graduation years: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📅 Years response:', data);
      
      if (data.success) {
        setGraduationYears(data.data);
        console.log(`✅ Loaded graduation years: ${data.data.join(', ')}`);
      } else {
        console.error('❌ API returned error:', data.message);
        throw new Error(data.message || 'Failed to load graduation years');
      }
    } catch (error) {
      console.error('❌ Error loading graduation years:', error);
      setError(`Failed to load graduation years: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingYears(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Dashboard: Logout clicked');
    logout();
  };

  // Improved getDisplayName function with better logging
  const getDisplayName = () => {
    console.log('🔍 Getting display name with profile:', profile);
    console.log('🔍 User type:', user?.user_type);
    
    if (profile) {
      if (user?.user_type === 'student' && profile.first_name) {
        const displayName = profile.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : profile.first_name;
        console.log('👤 Using student name:', displayName);
        return displayName;
      }
      if (user?.user_type === 'employer' && profile.company_name) {
        console.log('👤 Using company name:', profile.company_name);
        return profile.company_name;
      }
    }
    
    // If we reach here, the profile doesn't have the data we need
    // Use user object directly as a fallback
    if (user?.first_name) {
      console.log('👤 Using user first name as fallback:', user.first_name);
      return user.first_name;
    } else if (user?.company_name) {
      console.log('👤 Using user company name as fallback:', user.company_name);
      return user.company_name;
    }
    
    // Last resort fallback
    const fallback = user?.email || (user?.user_type === 'student' ? 'Student' : 'Employer');
    console.log('👤 Using fallback:', fallback);
    return fallback;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Load programs and years when university changes
    if (name === 'universityId') {
      setFormData(prev => ({ ...prev, programId: '', graduationYear: '' }));
      if (value) {
        loadPrograms(value);
        loadGraduationYears(value);
      } else {
        setPrograms([]);
        setGraduationYears([]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setVerificationResult(null);
    setError('');

    try {
      console.log('🔍 Submitting verification request:', formData);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          registrationNumber: formData.registrationNumber,
          universityId: formData.universityId || null,
          programId: formData.programId || null,
          graduationYear: formData.graduationYear || null,
          verificationType: formData.verificationType,
        }),
      });

      if (!response.ok) {
        throw new Error('Verification request failed');
      }

      const data = await response.json();
      if (data.success) {
        setVerificationResult(data.data);
        console.log('✅ Verification completed:', data.data);
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setError('Failed to verify credentials. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      registrationNumber: '',
      studentName: '',
      universityId: '',
      programId: '',
      graduationYear: '',
      verificationType: 'both'
    });
    setPrograms([]);
    setGraduationYears([]);
    setVerificationResult(null);
    setError('');
    setShowAdvancedSearch(false);
  };

  const handleFilePreview = async (fileUrl: string, fileName: string) => {
    try {
      console.log('🔍 Opening file preview:', fileName);
      console.log('🔗 File URL:', fileUrl);
      
      if (!fileUrl) {
        alert('File URL is not available');
        return;
      }
      
      // Since our backend is now efficiently handling redirects for all URL types,
      // we can simply use the API endpoint which will redirect to the correct URL
      const previewUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/verification/preview-url?fileUrl=${encodeURIComponent(fileUrl)}`;
      window.open(previewUrl, '_blank');
    } catch (error) {
      console.error('❌ Error opening file preview:', error);
      alert(`Failed to open file preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication required</p>
          <button 
            onClick={() => router.replace('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  <span className="text-green-700">Who is Who</span> <span className="text-blue-700">Educhain</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden sm:block">{getDisplayName()}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimesCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credential Verification</h1>
          <p className="text-gray-600 mt-2">
            Verify academic credentials instantly using blockchain technology
          </p>
        </div>

        {/* Search Section - ChatGPT Style */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Search Input - Floating Label Design */}
            <div className="relative border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              <input
                type="text"
                name="registrationNumber"
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                placeholder=" "
                required
                className="block w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent appearance-none focus:outline-none"
              />
              <label 
                htmlFor="registrationNumber" 
                className="absolute top-2 left-4 text-xs font-medium text-gray-500 transition-all duration-200"
              >
                Student Registration Number / ID
              </label>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                {formData.registrationNumber && (
                  <button 
                    type="button" 
                    className="text-gray-400 hover:text-gray-600" 
                    onClick={() => setFormData({...formData, registrationNumber: ''})}
                  >
                    <span className="sr-only">Clear input</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={searchLoading || !formData.registrationNumber}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {searchLoading ? (
                    <FaSpinner className="animate-spin h-5 w-5" />
                  ) : (
                    <FaSearch className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Search Toggle */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800"
              >
                {showAdvancedSearch ? (
                  <>Less options <FaChevronUp className="ml-1" /></>
                ) : (
                  <>Advanced search <FaChevronDown className="ml-1" /></>
                )}
              </button>
            </div>

            {/* Advanced Search Options */}
            {showAdvancedSearch && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                {/* Student Name */}
                <div className="relative border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <input
                    type="text"
                    name="studentName"
                    id="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="block w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent appearance-none focus:outline-none"
                  />
                  <label 
                    htmlFor="studentName" 
                    className="absolute top-2 left-4 text-xs font-medium text-gray-500 transition-all duration-200"
                  >
                    Student Full Name (Optional)
                  </label>
                </div>

                {/* University Selection */}
                <div className="relative border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <select 
                    name="universityId"
                    id="universityId"
                    value={formData.universityId}
                    onChange={handleInputChange}
                    className="block w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent appearance-none focus:outline-none"
                  >
                    <option value="">Select Institution (Optional)</option>
                    {universities.map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name} {university.short_name && `(${university.short_name})`}
                      </option>
                    ))}
                  </select>
                  <label 
                    htmlFor="universityId" 
                    className="absolute top-2 left-4 text-xs font-medium text-gray-500 transition-all duration-200"
                  >
                    University/Institution
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <FaChevronDown className="h-4 w-4" />
                  </div>
                </div>

                {/* Program Selection */}
                <div className="relative border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <select 
                    name="programId"
                    id="programId"
                    value={formData.programId}
                    onChange={handleInputChange}
                    disabled={!formData.universityId || loadingPrograms}
                    className="block w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent appearance-none focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">
                      {loadingPrograms ? 'Loading programs...' : 'Select Program (Optional)'}
                    </option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.program_name} ({program.degree_level})
                      </option>
                    ))}
                  </select>
                  <label 
                    htmlFor="programId" 
                    className="absolute top-2 left-4 text-xs font-medium text-gray-500 transition-all duration-200"
                  >
                    Academic Program
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <FaChevronDown className="h-4 w-4" />
                  </div>
                </div>

                {/* Graduation Year */}
                <div className="relative border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <select 
                    name="graduationYear"
                    id="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    disabled={!formData.universityId || loadingYears}
                    className="block w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent appearance-none focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">
                      {loadingYears ? 'Loading years...' : 'Select Year (Optional)'}
                    </option>
                    {graduationYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <label 
                    htmlFor="graduationYear" 
                    className="absolute top-2 left-4 text-xs font-medium text-gray-500 transition-all duration-200"
                  >
                    Graduation Year
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <FaChevronDown className="h-4 w-4" />
                  </div>
                </div>

                {/* Verification Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    What would you like to verify?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'certificate', label: 'Certificate' },
                      { value: 'transcript', label: 'Transcript' },
                      { value: 'both', label: 'Both' }
                    ].map((option) => (
                      <label key={option.value} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="verificationType"
                          value={option.value}
                          checked={formData.verificationType === option.value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Search Tips */}
          {!showAdvancedSearch && !verificationResult && !searchLoading && (
            <div className="mt-4 text-center text-sm text-gray-500 space-y-2">
              <p><FaInfoCircle className="inline mr-1" /> Enter a student registration number or ID to verify credentials</p>
              <p>Use advanced search for more specific queries</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {verificationResult && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 animate-fadeIn">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${verificationResult.found ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                {verificationResult.found ? (
                  <FaCheckCircle className="w-6 h-6" />
                ) : (
                  <FaTimesCircle className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {verificationResult.found ? 'Credentials Verified' : 'No Records Found'}
              </h3>
            </div>

            {verificationResult.found && verificationResult.student && (
              <div className="space-y-6">
                {/* Student Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FaGraduationCap className="mr-2 text-blue-500" />
                    Student Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-900">{verificationResult.student.name}</span></div>
                    <div><span className="font-medium text-gray-600">Registration:</span> <span className="text-gray-900">{verificationResult.student.registrationNumber}</span></div>
                    <div><span className="font-medium text-gray-600">University:</span> <span className="text-gray-900">{verificationResult.student.university.name}</span></div>
                    <div><span className="font-medium text-gray-600">Program:</span> <span className="text-gray-900">{verificationResult.student.program.name}</span></div>
                    <div><span className="font-medium text-gray-600">Year:</span> <span className="text-gray-900">{verificationResult.student.graduationYear}</span></div>
                    <div><span className="font-medium text-gray-600">Status:</span> 
                      <span className={`font-semibold ml-1 ${verificationResult.student.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {verificationResult.student.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate and Transcript Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Certificate Card */}
                  {verificationResult.certificate && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <FaCheckCircle className="text-blue-500" />
                        </span>
                        Certificate
                      </h4>
                      {verificationResult.certificate.available ? (
                        <div className="space-y-3">
                          <div className="text-sm space-y-1">
                            <div><span className="font-medium text-gray-600">Status:</span> 
                              <span className="text-green-600 font-semibold ml-1">Available</span>
                            </div>
                            <div><span className="font-medium text-gray-600">Verified:</span> 
                              <span className={`font-semibold ml-1 ${verificationResult.certificate.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                {verificationResult.certificate.verified ? 'Yes' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleFilePreview(verificationResult.certificate!.url!, 'Certificate')}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FaEye className="mr-2" />
                            View Certificate
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">{verificationResult.certificate.message}</p>
                      )}
                    </div>
                  )}

                  {/* Transcript Card */}
                  {verificationResult.transcript && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                          <FaCheckCircle className="text-purple-500" />
                        </span>
                        Transcript
                      </h4>
                      {verificationResult.transcript.available ? (
                        <div className="space-y-3">
                          <div className="text-sm space-y-1">
                            <div><span className="font-medium text-gray-600">Status:</span> 
                              <span className="text-green-600 font-semibold ml-1">Available</span>
                            </div>
                            <div><span className="font-medium text-gray-600">Verified:</span> 
                              <span className={`font-semibold ml-1 ${verificationResult.transcript.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                {verificationResult.transcript.verified ? 'Yes' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleFilePreview(verificationResult.transcript!.url!, 'Transcript')}
                            className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <FaEye className="mr-2" />
                            View Transcript
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">{verificationResult.transcript.message}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Verification Badge */}
                <div className="flex justify-center mt-4">
                  <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <span className="text-sm text-green-800 font-medium">Blockchain Verified</span>
                  </div>
                </div>
              </div>
            )}

            {!verificationResult.found && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTimesCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-gray-600 mb-2">No matching records found in our Blockchain.</p>
                <p className="text-sm text-gray-500">{verificationResult.message || 'Please check the details and try again.'}</p>
              </div>
            )}

            {/* Search Again Button */}
            <div className="mt-6 text-center">
              <button
                onClick={clearForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Search Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Who is Who Educhain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
