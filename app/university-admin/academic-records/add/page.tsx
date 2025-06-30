'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import UniversityAdminLayout from '../../../../components/university-admin/UniversityAdminLayout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { 
  FaArrowLeft,
  FaUser, 
  FaIdCard, 
  FaBook, 
  FaCalendarAlt, 
  FaUpload, 
  FaFileAlt,
  FaAward,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaSave
} from 'react-icons/fa';

interface GraduateRecordData {
  graduation_year: string;
  student_full_name: string;
  registration_number: string;
  program: string;
  certificate_file?: File;
  transcript_file?: File;
}

export default function AddGraduateRecordPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<GraduateRecordData>({
    graduation_year: new Date().getFullYear().toString(),
    student_full_name: '',
    registration_number: '',
    program: '',
  });
  
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<'certificate' | 'transcript' | null>(null);
  const [programs, setPrograms] = useState<{ id: string, program: string }[]>([]);
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/programs-dropdown`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && data.data) {
          setPrograms(data.data);
        } else {
          console.error('Failed to load programs:', data.message);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    fetchPrograms();
  }, []);
  
  // Generate graduation years (current year and past 10 years)
  const getGraduationYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 10; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (file: File, type: 'certificate' | 'transcript') => {
    // Validate file type (PDF, JPG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Please upload a PDF, JPG, or PNG file for the ${type}`);
      return false;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError(`File size must be less than 10MB for the ${type}`);
      return false;
    }

    setError(null);
    
    if (type === 'certificate') {
      setCertificateFile(file);
    } else {
      setTranscriptFile(file);
    }
    
    return true;
  };

  const handleDragOver = (e: React.DragEvent, type: 'certificate' | 'transcript') => {
    e.preventDefault();
    setDragActive(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'certificate' | 'transcript') => {
    e.preventDefault();
    setDragActive(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'certificate' | 'transcript') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const removeFile = (type: 'certificate' | 'transcript') => {
    if (type === 'certificate') {
      setCertificateFile(null);
    } else {
      setTranscriptFile(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.graduation_year) {
      setError('Graduation year is required');
      return false;
    }
    if (!formData.student_full_name.trim()) {
      setError('Student full name is required');
      return false;
    }
    if (!formData.registration_number.trim()) {
      setError('Registration number is required');
      return false;
    }
    if (!formData.program.trim()) {
      setError('Program is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form
      if (!formData.student_full_name || !formData.registration_number || !formData.program) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      console.log("Preparing form submission...");
      console.log("Certificate file:", certificateFile ? certificateFile.name : "None");
      console.log("Transcript file:", transcriptFile ? transcriptFile.name : "None");
      
      // Create FormData object for proper multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // Add text fields
      (Object.keys(formData) as (keyof GraduateRecordData)[]).forEach(key => {
        if (formData[key]) {
          formDataToSubmit.append(key, formData[key] as string);
          console.log(`Added form field: ${key} = ${formData[key]}`);
        }
      });
      
      // Add files if selected
      if (certificateFile) {
        formDataToSubmit.append('certificate', certificateFile);
        console.log(`Added certificate file: ${certificateFile.name} (${certificateFile.size} bytes)`);
      }
      
      if (transcriptFile) {
        formDataToSubmit.append('transcript', transcriptFile);
        console.log(`Added transcript file: ${transcriptFile.name} (${transcriptFile.size} bytes)`);
      }
      
      // Check if FormData was populated correctly
      console.log("FormData entries:");
      Array.from(formDataToSubmit.entries()).forEach(pair => {
        console.log(`- ${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]}`);
      });
      
      // Make API request - IMPORTANT: Don't set Content-Type for FormData
      console.log("Sending request to API...");
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/academic-records`, {
        method: 'POST',
        headers: {
          // DON'T set Content-Type for FormData - browser will set it with boundary
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSubmit  // Send FormData not JSON
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create record');
      }
      
      setTimeout(() => {
        router.push('/university-admin/academic-records');
      }, 1500);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Failed to save the record. Please try again.');
      } else if (typeof error === 'string') {
        setError(error);
      } else {
        setError('Failed to save the record. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFileUploadArea = (type: 'certificate' | 'transcript') => {
    const file = type === 'certificate' ? certificateFile : transcriptFile;
    const isDragActive = dragActive === type;
    const title = type === 'certificate' ? 'Certificate' : 'Official Transcript';

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {title} (Optional)
        </label>
        
        {file ? (
          // File uploaded state
          <div className="border border-green-300 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-800">{file.name}</p>
                  <p className="text-xs text-green-600">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(type)}
                className="text-green-600 hover:text-green-800 p-1"
                title="Remove file"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Upload area
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => handleDragOver(e, type)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, type)}
          >
            <div className="space-y-2">
              <FaCloudUploadAlt className={`w-8 h-8 mx-auto ${
                isDragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <div>
                <p className="text-sm text-gray-600">
                  Drag and drop your {title.toLowerCase()} here, or{' '}
                  <label className="text-blue-600 hover:text-blue-500 cursor-pointer font-medium">
                    browse files
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileInputChange(e, type)}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['university_admin']}>
      <UniversityAdminLayout 
        user={user} 
        onLogout={logout}
        title="Add Graduate Record"
        subtitle="Create a new student graduation record with documents"
      >
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Academic Records</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Student Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Graduation Year */}
                <div>
                  <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Year *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="graduation_year"
                      name="graduation_year"
                      value={formData.graduation_year}
                      onChange={handleInputChange}
                      required
                      className="pl-10 w-full rounded-md border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {getGraduationYears().map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Student Full Name */}
                <div>
                  <label htmlFor="student_full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="student_full_name"
                      name="student_full_name"
                      value={formData.student_full_name}
                      onChange={handleInputChange}
                      required
                      className="pl-10 w-full rounded-md border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. John Doe Smith"
                    />
                  </div>
                </div>

                {/* Registration Number */}
                <div>
                  <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdCard className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="registration_number"
                      name="registration_number"
                      value={formData.registration_number}
                      onChange={handleInputChange}
                      required
                      className="pl-10 w-full rounded-md border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. REG-2020-001"
                    />
                  </div>
                </div>

                {/* Program */}
                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                    Program *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBook className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      required
                      className="pl-10 w-full rounded-md border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a program</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.program}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.program === 'Other' && (
                    <input
                      type="text"
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      placeholder="Enter custom program name"
                      className="mt-3 w-full rounded-md border border-gray-300 py-3 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Document Uploads
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderFileUploadArea('certificate')}
                {renderFileUploadArea('transcript')}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can upload documents now or add them later. 
                  Supported formats: PDF, JPG, PNG (max 10MB each)
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pb-8">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Saving Graduate Record...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    <span>Save Graduate Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </UniversityAdminLayout>
    </ProtectedRoute>
  );
}
