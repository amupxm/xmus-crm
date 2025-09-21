import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { About } from '../components/About';
import { Admin } from '../components/Admin';
import { AdminPermissions } from '../components/AdminPermissions';
import { AdminRoles } from '../components/AdminRoles';
import { AdminSettings } from '../components/AdminSettings';
import { AdminUsers } from '../components/AdminUsers';
import { Analytics } from '../components/Analytics';
import { Customers } from '../components/Customers';
import { Home } from '../components/Home';
import { Leaves } from '../components/Leaves';
import { Login } from '../components/Login';
import { MenuDebug } from '../components/MenuDebug';
import { Notifications } from '../components/Notifications';
import { Projects } from '../components/Projects';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Reports } from '../components/Reports';
import { Sales } from '../components/Sales';
import { Settings } from '../components/Settings';
import { Teams } from '../components/Teams';
import { Layout } from '../layout';
import { RouteConfig } from '../types';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: Home,
    layout: 'dashboard',
    title: 'Home - XMUS CRM',
    protected: true
  },
  {
    path: '/about',
    element: About,
    layout: 'default',
    title: 'About - XMUS CRM',
    protected: true
  },
  {
    path: '/customers',
    element: Customers,
    layout: 'dashboard',
    title: 'Customers - XMUS CRM',
    protected: true
  },
  {
    path: '/sales',
    element: Sales,
    layout: 'dashboard',
    title: 'Sales - XMUS CRM',
    protected: true
  },
  {
    path: '/projects',
    element: Projects,
    layout: 'dashboard',
    title: 'Projects - XMUS CRM',
    protected: true
  },
  {
    path: '/analytics',
    element: Analytics,
    layout: 'dashboard',
    title: 'Analytics - XMUS CRM',
    protected: true
  },
  {
    path: '/admin',
    element: Admin,
    layout: 'dashboard',
    title: 'Administration - XMUS CRM',
    protected: true
  },
  {
    path: '/admin/users',
    element: AdminUsers,
    layout: 'dashboard',
    title: 'User Management - XMUS CRM',
    protected: true
  },
  {
    path: '/admin/roles',
    element: AdminRoles,
    layout: 'dashboard',
    title: 'Role Management - XMUS CRM',
    protected: true
  },
  {
    path: '/admin/permissions',
    element: AdminPermissions,
    layout: 'dashboard',
    title: 'Permissions - XMUS CRM',
    protected: true
  },
  {
    path: '/admin/settings',
    element: AdminSettings,
    layout: 'dashboard',
    title: 'System Settings - XMUS CRM',
    protected: true
  },
  {
    path: '/reports',
    element: Reports,
    layout: 'dashboard',
    title: 'Reports - XMUS CRM',
    protected: true
  },
  {
    path: '/teams',
    element: Teams,
    layout: 'dashboard',
    title: 'Teams - XMUS CRM',
    protected: true
  },
  {
    path: '/leaves',
    element: Leaves,
    layout: 'dashboard',
    title: 'Leave Management - XMUS CRM',
    protected: true
  },
  {
    path: '/notifications',
    element: Notifications,
    layout: 'dashboard',
    title: 'Notifications - XMUS CRM',
    protected: true
  },
  {
    path: '/settings',
    element: Settings,
    layout: 'dashboard',
    title: 'Settings - XMUS CRM',
    protected: true
  },
  {
    path: '/debug',
    element: MenuDebug,
    layout: 'dashboard',
    title: 'Menu Debug - XMUS CRM',
    protected: true
  },
  {
    path: '/login',
    element: Login,
    layout: 'minimal',
    title: 'Login - XMUS CRM',
    protected: false
  }
];

// Router component
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {routes.map((route) => {
        const element = route.protected ? (
          <ProtectedRoute>
            <Layout layoutType={route.layout || 'default'}>
              <route.element />
            </Layout>
          </ProtectedRoute>
        ) : (
          <Layout layoutType={route.layout || 'default'}>
            <route.element />
          </Layout>
        );

        return (
          <Route
            key={route.path}
            path={route.path}
            element={element}
          />
        );
      })}
    </Routes>
  );
};
