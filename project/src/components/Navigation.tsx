import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronDown, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const Navigation = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth(); // Get auth state and logout function from context

  const isActive = (path: string) => location.pathname === path;

  // Function to handle logout
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    setShowUserMenu(false); // Close the user menu
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50 font-inter"> {/* Added font-inter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg"> {/* Updated logo styling */}
              <Music className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Gigs.lk</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
            >
              Home
            </Link>
            <Link
              to="/artists"
              className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/artists') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
            >
              Artists
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/about') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
            >
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? ( // Conditionally render based on authentication status
              <>
                {}
                <Link
                  to="/signin"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Join Us
                </Link>
              </>
            ) : (
              // Show user menu/profile when authenticated
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onBlur={() => setTimeout(() => setShowUserMenu(false), 150)} // Close when focus is lost
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <User className="h-6 w-6" />
                  <span className="text-sm font-medium">{user?.username || user?.email || 'Profile'}</span> {/* Display username or email */}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
                    {user?.role === 'performer' && (
                      <Link
                        to="/artist-management"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Artist Profile Management
                      </Link>
                    )}
                    {user?.role === 'host' && (
                      <Link
                        to="/host-dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Host Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && ( // Assuming an admin role
                      <Link
                        to="/admin-dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-slate-700 my-2"></div> {/* Separator */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
