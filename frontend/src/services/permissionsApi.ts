import {
    CreatePermissionRequest,
    ErrorResponse,
    PermissionListResponse,
    PermissionResponse,
    UpdatePermissionRequest
} from '../types';
import api from './apiConfig';

export class PermissionsApi {
  private baseUrl = '/permissions';

  /**
   * Get all permissions with pagination
   */
  async getPermissions(page: number = 1, limit: number = 10): Promise<PermissionListResponse> {
    try {
      const response = await api.get<PermissionListResponse>(this.baseUrl, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific permission by ID
   */
  async getPermission(id: number): Promise<PermissionResponse> {
    try {
      const response = await api.get<PermissionResponse>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new permission
   */
  async createPermission(data: CreatePermissionRequest): Promise<PermissionResponse> {
    try {
      const response = await api.post<PermissionResponse>(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing permission
   */
  async updatePermission(id: number, data: UpdatePermissionRequest): Promise<PermissionResponse> {
    try {
      const response = await api.put<PermissionResponse>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a permission
   */
  async deletePermission(id: number): Promise<{ success: boolean; message: string }> {
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
export const permissionsApi = new PermissionsApi();
export default permissionsApi;
