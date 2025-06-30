import { API_BASE_URL } from './api';

// Helper function to get auth token safely
const getAuthToken = (): string => {
  try {
    return localStorage.getItem('token') || '';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return '';
  }
};

// TypeScript interfaces for University Admin data
export interface UniversityDropdownItem {
  id: string;
  name: string;
  short_name?: string;
  country: string;
  city: string;
  is_active: boolean;
}

export interface UniversityAdmin {
  admin_id: string;
  user_id: string;
  university_id: string;
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
  phone?: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  admin_created_at: string;
  university_name: string;
  university_short_name?: string;
  university_country: string;
  university_city: string;
}

export interface CreateUniversityAdminData {
  email: string;
  password: string;
  university_id: string;
  first_name: string;
  last_name: string;
  title?: string;
  phone?: string;
  role?: string;
  permissions?: string[];
}

export interface UpdateUniversityAdminData {
  first_name?: string;
  last_name?: string;
  title?: string;
  phone?: string;
  role?: string;
  permissions?: string[];
  is_active?: boolean;
}

export interface UniversityAdminListResponse {
  universityAdmins: UniversityAdmin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// University Admin Service
export const universityAdminService = {
  // Get all university administrators
  async getAll(params?: {
    page?: number;
    limit?: number;
    university_id?: string;
    search?: string;
    is_active?: boolean;
  }): Promise<UniversityAdminListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.university_id) queryParams.append('university_id', params.university_id);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

      const response = await fetch(`${API_BASE_URL}/api/admin/university-admins?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.success) {
        throw new Error(data?.message || 'Failed to fetch university administrators');
      }

      return {
        universityAdmins: data.data?.universityAdmins || [],
        pagination: data.data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
      
    } catch (error) {
      console.error('❌ University admins fetch API error:', error);
      throw error;
    }
  },

  // Get university admin by ID
  async getById(adminId: string): Promise<UniversityAdmin> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/university-admins/${adminId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.success) {
        throw new Error(data?.message || 'Failed to fetch university administrator');
      }

      return data.data;
      
    } catch (error) {
      console.error('❌ University admin fetch API error:', error);
      throw error;
    }
  },

  // Create university administrator
  async create(adminData: CreateUniversityAdminData): Promise<any> {
    try {
      console.log('🎓 Creating university administrator via API:', adminData);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/university-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.success) {
        throw new Error(data?.message || 'University administrator creation failed');
      }

      console.log('✅ University administrator created successfully:', data.data);
      return data;
      
    } catch (error) {
      console.error('❌ University administrator creation API error:', error);
      throw error;
    }
  },

  // Update university administrator
  async update(adminId: string, updateData: UpdateUniversityAdminData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/university-admins/${adminId}`, {
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
      
      if (!data?.success) {
        throw new Error(data?.message || 'University administrator update failed');
      }

      return data;
      
    } catch (error) {
      console.error('❌ University administrator update API error:', error);
      throw error;
    }
  },

  // Delete university administrator
  async delete(adminId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/university-admins/${adminId}`, {
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
      
      if (!data?.success) {
        throw new Error(data?.message || 'University administrator deletion failed');
      }

      return data;
      
    } catch (error) {
      console.error('❌ University administrator deletion API error:', error);
      throw error;
    }
  },

  // Get universities for dropdown
  async getUniversitiesForDropdown(): Promise<UniversityDropdownItem[]> {
    try {
      console.log('🏛️ Fetching universities for dropdown via service...');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/universities-dropdown`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.success) {
        throw new Error(data?.message || 'Failed to fetch universities for dropdown');
      }
      
      console.log('✅ Universities service response:', data.data?.length || 0, 'universities');
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching universities for dropdown:', error);
      throw error;
    }
  }
};
