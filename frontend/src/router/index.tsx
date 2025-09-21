import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { About } from '../components/About';
import { Home } from '../components/Home';
import { Layout } from '../layout';
import { RouteConfig } from '../types';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: Home,
    layout: 'default',
    title: 'Home - XMUS CRM'
  },
  {
    path: '/about',
    element: About,
    layout: 'default',
    title: 'About - XMUS CRM'
  }
];

// Router component
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Layout layoutType={route.layout || 'default'}>
              <route.element />
            </Layout>
          }
        />
      ))}
    </Routes>
  );
};
