import { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  FaGraduationCap,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUpload,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import React from 'react';

interface AcademicProgram {
  id: string;
  program: string;
  faculty: string;
  duration: string;
  is_active: boolean;
}

// FIX: Update interface to match backend response structure
interface AcademicSettings {
  programs: AcademicProgram[];
}

interface AcademicSettingsTabProps {
  settings: {
    programs: AcademicProgram[];
  } | undefined;
  loading: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function AcademicSettingsTab({ settings, loading, onUpdate }: AcademicSettingsTabProps) {
  const [newProgram, setNewProgram] = useState({
    program: '',
    faculty: '',
    duration: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
  const [editFormData, setEditFormData] = useState({
    program: '',
    faculty: '',
    duration: ''
  });

  // Add debugging when component renders - FIX: Access programs correctly
  console.log("🎓 AcademicSettingsTab render:", {
    settings,
    loading,
    programsCount: settings?.programs?.length || 0,
    programs: settings?.programs,
    settingsKeys: settings ? Object.keys(settings) : []
  });

  // Fixed debugging - now accessing programs directly
  React.useEffect(() => {
    console.log("🔍 Settings changed in AcademicSettingsTab:");
    console.log("  - settings object:", settings);
    console.log("  - settings.programs:", settings?.programs);
    console.log("  - programs array length:", settings?.programs?.length || 0);
    console.log("  - first program:", settings?.programs?.[0]);
  }, [settings]);

  // Handle Excel upload for programs
  const handleProgramsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsSubmitting(true);
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const [headers, ...dataRows] = rows;
      
      // Map Excel data to our program structure
      const programs = dataRows.map((row, index) => {
        const program: any = {};
        headers.forEach((header, i) => {
          program[header.toLowerCase().replace(/\s+/g, '_')] = row[i];
        });
        
        return {
          program: program.program || program.name || '',
          faculty: program.faculty || '',
          duration: program.duration || '',
          is_active: true
        };
      }).filter(p => p.program); // Remove empty rows
      
      // Send to API for bulk upload
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/programs/bulk-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ programs })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload programs');
      }

      const result = await response.json();
      console.log('✅ Bulk upload successful:', result);
      
      // Refresh the programs list by calling onUpdate with empty array first, then reload
      onUpdate('programs', []);
      // Trigger a refresh of the parent component
      window.location.reload(); // Simple approach - could be improved with better state management
      
      // Clear the file input
      e.target.value = '';
      alert(`Successfully uploaded ${result.data.inserted} programs!`);
      
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      alert(`Error uploading Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProgram = async () => {
    if (!newProgram.program || !newProgram.faculty || !newProgram.duration) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          program_name: newProgram.program,
          faculty: newProgram.faculty,
          duration: newProgram.duration
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add program');
      }

      const result = await response.json();
      console.log('✅ Program added successfully:', result);

      // Fixed: Update local state correctly
      const newProgramData: AcademicProgram = {
        id: result.data.id,
        program: result.data.program,
        faculty: result.data.faculty,
        duration: result.data.duration,
        is_active: result.data.is_active
      };

      const currentPrograms = settings?.programs || [];
      onUpdate('programs', [...currentPrograms, newProgramData]);
      
      // Reset form
      setNewProgram({ program: '', faculty: '', duration: '' });
      setShowAddForm(false);
      
      alert('Program added successfully!');
      
    } catch (error) {
      console.error('Error adding program:', error);
      alert(`Error adding program: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleProgram = async (programId: string) => {
    try {
      const currentPrograms = settings?.programs || [];
      const program = currentPrograms.find(p => p.id === programId);
      
      if (!program) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/programs/${programId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          program_name: program.program,
          faculty: program.faculty,
          duration: program.duration,
          is_active: !program.is_active
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update program');
      }

      // Fixed: Update local state correctly
      const updatedPrograms = currentPrograms.map(p => 
        p.id === programId ? { ...p, is_active: !p.is_active } : p
      );
      onUpdate('programs', updatedPrograms);
      
    } catch (error) {
      console.error('Error toggling program:', error);
      alert(`Error updating program: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/programs/${programId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete program');
      }

      // Fixed: Update local state correctly
      const currentPrograms = settings?.programs || [];
      const updatedPrograms = currentPrograms.filter(p => p.id !== programId);
      onUpdate('programs', updatedPrograms);
      
      alert('Program deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting program:', error);
      alert(`Error deleting program: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditProgram = (program: AcademicProgram) => {
    console.log('✏️ Starting edit for program:', program.program);
    setEditingProgram(program);
    setEditFormData({
      program: program.program,
      faculty: program.faculty,
      duration: program.duration
    });
  };

  const handleCancelEdit = () => {
    console.log('❌ Cancelling edit');
    setEditingProgram(null);
    setEditFormData({ program: '', faculty: '', duration: '' });
  };

  const handleSaveEdit = async () => {
    if (!editingProgram) return;
    
    if (!editFormData.program || !editFormData.faculty || !editFormData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/university-admin/programs/${editingProgram.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          program_name: editFormData.program,
          faculty: editFormData.faculty,
          duration: editFormData.duration,
          is_active: editingProgram.is_active
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update program');
      }

      const result = await response.json();
      console.log('✅ Program updated successfully:', result);

      // Fixed: Update local state correctly
      const currentPrograms = settings?.programs || [];
      const updatedPrograms = currentPrograms.map(p => 
        p.id === editingProgram.id ? {
          ...p,
          program: result.data.program,
          faculty: result.data.faculty,
          duration: result.data.duration
        } : p
      );
      onUpdate('programs', updatedPrograms);
      
      // Reset edit state
      setEditingProgram(null);
      setEditFormData({ program: '', faculty: '', duration: '' });
      
      alert('Program updated successfully!');
      
    } catch (error) {
      console.error('Error updating program:', error);
      alert(`Error updating program: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Excel Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaUpload className="w-5 h-5 mr-2 text-blue-600" />
          Bulk Upload Programs
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Programs (Excel)
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Excel file should have columns: Program, Faculty, Duration
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleProgramsUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          {/* Fixed: Programs table preview - use correct path */}
          {settings?.programs && settings.programs.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                      Program
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                      Faculty
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                      Duration
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {settings.programs.slice(0, 5).map((program, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700 border-b">
                        {program.program}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 border-b">
                        {program.faculty}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 border-b">
                        {program.duration}
                      </td>
                      <td className="px-4 py-2 text-sm border-b">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          program.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {program.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {settings.programs.length > 5 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-sm text-gray-500 text-center border-b">
                        ... and {settings.programs.length - 5} more programs
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Programs Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaGraduationCap className="w-5 h-5 mr-2 text-green-600" />
            Academic Programs ({settings?.programs?.length || 0})
          </h3>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={editingProgram !== null}
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Add New Program
          </button>
        </div>
        
        {/* Add Program Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New Program</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name *
                </label>
                <input
                  type="text"
                  value={newProgram.program}
                  onChange={(e) => setNewProgram({...newProgram, program: e.target.value})}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g. Bachelor of Science in Computer Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty *
                </label>
                <input
                  type="text"
                  value={newProgram.faculty}
                  onChange={(e) => setNewProgram({...newProgram, faculty: e.target.value})}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g. Faculty of Science and Technology"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  type="text"
                  value={newProgram.duration}
                  onChange={(e) => setNewProgram({...newProgram, duration: e.target.value})}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g. 4 Years"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProgram}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Program'}
              </button>
            </div>
          </div>
        )}
        
        {/* Programs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading programs...</p>
            </div>
          ) : !settings?.programs || settings.programs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaGraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No academic programs found</p>
              <p className="text-sm">Add programs manually or upload an Excel file</p>
              {/* Fixed debug info for empty state */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 text-xs text-gray-400 space-y-1">
                  <div>Debug: settings={settings ? 'exists' : 'null'}</div>
                  <div>programs={settings?.programs ? `array(${settings.programs.length})` : 'undefined'}</div>
                  <div>Raw programs: {JSON.stringify(settings?.programs)}</div>
                </div>
              )}
            </div>
          ) : (
            settings.programs.map((program) => (
              <div key={program.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                {editingProgram?.id === program.id ? (
                  // Edit Form - Inline editing
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-blue-800 mb-3">
                      ✏️ Editing Program: {program.program}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Program Name *
                        </label>
                        <input
                          type="text"
                          value={editFormData.program}
                          onChange={(e) => setEditFormData({...editFormData, program: e.target.value})}
                          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g. Bachelor of Science in Computer Science"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Faculty *
                        </label>
                        <input
                          type="text"
                          value={editFormData.faculty}
                          onChange={(e) => setEditFormData({...editFormData, faculty: e.target.value})}
                          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g. Faculty of Science and Technology"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration *
                        </label>
                        <input
                          type="text"
                          value={editFormData.duration}
                          onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g. 4 Years"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode - Normal program display with ALL fields
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        📚 {program.program}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="inline-flex items-center mr-4">
                          <span className="font-medium">Faculty:</span>
                          <span className="ml-1">{program.faculty}</span>
                        </span>
                        <span className="inline-flex items-center mr-4">
                          <span className="font-medium">Duration:</span>
                          <span className="ml-1">{program.duration}</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          program.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {program.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleProgram(program.id)}
                        className={`p-1 rounded transition-colors ${
                          program.is_active ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={program.is_active ? 'Deactivate program' : 'Activate program'}
                        disabled={editingProgram !== null}
                      >
                        {program.is_active ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => handleEditProgram(program)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit program"
                        disabled={editingProgram !== null}
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProgram(program.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete program"
                        disabled={editingProgram !== null}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Show editing notice */}
        {editingProgram && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-blue-800 text-sm">
                <strong>Note:</strong> Other actions are disabled while editing "{editingProgram.program}". Save or cancel your changes to continue.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
