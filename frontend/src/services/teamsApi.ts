import {
    CreateTeamRequest,
    ErrorResponse,
    TeamListResponse,
    TeamMembersResponse,
    TeamResponse,
    UpdateTeamRequest
} from '../types';
import api from './apiConfig';

export class TeamsApi {
  private baseUrl = '/teams';

  /**
   * Get all teams with pagination
   */
  async getTeams(page: number = 1, limit: number = 10): Promise<TeamListResponse> {
    try {
      const response = await api.get<TeamListResponse>(this.baseUrl, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific team by ID
   */
  async getTeam(id: number): Promise<TeamResponse> {
    try {
      const response = await api.get<TeamResponse>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new team
   */
  async createTeam(data: CreateTeamRequest): Promise<TeamResponse> {
    try {
      const response = await api.post<TeamResponse>(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing team
   */
  async updateTeam(id: number, data: UpdateTeamRequest): Promise<TeamResponse> {
    try {
      const response = await api.put<TeamResponse>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a team
   */
  async deleteTeam(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: number): Promise<TeamMembersResponse> {
    try {
      const response = await api.get<TeamMembersResponse>(`${this.baseUrl}/${teamId}/members`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Add a member to a team
   */
  async addTeamMember(teamId: number, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(`${this.baseUrl}/${teamId}/members`, {
        user_id: userId
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove a member from a team
   */
  async removeTeamMember(teamId: number, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${teamId}/members/${userId}`);
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
export const teamsApi = new TeamsApi();
export default teamsApi;
