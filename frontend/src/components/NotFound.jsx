import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiFrown, FiCompass } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-50">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <FiFrown className="text-gray-400 text-6xl" />
          <span className="absolute -top-2 -right-2 text-4xl font-bold text-gray-700">404</span>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiHome className="mr-2" />
          Go to Home
        </Link>
        <Link
          to="/explore"
          className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <FiCompass className="mr-2" />
          Explore Site
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;