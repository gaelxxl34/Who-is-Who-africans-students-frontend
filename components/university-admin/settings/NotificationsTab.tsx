import { 
  FaBell,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';

interface NotificationSettings {
  document_approval_alerts: boolean;
  graduation_reminders: boolean;
  system_maintenance: boolean;
  weekly_reports: boolean;
}

interface NotificationsTabProps {
  settings: NotificationSettings | undefined;
  loading: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function NotificationsTab({ settings, loading, onUpdate }: NotificationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <FaBell className="w-5 h-5 mr-2 text-yellow-600" />
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          {Object.entries(settings || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 capitalize">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-gray-600">
                  {key === 'email_enabled' && 'Receive notifications via email'}
                  {key === 'document_approval_alerts' && 'Get alerts when documents need approval'}
                  {key === 'graduation_reminders' && 'Reminders for graduation processes'}
                  {key === 'system_maintenance' && 'System maintenance notifications'}
                  {key === 'weekly_reports' && 'Weekly summary reports'}
                </div>
              </div>
              <button
                onClick={() => onUpdate(key, !value)}
                className={`p-1 rounded ${value ? 'text-green-600' : 'text-gray-400'}`}
              >
                {value ? <FaToggleOn className="w-8 h-8" /> : <FaToggleOff className="w-8 h-8" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
