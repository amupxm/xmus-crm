export type LayoutType = 'default' | 'minimal' | 'dashboard';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  layout?: LayoutType;
  title?: string;
  protected?: boolean;
}

// User and Authentication Types
export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  salary: number;
  salary_currency: string;
  primary_role_id: number;
  primary_team_id: number;
  roles: Role[];
  teams: Team[];
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface Permission {
  id: number;
  key: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionRequest {
  key: string;
  description: string;
}

export interface UpdatePermissionRequest {
  key?: string;
  description?: string;
}

export interface PermissionResponse {
  success: boolean;
  message: string;
  data: Permission;
}

export interface PermissionListResponse {
  success: boolean;
  message: string;
  data: Permission[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}
