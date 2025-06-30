import { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaTrash, FaSpinner } from 'react-icons/fa';

interface DeletionResults {
  auth_deleted: boolean;
  profile_deleted: boolean;
  audit_logs_deleted: boolean;
  user_deleted: boolean;
  errors: string[];
}

interface DeletedUser {
  id: string;
  email: string;
  user_type: string;
  display_name: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
  data?: {
    deletedUser: DeletedUser;
    deletionResults: DeletionResults;
    warnings?: string[];
  };
}

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<DeleteResponse>;
  userDisplayName: string;
  userEmail: string;
  userType: string;
  loading?: boolean;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  userDisplayName,
  userEmail,
  userType,
  loading = false
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<DeleteResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Add debugging
  console.log('🗑️ DeleteConfirmationDialog render check:', {
    isOpen,
    userDisplayName,
    userEmail,
    userType,
    isDeleting,
    showResults
  });

  if (!isOpen) {
    console.log('🗑️ Dialog not open, returning null');
    return null;
  }

  console.log('🗑️ Dialog should be visible now');

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteResult(null);
    
    try {
      console.log('🗑️ Starting user deletion process...');
      const result = await onConfirm();
      
      console.log('✅ Delete operation completed:', result);
      setDeleteResult(result);
      setShowResults(true);
      
      // If successful, close dialog after showing results briefly
      if (result.success) {
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      const errorResult: DeleteResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setDeleteResult(errorResult);
      setShowResults(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setIsDeleting(false);
    setDeleteResult(null);
    setShowResults(false);
    onClose();
  };

  // Show deletion results
  if (showResults && deleteResult) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen px-4 text-center">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          
          <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium leading-6 ${deleteResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {deleteResult.success ? '✅ Deletion Completed' : '❌ Deletion Failed'}
              </h3>
              <button
                onClick={handleClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className={`p-4 rounded-lg ${deleteResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-sm ${deleteResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {deleteResult.message}
              </p>

              {deleteResult.success && deleteResult.data && (
                <div className="mt-4 space-y-3">
                  <div className="text-sm text-green-700">
                    <strong>Deleted User:</strong> {deleteResult.data.deletedUser.display_name} ({deleteResult.data.deletedUser.email})
                  </div>
                  
                  <div className="text-xs text-green-600">
                    <strong>Deletion Details:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>✓ User record: {deleteResult.data.deletionResults.user_deleted ? 'Deleted' : 'Failed'}</li>
                      <li>✓ Profile data: {deleteResult.data.deletionResults.profile_deleted ? 'Deleted' : 'Failed'}</li>
                      <li>✓ Authentication: {deleteResult.data.deletionResults.auth_deleted ? 'Deleted' : 'Skipped/Failed'}</li>
                      <li>✓ Audit logs: {deleteResult.data.deletionResults.audit_logs_deleted ? 'Cleaned' : 'Failed'}</li>
                    </ul>
                  </div>

                  {deleteResult.data.warnings && deleteResult.data.warnings.length > 0 && (
                    <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                      <strong>⚠️ Warnings:</strong>
                      <ul className="mt-1 space-y-1">
                        {deleteResult.data.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleClose}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none transition-colors ${
                  deleteResult.success 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleteResult.success ? 'Close' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show confirmation dialog
  console.log('🗑️ Rendering confirmation dialog');
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Confirm Deletion
              </h3>
            </div>
            <button
              onClick={() => {
                console.log('🚪 Close button clicked');
                handleClose();
              }}
              disabled={isDeleting}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-sm text-red-800">
              <p className="font-medium mb-2">⚠️ This action cannot be undone!</p>
              
              <p className="mb-3">
                You are about to permanently delete the following user:
              </p>
              
              <div className="bg-white border border-red-200 rounded p-3 space-y-1">
                <div><strong>Name:</strong> {userDisplayName}</div>
                <div><strong>Email:</strong> {userEmail}</div>
                <div><strong>Type:</strong> <span className="capitalize">{userType}</span></div>
              </div>
              
              <div className="mt-3 text-xs">
                <p className="font-medium">This will delete:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>User account and profile data</li>
                  <li>Authentication credentials</li>
                  <li>Related audit logs</li>
                  <li>All associated data</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                console.log('🚫 Cancel button clicked');
                handleClose();
              }}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('🗑️ Delete button clicked');
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash className="h-4 w-4" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
