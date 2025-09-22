import {
    CreateRoleRequest,
    ErrorResponse,
    RoleListResponse,
    RoleResponse,
    UpdateRoleRequest
} from '../types';
import api from './apiConfig';

export class RolesApi {
  private baseUrl = '/roles';

  /**
   * Get all roles with pagination
   */
  async getRoles(page: number = 1, limit: number = 10): Promise<RoleListResponse> {
    try {
      const response = await api.get<RoleListResponse>(this.baseUrl, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific role by ID
   */
  async getRole(id: number): Promise<RoleResponse> {
    try {
      const response = await api.get<RoleResponse>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleRequest): Promise<RoleResponse> {
    try {
      const response = await api.post<RoleResponse>(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(id: number, data: UpdateRoleRequest): Promise<RoleResponse> {
    try {
      const response = await api.put<RoleResponse>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any): Error {
    if (error.response?.data) {
      const errorData = error.response.data as ErrorResponse;
      return new Error(errorData.message || 'An error occurred');
    }
    return new Error(error.message || 'Network error occurred');
  }
}

// Export a singleton instance
export const rolesApi = new RolesApi();
export default rolesApi;
