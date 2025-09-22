import {
    ErrorResponse,
    User
} from '../types';
import api from './apiConfig';

export interface UserListResponse {
  success: boolean;
  message: string;
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

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
