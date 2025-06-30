import { 
  FaChild,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';

interface SecuritySettings {
  two_factor_required: boolean;
  session_timeout: number;
  password_expiry_days: number;
  audit_log_retention: number;
  ip_whitelist: string[];
}

interface SecurityTabProps {
  settings: SecuritySettings | undefined;
  loading: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function SecurityTab({ settings, loading, onUpdate }: SecurityTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <FaChild className="w-5 h-5 mr-2 text-red-600" />
          Security Configuration
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-600">Require 2FA for all admin users</div>
            </div>
            <button
              onClick={() => onUpdate('two_factor_required', !settings?.two_factor_required)}
              className={`p-1 rounded ${settings?.two_factor_required ? 'text-green-600' : 'text-gray-400'}`}
            >
              {settings?.two_factor_required ? <FaToggleOn className="w-8 h-8" /> : <FaToggleOff className="w-8 h-8" />}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings?.session_timeout || ''}
                onChange={(e) => onUpdate('session_timeout', parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                value={settings?.password_expiry_days || ''}
                onChange={(e) => onUpdate('password_expiry_days', parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
