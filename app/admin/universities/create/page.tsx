'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { FaUniversity, FaGlobe, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLink, FaBuilding, FaCheck } from 'react-icons/fa';

export default function CreateUniversityPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update the form state
  const [formData, setFormData] = useState({
    // University basic information
    name: '',
    short_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    website: '',
    logo_url: '',
    registration_number: '',
    accreditation_body: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simplify handleSubmit function (no auth needed)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/admin/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create university');
      }

      console.log('University created successfully:', data);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/universities');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating university:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the university');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout user={user} onLogout={logout}>
        <div className="w-full max-w-4xl mx-auto">
          {/* Header - centered */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create University</h1>
            <p className="text-gray-600 mt-1">Register a new educational institution in the system</p>
          </div>
          
          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <p className="text-green-700 font-medium">University created successfully!</p>
              </div>
              <p className="text-green-600 text-sm mt-1">Redirecting to universities list...</p>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error: {error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* University Information Section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                <FaUniversity className="inline-block mr-2 text-blue-600" />
                University Information
              </h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    University Name <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBuilding className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full university name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="short_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Short Name / Acronym
                  </label>
                  <input
                    type="text"
                    id="short_name"
                    name="short_name"
                    value={formData.short_name}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E.g. MAK, UCU, KYU"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="university@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+256 XXX XXX XXX"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaGlobe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Uganda"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Kampala"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Physical address of the university"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLink className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.university.edu"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.example.com/logo.png"
                  />
                </div>
                
                <div>
                  <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    id="registration_number"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Official registration number"
                  />
                </div>
                
                <div>
                  <label htmlFor="accreditation_body" className="block text-sm font-medium text-gray-700 mb-1">
                    Accreditation Body
                  </label>
                  <input
                    type="text"
                    id="accreditation_body"
                    name="accreditation_body"
                    value={formData.accreditation_body}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. National Council for Higher Education"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="p-6 bg-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={loading || success}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create University'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
