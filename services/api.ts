// Define API_BASE_URL directly to avoid import issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500';

// Helper function to get auth token safely
const getAuthToken = (): string => {
  try {
    return localStorage.getItem('token') || '';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return '';
  }
};

// University management API functions - CRUD operations only
export const universityApi = {
  // Create a new university
  create: async (universityData: any) => {
    try {
      console.log('🏛️ Creating university via API:', universityData);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(universityData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'University creation failed');
      }

      console.log('✅ University created successfully:', data.data);
      return data;
      
    } catch (error) {
      console.error('❌ University creation API error:', error);
      throw error;
    }
  },

  // Get all universities (Read)
  getAll: async (params?: { page?: number; limit?: number; country?: string; search?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.country) queryParams.append('country', params.country);
      if (params?.search) queryParams.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/api/admin/universities?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch universities');
      }

      return data;
      
    } catch (error) {
      console.error('❌ Universities fetch API error:', error);
      throw error;
    }
  },

  // Get university by ID (Read single)
  getById: async (universityId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/universities/${universityId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch university');
      }

      return data;
      
    } catch (error) {
      console.error('❌ University fetch API error:', error);
      throw error;
    }
  },

  // Update university
  update: async (universityId: string, updateData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/universities/${universityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'University update failed');
      }

      return data;
      
    } catch (error) {
      console.error('❌ University update API error:', error);
      throw error;
    }
  },

  // Delete university
  delete: async (universityId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/universities/${universityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'University deletion failed');
      }

      return data;
      
    } catch (error) {
      console.error('❌ University deletion API error:', error);
      throw error;
    }
  },

  // Get universities for dropdown (active only)
  getForDropdown: async () => {
    try {
      console.log('🎓 Fetching universities for dropdown...');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/universities-dropdown`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch universities');
      }

      console.log('✅ Universities dropdown data:', data.data?.length || 0, 'universities');
      return data;
      
    } catch (error) {
      console.error('❌ Universities dropdown API error:', error);
      throw error;
    }
  }
};

// Export the API_BASE_URL for use in other files
export { API_BASE_URL };