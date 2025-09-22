import {
    CreateUserRequest,
    ErrorResponse,
    UpdateUserRequest,
    UserListResponse,
    UserResponse
} from '../types';
import api from './apiConfig';

export class UsersApi {
  private baseUrl = '/users';

  /**
   * Get all users with pagination
   */
  async getUsers(page: number = 1, limit: number = 100): Promise<UserListResponse> {
    try {
      const response = await api.get<UserListResponse>(this.baseUrl, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific user by ID
   */
  async getUser(id: number): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user information
   */
  async getMe(): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>(`${this.baseUrl}/get_me`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    try {
      const response = await api.post<UserResponse>(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a user
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse> {
    try {
      const response = await api.put<UserResponse>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
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
export const usersApi = new UsersApi();
export default usersApi;
