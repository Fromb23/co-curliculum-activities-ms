import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLock } from 'react-icons/fi';

const Unauthorized = () => {
  const navigate = useNavigate();




  const user = JSON.parse(localStorage.getItem("user")) || {};

  const goBack = () => {
    const role = user.role?.toLowerCase();

    if (role === "admin") {
      navigate("/dashboard");
    } else if (role === "trainer") {
      navigate("/trainer-dashboard");
    } else if (role === "student") {
      navigate("/student-dashboard");
    } else {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-4">
          <FiLock className="text-red-500 text-5xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={goBack}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Go Back
          </button>
          <button
            onClick={() => {
              navigate('/');
              localStorage.clear();
            }

            }
            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
