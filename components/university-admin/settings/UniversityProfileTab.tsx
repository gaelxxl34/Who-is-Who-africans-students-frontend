import { 
  FaUniversity,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';

interface UniversityProfile {
  name: string;
  country: string;
  city: string;
  short_name: string;
  phone: string;
  address: string;
  website: string;
  logo_url: string;
  registration_number: string;
  accreditation_body: string;
  is_active: boolean;
  is_verified: boolean;
  email: string;
  established_year: string;
  description: string;
}

interface UniversityProfileTabProps {
  settings: UniversityProfile | undefined;
  loading: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function UniversityProfileTab({ settings, loading, onUpdate }: UniversityProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <FaUniversity className="w-5 h-5 mr-2 text-blue-600" />
          University Information
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Name *
              </label>
              <input
                type="text"
                value={settings?.name || ''}
                onChange={(e) => onUpdate('name', e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter university name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Name
              </label>
              <input
                type="text"
                value={settings?.short_name || ''}
                onChange={(e) => onUpdate('short_name', e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. MAK, UCU"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                value={settings?.country || ''}
                onChange={(e) => onUpdate('country', e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Uganda"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={settings?.city || ''}
                onChange={(e) => onUpdate('city', e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Kampala"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={settings?.phone || ''}
                  onChange={(e) => onUpdate('phone', e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+256-000-000000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="url"
                  value={settings?.website || ''}
                  onChange={(e) => onUpdate('website', e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.university.edu"
                />
              </div>
            </div>
          </div>
        )}
        
        {!loading && (
          <>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  value={settings?.address || ''}
                  onChange={(e) => onUpdate('address', e.target.value)}
                  rows={3}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full address of the university"
                />
              </div>
            </div>

            {/* Additional university-specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={settings?.registration_number || ''}
                  onChange={(e) => onUpdate('registration_number', e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Official registration number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accreditation Body
                </label>
                <input
                  type="text"
                  value={settings?.accreditation_body || ''}
                  onChange={(e) => onUpdate('accreditation_body', e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Uganda National Council for Higher Education"
                />
              </div>
            </div>

            {/* Status toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">University Active</div>
                  <div className="text-sm text-gray-600">Enable university operations</div>
                </div>
                <button
                  onClick={() => onUpdate('is_active', !settings?.is_active)}
                  className={`p-1 rounded ${settings?.is_active ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {settings?.is_active ? <FaToggleOn className="w-8 h-8" /> : <FaToggleOff className="w-8 h-8" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">University Verified</div>
                  <div className="text-sm text-gray-600">Official verification status</div>
                </div>
                <button
                  onClick={() => onUpdate('is_verified', !settings?.is_verified)}
                  className={`p-1 rounded ${settings?.is_verified ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {settings?.is_verified ? <FaToggleOn className="w-8 h-8" /> : <FaToggleOff className="w-8 h-8" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
