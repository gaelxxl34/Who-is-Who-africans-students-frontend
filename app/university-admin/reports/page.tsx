'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import UniversityAdminLayout from '../../../components/university-admin/UniversityAdminLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaDownload,
  FaCalendarAlt,
  FaGraduationCap,
  FaFileAlt,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaFileExport,
  FaFilePdf,
  FaFileCsv,
  FaUsers,
  FaBook,
  FaMapMarkerAlt,
  FaSpinner
} from 'react-icons/fa';

interface ReportStats {
  totalGraduates: number;
  pendingApprovals: number;
  completionRate: number;
  popularPrograms: Array<{ name: string; count: number; percentage: number }>;
  graduationTrends: Array<{ year: string; graduates: number; change: number }>;
  documentStats: {
    certificates: { uploaded: number; approved: number; pending: number; rejected: number };
    transcripts: { uploaded: number; approved: number; pending: number; rejected: number };
  };
  processingTimes: {
    avgCertificateTime: number;
    avgTranscriptTime: number;
    overall: number;
  };
  yearOverYear: {
    currentYear: string;
    previousYear: string;
    graduatesChange: number;
    completionChange: number;
    efficiencyChange: number;
  };
}

export default function UniversityReportsPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all-time');
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    loadReportData();
  }, [selectedYear, selectedProgram, selectedDateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockStats: ReportStats = {
        totalGraduates: 1247,
        pendingApprovals: 23,
        completionRate: 85.7,
        popularPrograms: [
          { name: 'Bachelor of Computer Science', count: 340, percentage: 27.3 },
          { name: 'Bachelor of Business Administration', count: 298, percentage: 23.9 },
          { name: 'Bachelor of Engineering', count: 245, percentage: 19.6 },
          { name: 'Bachelor of Medicine', count: 189, percentage: 15.2 },
          { name: 'Bachelor of Arts', count: 175, percentage: 14.0 }
        ],
        graduationTrends: [
          { year: '2020', graduates: 890, change: 0 },
          { year: '2021', graduates: 985, change: 10.7 },
          { year: '2022', graduates: 1120, change: 13.7 },
          { year: '2023', graduates: 1205, change: 7.6 },
          { year: '2024', graduates: 1247, change: 3.5 }
        ],
        documentStats: {
          certificates: { uploaded: 1247, approved: 1198, pending: 23, rejected: 26 },
          transcripts: { uploaded: 1189, approved: 1145, pending: 19, rejected: 25 }
        },
        processingTimes: {
          avgCertificateTime: 3.2,
          avgTranscriptTime: 2.8,
          overall: 3.0
        },
        yearOverYear: {
          currentYear: '2024',
          previousYear: '2023',
          graduatesChange: 3.5,
          completionChange: 2.1,
          efficiencyChange: -0.3
        }
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv', reportType: string) => {
    try {
      setExporting(`${format}-${reportType}`);
      console.log(`Exporting ${reportType} as ${format.toUpperCase()}`);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would trigger a download
      alert(`${reportType} exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const getAvailableYears = () => {
    if (!stats) return [];
    return stats.graduationTrends.map(trend => trend.year);
  };

  const formatPercentageChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <span className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
        {isPositive ? <FaArrowUp className="w-3 h-3" /> : change < 0 ? <FaArrowDown className="w-3 h-3" /> : null}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </span>
    );
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Graduates */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaGraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-500">Total Graduates</div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalGraduates.toLocaleString()}</div>
            {stats?.yearOverYear && (
              <div className="text-sm">
                {formatPercentageChange(stats.yearOverYear.graduatesChange)} vs last year
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaClock className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-500">Pending Approvals</div>
            <div className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals}</div>
            <div className="text-sm text-yellow-600">Requires attention</div>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaCheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-500">Completion Rate</div>
            <div className="text-2xl font-bold text-gray-900">{stats?.completionRate}%</div>
            {stats?.yearOverYear && (
              <div className="text-sm">
                {formatPercentageChange(stats.yearOverYear.completionChange)} vs last year
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Processing Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaFileAlt className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-500">Avg Processing Time</div>
            <div className="text-2xl font-bold text-gray-900">{stats?.processingTimes.overall} days</div>
            {stats?.yearOverYear && (
              <div className="text-sm">
                {formatPercentageChange(stats.yearOverYear.efficiencyChange)} vs last year
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('pdf', 'full-report')}
            disabled={!!exporting}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {exporting === 'pdf-full-report' ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FaFilePdf className="w-4 h-4" />
            )}
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('csv', 'data-export')}
            disabled={!!exporting}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {exporting === 'csv-data-export' ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FaFileCsv className="w-4 h-4" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Graduation Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Years</option>
            {getAvailableYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program
          </label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Programs</option>
            {stats?.popularPrograms.map(program => (
              <option key={program.name} value={program.name}>{program.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all-time">All Time</option>
            <option value="this-year">This Year</option>
            <option value="last-year">Last Year</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-3-months">Last 3 Months</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={loadReportData}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaFilter className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProgramDistribution = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Program Distribution</h3>
        <FaChartPie className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {stats?.popularPrograms.map((program, index) => (
          <div key={program.name} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{program.name}</span>
                <span className="text-gray-500">{program.count} graduates</span>
              </div>
              <div className="mt-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-blue-600' :
                      index === 1 ? 'bg-green-600' :
                      index === 2 ? 'bg-yellow-600' :
                      index === 3 ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                    style={{ width: `${program.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {program.percentage}% of total graduates
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocumentStats = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Document Processing Overview</h3>
        <FaFileAlt className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificates */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <FaAward className="w-4 h-4 mr-2 text-yellow-600" />
            Certificates
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uploaded:</span>
              <span className="font-medium">{stats?.documentStats.certificates.uploaded}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Approved:</span>
              <span className="font-medium text-green-600">{stats?.documentStats.certificates.approved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600">Pending:</span>
              <span className="font-medium text-yellow-600">{stats?.documentStats.certificates.pending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-600">Rejected:</span>
              <span className="font-medium text-red-600">{stats?.documentStats.certificates.rejected}</span>
            </div>
          </div>
        </div>

        {/* Transcripts */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <FaFileAlt className="w-4 h-4 mr-2 text-blue-600" />
            Transcripts
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uploaded:</span>
              <span className="font-medium">{stats?.documentStats.transcripts.uploaded}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Approved:</span>
              <span className="font-medium text-green-600">{stats?.documentStats.transcripts.approved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600">Pending:</span>
              <span className="font-medium text-yellow-600">{stats?.documentStats.transcripts.pending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-600">Rejected:</span>
              <span className="font-medium text-red-600">{stats?.documentStats.transcripts.rejected}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGraduationTrends = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Graduation Trends</h3>
        <FaChartLine className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {stats?.graduationTrends.map((trend, index) => (
          <div key={trend.year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold text-gray-900">{trend.year}</div>
              <div className="text-sm text-gray-600">{trend.graduates} graduates</div>
            </div>
            <div className="flex items-center space-x-2">
              {index > 0 && formatPercentageChange(trend.change)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['university_admin']}>
        <UniversityAdminLayout user={user} onLogout={logout}>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
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
        title="Analytics & Reports"
        subtitle="Comprehensive insights into your academic records and graduation data"
      >
        <div className="space-y-6">
          {/* Overview Cards */}
          {renderOverviewCards()}

          {/* Filters and Export */}
          {renderFilters()}

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Program Distribution */}
            {renderProgramDistribution()}

            {/* Document Statistics */}
            {renderDocumentStats()}
          </div>

          {/* Graduation Trends */}
          {renderGraduationTrends()}

          {/* Additional Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Most Popular Program</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats?.popularPrograms[0]?.name}
                </div>
                <div className="text-sm text-blue-600">
                  {stats?.popularPrograms[0]?.count} graduates this year
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">Processing Efficiency</div>
                <div className="text-lg font-bold text-green-900">
                  {stats?.processingTimes.overall} days avg
                </div>
                <div className="text-sm text-green-600">
                  Average document approval time
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800">Document Completion</div>
                <div className="text-lg font-bold text-purple-900">
                  {stats?.completionRate}%
                </div>
                <div className="text-sm text-purple-600">
                  Of graduates have complete records
                </div>
              </div>
            </div>
          </div>
        </div>
      </UniversityAdminLayout>
    </ProtectedRoute>
  );
}
