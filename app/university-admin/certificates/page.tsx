'use client';

import React from 'react';

export default function CertificatesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Certificates Management</h1>
        <p className="text-gray-600 mt-2">
          Manage and issue digital certificates for graduates
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Certificates Feature Coming Soon
          </h3>
          <p className="text-gray-500 mb-6">
            This feature is currently under development. You will be able to create, 
            manage, and issue digital certificates for your graduates.
          </p>
          <div className="text-sm text-gray-400">
            Features will include:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Certificate template creation</li>
              <li>Bulk certificate generation</li>
              <li>Digital signature integration</li>
              <li>Certificate verification portal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
