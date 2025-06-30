'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import UniversityAdminLayout from '../../../components/university-admin/UniversityAdminLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  FaGraduationCap,
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUpload,
  FaFileAlt,
  FaAward,
  FaCalendarAlt,
  FaUser,
  FaIdCard,
  FaBook,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';

interface AcademicRecord {
  id: string;
  graduation_year: string;
  student_full_name: string;
  registration_number: string;
  program_name: string; // Ensure this matches the transformed backend field
  // certificate_uploaded: boolean; // These fields might not be directly in graduate_records
  certificate_url?: string;
  // certificate_status: 'pending' | 'approved' | 'rejected';
  // transcript_uploaded: boolean;
  transcript_url?: string;
  // transcript_status: 'pending' | 'approved' | 'rejected';
  overall_status: 'incomplete' | 'pending_review' | 'approved' | 'rejected' | ''; // This is likely derived or needs to be added
  is_verified: boolean; // From backend
  created_at: string;
  updated_at?: string; // Added updated_at as optional
}

export default function AcademicRecordsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AcademicRecord[]>([]); // Main state for records
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // This might need adjustment based on available data
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<AcademicRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewingFiles, setPreviewingFiles] = useState<Set<string>>(new Set());

  // Removed graduateRecords state, using 'records' as the single source of truth
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 0 });

  useEffect(() => {
    const fetchApiRecords = async (currentPage = 1, currentLimit = 10) => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/api/university-admin/academic-records?page=${currentPage}&limit=${currentLimit}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            cache: "no-store"
          }
        );
        const data = await response.json();
        if (data.success) {
          console.log("API Data Received:", data.data.records);
          // Map API response to AcademicRecord interface
          const fetchedApiRecords = data.data.records.map((apiRecord: any) => ({
            id: apiRecord.id,
            graduation_year: String(apiRecord.graduation_year ?? ''), // Ensure graduation_year is always a string
            student_full_name: apiRecord.student_full_name,
            registration_number: apiRecord.registration_number,
            program_name: apiRecord.program_name || 'N/A', // Use program_name from backend
            certificate_url: apiRecord.certificate_url,
            transcript_url: apiRecord.transcript_url,
            is_verified: apiRecord.is_verified,
            created_at: apiRecord.created_at,
            // Mocking other fields for now if not present in API response
            certificate_uploaded: !!apiRecord.certificate_url,
            certificate_status: apiRecord.is_verified ? 'approved' : 'pending',
            transcript_uploaded: !!apiRecord.transcript_url,
            transcript_status: apiRecord.is_verified ? 'approved' : 'pending',
            overall_status: apiRecord.is_verified ? 'approved' : 'pending_review',
            updated_at: apiRecord.created_at, // Or use a dedicated updated_at if available
          }));
          setRecords(fetchedApiRecords);
          setPagination(data.data.pagination);
        } else {
          console.error("Failed to load graduate records:", data.message);
          setError(data.message || "Failed to load records.");
        }
      } catch (err) {
        console.error("Error fetching graduate records:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchApiRecords(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]); // Re-fetch when page or limit changes

  useEffect(() => {
    filterRecords();
  }, [searchTerm, selectedYear, selectedStatus, records]);

  // Removed the separate loadRecords function that used mock data.
  // The API call is now the primary source in the first useEffect.

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.student_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.program_name || '').toLowerCase().includes(searchTerm.toLowerCase()) // Use program_name
      );
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(record => record.graduation_year === selectedYear);
    }

    if (selectedStatus !== 'all') {
      // Adjust this logic based on how overall_status is determined
      filtered = filtered.filter(record => record.overall_status === selectedStatus);
    }

    setFilteredRecords(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      case 'pending_review':
        return <FaClock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <FaTimesCircle className="w-4 h-4 text-red-500" />;
      case 'incomplete':
        return <FaClock className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'incomplete':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'incomplete':
        return 'Incomplete';
      case 'pending_review':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getAvailableYears = () => {
    const years = Array.from(new Set(records.map(r => r.graduation_year))).sort((a, b) => b.localeCompare(a));
    return years;
  };

  // Get file extension to determine type
  const getFileType = (url: string): 'pdf' | 'image' | 'unknown' => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  // Handle file preview with loading state and external window opening
  const handlePreviewFile = async (url: string, fileName: string, recordId: string) => {
    if (!url) {
      alert('File not available for preview');
      return;
    }

    const fileKey = `${recordId}_${fileName}`;
    setPreviewingFiles(prev => new Set(prev).add(fileKey));

    try {
      console.log('🔍 Loading file for preview:', fileName);
      
      // For Supabase storage URLs, we need to get a signed URL through our backend
      let previewUrl = url;
      
      // Check if this is a Supabase storage URL that needs authentication
      if (url.includes('supabase') && url.includes('storage')) {
        console.log('📄 Getting signed URL from backend...');
        
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/api/university-admin/academic-records/preview-url`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ fileUrl: url })
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.signedUrl) {
              previewUrl = data.signedUrl;
              console.log('✅ Got signed URL from backend');
            } else {
              console.warn('⚠️ Backend did not return signed URL, using original URL');
            }
          } else {
            console.warn('⚠️ Failed to get signed URL from backend, using original URL');
          }
        } catch (signedUrlError) {
          console.warn('⚠️ Error getting signed URL:', signedUrlError);
          // Continue with original URL as fallback
        }
      }
      
      console.log('🌐 Opening file in new tab...');
      
      // Open in new tab with proper window features
      const newWindow = window.open(
        previewUrl, 
        '_blank',
        'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=yes,menubar=yes,location=yes'
      );
      
      if (!newWindow) {
        // Popup blocked
        console.warn('⚠️ Popup blocked by browser');
        alert('Popup blocked! Please allow popups for this site and try again.');
      } else {
        // Focus on the new window
        newWindow.focus();
        console.log('✅ File opened in new tab successfully');
        
        // Add a small delay to show the loading state before removing it
        setTimeout(() => {
          setPreviewingFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(fileKey);
            return newSet;
          });
        }, 1000); // 1 second delay to show loading completed
      }
      
    } catch (error) {
      console.error('❌ Error opening file preview:', error);
      alert('Failed to open file preview. Please try again.');
    } finally {
      // Always remove loading state after a delay if not already removed
      setTimeout(() => {
        setPreviewingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileKey);
          return newSet;
        });
      }, 2000); // Fallback cleanup after 2 seconds
    }
  };

  const handleViewRecord = (record: AcademicRecord) => {
    setSelectedRecord(record);
  };

  const renderRecordCard = (record: AcademicRecord) => (
    <div key={record.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {record.student_full_name}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            <FaIdCard className="inline w-3 h-3 mr-1" />
            {record.registration_number}
          </p>
          <p className="text-sm text-gray-600">
            <FaBook className="inline w-3 h-3 mr-1" />
            {record.program_name}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.overall_status)}`}>
            {getStatusIcon(record.overall_status)}
            <span className="ml-1">{getStatusText(record.overall_status)}</span>
          </span>
          <span className="text-xs text-gray-500">
            <FaCalendarAlt className="inline w-3 h-3 mr-1" />
            {record.graduation_year}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <FaAward className={`w-4 h-4 ${record.certificate_url ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-700">Certificate</span>
          {record.certificate_url ? (
            <button
              onClick={() => handlePreviewFile(record.certificate_url!, `${record.student_full_name}_Certificate`, record.id)}
              disabled={previewingFiles.has(`${record.id}_${record.student_full_name}_Certificate`)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-xs underline ml-1 disabled:text-gray-400 disabled:no-underline"
              title="Open in new tab"
            >
              {previewingFiles.has(`${record.id}_${record.student_full_name}_Certificate`) ? (
                <>
                  <FaSpinner className="animate-spin w-3 h-3 mr-1" />
                  Loading...
                </>
              ) : (
                'Open'
              )}
            </button>
          ) : (
            <FaClock className="w-3 h-3 text-gray-400" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <FaFileAlt className={`w-4 h-4 ${record.transcript_url ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-700">Transcript</span>
          {record.transcript_url ? (
            <button
              onClick={() => handlePreviewFile(record.transcript_url!, `${record.student_full_name}_Transcript`, record.id)}
              disabled={previewingFiles.has(`${record.id}_${record.student_full_name}_Transcript`)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-xs underline ml-1 disabled:text-gray-400 disabled:no-underline"
              title="Open in new tab"
            >
              {previewingFiles.has(`${record.id}_${record.student_full_name}_Transcript`) ? (
                <>
                  <FaSpinner className="animate-spin w-3 h-3 mr-1" />
                  Loading...
                </>
              ) : (
                'Open'
              )}
            </button>
          ) : (
            <FaClock className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Created {new Date(record.created_at).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          {/* Updated download button tooltip */}
          <button
            onClick={() => handleDownloadFiles(record)}
            disabled={isDownloading || (!record.certificate_url && !record.transcript_url)}
            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            title="Download files separately"
          >
            {isDownloading ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaDownload className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleDeleteRecord(record)}
            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
            title="Delete Record"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['university_admin']}>
        <UniversityAdminLayout user={user} onLogout={logout}>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-gray-200 rounded-lg h-32"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
              ))}
            </div>
          </div>
        </UniversityAdminLayout>
      </ProtectedRoute>
    );
  }

  // Handle file downloads separately (not as ZIP) - FIXED extension detection
  const handleDownloadFiles = async (record: AcademicRecord) => {
    if (!record.certificate_url && !record.transcript_url) {
      alert('No files available for download.');
      return;
    }

    setIsDownloading(true);

    // Helper to get signed URL if needed
    const getSignedUrl = async (url: string): Promise<string> => {
      if (!url) return '';
      if (url.includes('supabase') && url.includes('storage')) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/api/university-admin/academic-records/preview-url`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ fileUrl: url })
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.signedUrl) {
              return data.signedUrl;
            }
          }
        } catch (err) {
          console.warn('Error getting signed URL for download:', err);
        }
      }
      return url;
    };

    // IMPROVED: Better file extension detection from URL or Content-Type
    const getFileExtension = async (url: string, response?: Response): Promise<string> => {
      // First, try to get extension from the original URL (before any signing)
      const originalUrl = url.includes('supabase') ? url : url;
      const urlPath = originalUrl.split('?')[0]; // Remove query parameters
      const urlExtension = urlPath.split('.').pop()?.toLowerCase();
      
      console.log('🔍 URL path for extension detection:', urlPath);
      console.log('🔍 Extracted URL extension:', urlExtension);
      
      // Valid file extensions we expect
      const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'doc', 'docx'];
      
      if (urlExtension && validExtensions.includes(urlExtension)) {
        console.log('✅ Using URL extension:', urlExtension);
        return urlExtension;
      }
      
      // If no valid extension from URL, try Content-Type from response
      if (response) {
        const contentType = response.headers.get('content-type') || '';
        console.log('🔍 Content-Type from response:', contentType);
        
        const typeToExtension: { [key: string]: string } = {
          'application/pdf': 'pdf',
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/bmp': 'bmp',
          'image/tiff': 'tiff',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
        };
        
        for (const [type, ext] of Object.entries(typeToExtension)) {
          if (contentType.includes(type)) {
            console.log('✅ Using Content-Type extension:', ext);
            return ext;
          }
        }
      }
      
      // Default fallback based on file type detection
      console.log('⚠️ Using fallback extension detection');
      const fileType = getFileType(url);
      return fileType === 'pdf' ? 'pdf' : fileType === 'image' ? 'jpg' : 'pdf';
    };

    try {
      console.log('📥 Starting individual file downloads for:', record.student_full_name);
      
      // Download certificate
      if (record.certificate_url) {
        console.log('📄 Downloading certificate...');
        console.log('📄 Original certificate URL:', record.certificate_url);
        
        const certUrl = await getSignedUrl(record.certificate_url);
        console.log('📄 Certificate download URL:', certUrl);
        
        const certResponse = await fetch(certUrl);
        if (!certResponse.ok) throw new Error('Failed to fetch certificate');
        
        // Get proper file extension
        const certExtension = await getFileExtension(record.certificate_url, certResponse);
        const cleanStudentName = record.student_full_name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const certFileName = `${cleanStudentName}_Certificate.${certExtension}`;
        
        console.log('📄 Certificate will be saved as:', certFileName);
        
        const certBlob = await certResponse.blob();
        const certLink = document.createElement('a');
        certLink.href = URL.createObjectURL(certBlob);
        certLink.download = certFileName;
        document.body.appendChild(certLink);
        certLink.click();
        certLink.remove();
        URL.revokeObjectURL(certLink.href);
        console.log('✅ Certificate downloaded as:', certFileName);
      }

      // Add a small delay between downloads to avoid browser blocking
      if (record.certificate_url && record.transcript_url) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Download transcript
      if (record.transcript_url) {
        console.log('📄 Downloading transcript...');
        console.log('📄 Original transcript URL:', record.transcript_url);
        
        const transUrl = await getSignedUrl(record.transcript_url);
        console.log('📄 Transcript download URL:', transUrl);
        
        const transResponse = await fetch(transUrl);
        if (!transResponse.ok) throw new Error('Failed to fetch transcript');
        
        // Get proper file extension
        const transExtension = await getFileExtension(record.transcript_url, transResponse);
        const cleanStudentName = record.student_full_name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const transFileName = `${cleanStudentName}_Transcript.${transExtension}`;
        
        console.log('📄 Transcript will be saved as:', transFileName);
        
        const transBlob = await transResponse.blob();
        const transLink = document.createElement('a');
        transLink.href = URL.createObjectURL(transBlob);
        transLink.download = transFileName;
        document.body.appendChild(transLink);
        transLink.click();
        transLink.remove();
        URL.revokeObjectURL(transLink.href);
        console.log('✅ Transcript downloaded as:', transFileName);
      }
      
      console.log('✅ All downloads completed');
      
      // Show success message
      const fileCount = (record.certificate_url ? 1 : 0) + (record.transcript_url ? 1 : 0);
      alert(`Successfully downloaded ${fileCount} file${fileCount > 1 ? 's' : ''} for ${record.student_full_name}`);
      
    } catch (err) {
      console.error('❌ Download error:', err);
      alert('Failed to download file(s). Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle record deletion
  const handleDeleteRecord = (record: AcademicRecord) => {
    console.log('🗑️ Preparing to delete record:', record.student_full_name);
    setDeletingRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (!deletingRecord) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/api/university-admin/academic-records/${deletingRecord.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete record');
      }

      const result = await response.json();
      console.log('✅ Record deleted successfully:', result);

      // Refresh the records list
      window.location.reload(); // Simple refresh for now

      setIsDeleteDialogOpen(false);
      setDeletingRecord(null);
    } catch (error) {
      console.error('❌ Error deleting record:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete record');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['university_admin']}>
      <UniversityAdminLayout 
        user={user} 
        onLogout={logout}
        title="Academic Records Management"
        subtitle="Manage student certificates and transcripts by graduation year"
      >
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaGraduationCap className="w-4 h-4" />
                <span>{filteredRecords.length} academic records</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {viewMode === 'cards' ? 'List View' : 'Card View'}
              </button>
              <button
                onClick={() => router.push('/university-admin/academic-records/add')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Graduate Record
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students, registration numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="incomplete">Incomplete</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <div className="flex items-center text-sm text-gray-600">
                <FaFilter className="w-4 h-4 mr-2" />
                <span>Showing {filteredRecords.length} of {records.length}</span>
              </div>
            </div>
          </div>

          {/* Records Display */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && filteredRecords.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">Loading records...</p>
                </div>
              ) : !loading && filteredRecords.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <FaGraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No academic records found for this university.</p>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  <button
                    onClick={() => router.push('/university-admin/academic-records/add')}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                  >
                    Add your first graduate record
                  </button>
                </div>
              ) : (
                filteredRecords.map(renderRecordCard)
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <p className="p-8 text-center text-gray-500">List view coming soon...</p>
            </div>
          )}
        </div>

        {/* Record Details Modal - Remove eye functionality, keep download ZIP */}
        {selectedRecord && (
          <div className="fixed inset-0 z-[9998] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Record Details</h3>
                <button onClick={() => setSelectedRecord(null)}>
                  <FaTimes className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Student Name</p>
                    <p className="text-gray-900">{selectedRecord.student_full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration Number</p>
                    <p className="text-gray-900">{selectedRecord.registration_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Program</p>
                    <p className="text-gray-900">{selectedRecord.program_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Graduation Year</p>
                    <p className="text-gray-900">{selectedRecord.graduation_year}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  {selectedRecord.certificate_url && (
                    <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <FaAward className="w-5 h-5 mr-2 text-green-500" />
                        <span className="font-medium">Certificate</span>
                      </div>
                      <button
                        onClick={() => handlePreviewFile(selectedRecord.certificate_url!, 'Certificate', selectedRecord.id)}
                        disabled={previewingFiles.has(`${selectedRecord.id}_Certificate`)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title="Open in new tab"
                      >
                        {previewingFiles.has(`${selectedRecord.id}_Certificate`) ? (
                          <>
                            <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                            Opening...
                          </>
                        ) : (
                          'Open Preview'
                        )}
                      </button>
                    </div>
                  )}
                  {selectedRecord.transcript_url && (
                    <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <FaFileAlt className="w-5 h-5 mr-2 text-blue-500" />
                        <span className="font-medium">Transcript</span>
                      </div>
                      <button
                        onClick={() => handlePreviewFile(selectedRecord.transcript_url!, 'Transcript', selectedRecord.id)}
                        disabled={previewingFiles.has(`${selectedRecord.id}_Transcript`)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title="Open in new tab"
                      >
                        {previewingFiles.has(`${selectedRecord.id}_Transcript`) ? (
                          <>
                            <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                            Opening...
                          </>
                        ) : (
                          'Open Preview'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Updated download button in the modal */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDownloadFiles(selectedRecord)}
                    disabled={isDownloading || (!selectedRecord.certificate_url && !selectedRecord.transcript_url)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Download files separately"
                  >
                    {isDownloading ? (
                      <>
                        <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaDownload className="w-4 h-4 mr-2" />
                        Download All Files
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog - FIXED Z-INDEX */}
        {isDeleteDialogOpen && deletingRecord && (
          <div className="fixed inset-0 z-[9997] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Record</h3>
                <button onClick={() => setIsDeleteDialogOpen(false)}>
                  <FaTimes className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the record for <strong>{deletingRecord.student_full_name}</strong>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This will permanently delete the record and all associated files. This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteRecord}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        )}
      </UniversityAdminLayout>
    </ProtectedRoute>
  );
}

