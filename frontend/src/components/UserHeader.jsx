import React, { useState } from "react";
import {
  FiMenu,
  FiBell,
  FiMessageSquare,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiHome,
  FiCalendar,
  FiBook,
  FiAward,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const UserHeader = ({ messages }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get user data from localStorage
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : { fullName: "Guest", role: "guest" };

  const isTrainer = user.role.toLowerCase() === "trainer";
  const isStudent = user.role.toLowerCase() === "student";

  const avatar = "https://cdn-icons-png.flaticon.com/512/7915/7915522.png";
  const lastName = user?.fullName?.split(" ")?.slice(-1)[0] || "";

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Navigation items for trainers
  const trainerNavItems = [
    { to: "/trainer-dashboard", icon: <FiHome />, text: "Dashboard" },
    { to: "/schedule", icon: <FiCalendar />, text: "Schedule" },
    { to: "/students", icon: <FiUser />, text: "Students" },
    { to: "/reports", icon: <FiBook />, text: "Reports" },
  ];

  // Navigation items for students
  const studentNavItems = [
    { to: "/student-dashboard", icon: <FiHome />, text: "Dashboard" },
    { to: "/schedule", icon: <FiCalendar />, text: "My Schedule" },
    { to: "/my-trainers", icon: <FiUser />, text: "My Trainers" },
    { to: "/achievements", icon: <FiAward />, text: "Achievements" },
  ];

  const navItems = isTrainer ? trainerNavItems : studentNavItems;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FiMenu className="h-6 w-6" />
            </button>

            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={isTrainer ? "/trainer-dashboard" : "/student-dashboard"}
                className="flex items-center"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  {isTrainer ? "TR" : "ST"}
                </div>
                <span className="ml-2 text-xl font-bold text-gray-800 hidden sm:block">
                  {isTrainer ? "Trainer Portal" : "Student Portal"}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  activeClassName="border-blue-500 text-gray-900"
                >
                  {item.text}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right section - Profile and notifications */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-4">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative">
                <FiBell className="h-6 w-6" />
                {(messages ?? []).some(msg => !msg.read) && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* Messages icon - only for students */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative">
                <FiMessageSquare className="h-6 w-6" />
                {(messages ?? []).filter(msg => !msg.read).length > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-5 px-1 text-xs font-bold text-white bg-blue-500 rounded-full flex items-center justify-center">
                    {(messages ?? []).filter(msg => !msg.read).length}
                  </span>
                )}
              </button>


              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={avatar}
                        alt={user.fullName}
                      />
                      <div className="ml-2 hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-700">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                      <FiChevronDown
                        className={`ml-1 text-gray-400 transition-transform duration-200 ${isProfileOpen ? "transform rotate-180" : ""
                          }`}
                      />
                    </div>
                  </button>
                </div>

                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        {lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate capitalize">
                        {user.role}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiUser className="mr-2" /> Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiSettings className="mr-2" /> Settings
                    </Link>
                    <Link
                      to="#"
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                    >
                      <FiLogOut className="mr-2" /> Sign out
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                activeClassName="bg-blue-50 border-blue-500 text-blue-700"
              >
                <span className="flex items-center">
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </span>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={avatar}
                  alt={user.fullName}
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user.fullName}
                </div>
                <div className="text-sm font-medium text-gray-500 capitalize">
                  {user.role}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <FiUser className="mr-2" /> Your Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <FiSettings className="mr-2" /> Settings
              </Link>
              <Link
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <FiLogOut className="mr-2" /> Sign out
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default UserHeader;
