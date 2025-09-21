import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to XMUS CRM
      </h1>
      <p className="text-gray-600 mb-6">
        Your comprehensive customer relationship management solution.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Customers</h3>
          <p className="text-blue-700">Manage your customer relationships effectively</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Sales</h3>
          <p className="text-green-700">Track and manage your sales pipeline</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Analytics</h3>
          <p className="text-purple-700">Get insights into your business performance</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
