import { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaChevronDown, FaMapMarkerAlt } from 'react-icons/fa';

interface UniversityDropdownItem {
  id: string;
  name: string;
  short_name?: string;
  country: string;
  city: string;
  is_active: boolean;
}

interface UniversityDropdownProps {
  value?: string;
  onChange: (universityId: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function UniversityDropdown({
  value,
  onChange,
  placeholder = "Select University",
  required = false,
  error,
  disabled = false,
  className = "",
}: UniversityDropdownProps) {
  const [universities, setUniversities] = useState<UniversityDropdownItem[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<UniversityDropdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityDropdownItem | null>(null);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (value && universities.length > 0) {
      const university = universities.find(u => u.id === value);
      setSelectedUniversity(university || null);
    } else {
      setSelectedUniversity(null);
    }
  }, [value, universities]);

  useEffect(() => {
    filterUniversities();
  }, [searchTerm, universities]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      console.log('🏛️ Loading universities for dropdown...');
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use the existing universities-dropdown endpoint from your backend
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
      
      console.log('✅ Universities loaded:', data.data?.length || 0);
      
      if (data.data?.length > 0) {
        console.log('📋 First university:', data.data[0]);
      } else {
        console.log('⚠️ No universities found in response');
      }
      
      setUniversities(data.data || []);
      setFilteredUniversities(data.data || []);
    } catch (error) {
      console.error('❌ Error loading universities:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('University dropdown error:', errorMessage);
      
      // Set empty array on error to show "no universities available"
      setUniversities([]);
      setFilteredUniversities([]);
      
      // You might want to show a toast notification here
      // For now, we'll just log the error
    } finally {
      setLoading(false);
    }
  };

  const filterUniversities = () => {
    if (!searchTerm.trim()) {
      setFilteredUniversities(universities);
      return;
    }

    const filtered = universities.filter(university =>
      university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (university.short_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      university.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      university.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUniversities(filtered);
  };

  const handleSelectUniversity = (university: UniversityDropdownItem) => {
    setSelectedUniversity(university);
    onChange(university.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const formatUniversityDisplay = (university: UniversityDropdownItem) => {
    const shortName = university.short_name ? ` (${university.short_name})` : '';
    return `${university.name}${shortName}`;
  };

  const formatUniversityLocation = (university: UniversityDropdownItem) => {
    return `${university.city}, ${university.country}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`
          w-full bg-white border rounded-lg px-4 py-3 text-left
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center text-gray-500">
                <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                <span>Loading universities...</span>
              </div>
            ) : selectedUniversity ? (
              <div>
                <div className="text-gray-900 font-medium truncate">
                  {formatUniversityDisplay(selectedUniversity)}
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                  {formatUniversityLocation(selectedUniversity)}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <FaChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Required indicator */}
      {required && (
        <span className="absolute top-3 right-10 text-red-500">*</span>
      )}

      {/* Dropdown List */}
      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Universities List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredUniversities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No universities found matching your search' : 'No universities available'}
                {universities.length === 0 && !searchTerm && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      Make sure you have created universities in the Admin → Universities section first.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              filteredUniversities.map((university) => (
                <button
                  key={university.id}
                  type="button"
                  onClick={() => handleSelectUniversity(university)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                    border-b border-gray-100 last:border-b-0
                    ${selectedUniversity?.id === university.id ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium truncate">
                        {formatUniversityDisplay(university)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FaMapMarkerAlt className="w-3 h-3 mr-1 flex-shrink-0" />
                        {formatUniversityLocation(university)}
                      </div>
                    </div>
                    {selectedUniversity?.id === university.id && (
                      <div className="text-blue-500 text-sm font-medium ml-2">
                        Selected
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
