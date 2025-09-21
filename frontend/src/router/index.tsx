import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { About } from '../components/About';
import { Home } from '../components/Home';
import { Login } from '../components/Login';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from '../layout';
import { RouteConfig } from '../types';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: Home,
    layout: 'default',
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
