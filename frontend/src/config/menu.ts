import {
    BarChart3,
    Bell,
    Briefcase,
    Building2,
    Calendar,
    Database,
    DollarSign,
    FileText,
    Home,
    Settings,
    Shield,
    UserCheck,
    Users
} from 'lucide-react';

export interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: any;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  children?: MenuItem[];
  order: number;
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/',
    icon: Home,
    order: 1,
  },
  {
    id: 'customers',
    name: 'Customers',
    href: '/customers',
    icon: Users,
    requiredRoles: ['ADMIN', 'MANAGEMENT', 'HR'],
    order: 2,
  },
  {
    id: 'sales',
    name: 'Sales',
    href: '/sales',
    icon: DollarSign,
    requiredRoles: ['ADMIN', 'MANAGEMENT', 'HR'],
    order: 3,
  },
  {
    id: 'projects',
    name: 'Projects',
    href: '/projects',
    icon: Briefcase,
    requiredRoles: ['ADMIN', 'MANAGEMENT', 'TEAM_LEAD'],
    order: 4,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    requiredRoles: ['ADMIN', 'MANAGEMENT'],
    order: 5,
  },
  {
    id: 'reports',
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    requiredRoles: ['ADMIN', 'MANAGEMENT', 'HR'],
    order: 6,
  },
  {
    id: 'teams',
    name: 'Teams',
    href: '/teams',
    icon: Building2,
    requiredRoles: ['ADMIN', 'MANAGEMENT', 'HR', 'TEAM_LEAD'],
    order: 7,
  },
  {
    id: 'leaves',
    name: 'Leave Management',
    href: '/leaves',
    icon: Calendar,
    requiredRoles: ['ADMIN', 'MANAGEMENT', 'HR', 'EMPLOYEE'],
    order: 8,
  },
  {
    id: 'notifications',
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    requiredRoles: ['ADMIN', 'MANAGEMENT', 'HR', 'TEAM_LEAD', 'EMPLOYEE'],
    order: 9,
  },
  {
    id: 'admin',
    name: 'Administration',
    href: '/admin',
    icon: Shield,
    requiredRoles: ['ADMIN'],
    order: 10,
    children: [
      {
        id: 'admin-users',
        name: 'User Management',
        href: '/admin/users',
        icon: UserCheck,
        requiredRoles: ['ADMIN'],
        order: 1,
      },
      {
        id: 'admin-roles',
        name: 'Role Management',
        href: '/admin/roles',
        icon: Shield,
        requiredRoles: ['ADMIN'],
        order: 2,
      },
      {
        id: 'admin-permissions',
        name: 'Permissions',
        href: '/admin/permissions',
        icon: Shield,
        requiredRoles: ['ADMIN'],
        order: 3,
      },
      {
        id: 'admin-settings',
        name: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
        requiredRoles: ['ADMIN'],
        order: 4,
      },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredRoles: ['ADMIN', 'MANAGEMENT', 'HR', 'TEAM_LEAD', 'EMPLOYEE'],
    order: 11,
  },
  {
    id: 'debug',
    name: 'Menu Debug',
    href: '/debug',
    icon: Database,
    requiredRoles: ['ADMIN', 'MANAGEMENT'],
    order: 12,
  },
];

// Helper function to filter menu items based on user roles and permissions
export const filterMenuItems = (
  items: MenuItem[],
  userRoles: string[],
  userPermissions: string[]
): MenuItem[] => {
  return items
    .filter(item => {
      // If no role requirements, show the item
      if (!item.requiredRoles || item.requiredRoles.length === 0) {
        return true;
      }
      
      // Check if user has any of the required roles
      const hasRequiredRole = item.requiredRoles.some(role => 
        userRoles.includes(role)
      );
      
      // Check if user has any of the required permissions
      const hasRequiredPermission = !item.requiredPermissions || 
        item.requiredPermissions.length === 0 ||
        item.requiredPermissions.some(permission => 
          userPermissions.includes(permission)
        );
      
      return hasRequiredRole && hasRequiredPermission;
    })
    .map(item => {
      // Recursively filter children
      if (item.children) {
        return {
          ...item,
          children: filterMenuItems(item.children, userRoles, userPermissions)
        };
      }
      return item;
    })
    .filter(item => {
      // Remove parent items if they have no visible children
      if (item.children) {
        return item.children.length > 0;
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);
};
