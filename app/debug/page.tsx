'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function DebugPage() {
  const { user, isAuthenticated } = useAuth();
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    // Only show debug info in development
    if (process.env.NODE_ENV === 'development') {
      setSystemInfo({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        environment: process.env.NODE_ENV,
        user: user,
        isAuthenticated,
      });
    }
  }, [user, isAuthenticated]);

  // Redirect in production
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Available</h1>
          <p className="text-gray-600">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Debug Information</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Authentication Status</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">System Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {systemInfo && (
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(systemInfo, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Environment Variables</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
                <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
                <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}