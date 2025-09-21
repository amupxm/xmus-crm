import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        About XMUS CRM
      </h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-4">
          XMUS CRM is a modern, TypeScript-based customer relationship management system 
          built with React and Tailwind CSS. It provides a comprehensive solution for 
          managing customer relationships, sales pipelines, and business analytics.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Features</h2>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
          <li>Modern React with TypeScript for type safety</li>
          <li>React Router for seamless navigation</li>
          <li>Tailwind CSS for beautiful, responsive design</li>
          <li>Component-based architecture for maintainability</li>
          <li>Responsive design that works on all devices</li>
        </ul>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-3 rounded text-center">
            <div className="font-semibold text-blue-800">React</div>
            <div className="text-sm text-blue-600">Frontend Framework</div>
          </div>
          <div className="bg-blue-100 p-3 rounded text-center">
            <div className="font-semibold text-blue-800">TypeScript</div>
            <div className="text-sm text-blue-600">Type Safety</div>
          </div>
          <div className="bg-blue-100 p-3 rounded text-center">
            <div className="font-semibold text-blue-800">Tailwind</div>
            <div className="text-sm text-blue-600">Styling</div>
          </div>
          <div className="bg-blue-100 p-3 rounded text-center">
            <div className="font-semibold text-blue-800">React Router</div>
            <div className="text-sm text-blue-600">Navigation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
