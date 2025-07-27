import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Music, User, Users, Mail, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import authService from '../services/authService'; // Import your authService

const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Initialize useNavigate hook
  const initialRole = searchParams.get('role') as 'performer' | 'host' || 'performer';

  const [selectedRole, setSelectedRole] = useState<'performer' | 'host'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for form data, updated to match backend expectations (username instead of fullName)
  const [formData, setFormData] = useState({
    username: '', 
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  });

  // State for messages and loading
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null); // Clear previous messages
    setErrorMessage(null);
    setIsLoading(true); // Set loading state

    const { username, email, password, confirmPassword, location } = formData;

    // Frontend validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!username || !email || !password || !location) {
        setErrorMessage('Please fill in all fields.');
        setIsLoading(false);
        return;
    }

    try {
      // Call the register function from your authService
      const response = await authService.register(email, password, username, selectedRole);
      setSuccessMessage(response.message || 'Registration successful!');
      setFormData({ // Clear form after successful registration
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: ''
      });
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/signin'); // Redirect to sign-in page after registration
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred during registration.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const locations = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Trincomalee', 'Matara', 'Ratnapura'];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden py-8 font-inter"> {/* Added font-inter */}
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Register Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
              <Music className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join Gigs.lk</h1>
            <p className="text-gray-400">Discover your music talent</p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-300 mb-4 text-center">I want to register as:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('performer')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'performer'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-600 bg-slate-700/30 text-gray-400 hover:border-purple-500/50'
                }`}
              >
                <User className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Performer</div>
                <div className="text-xs text-gray-500 mt-1">Book events</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('host')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'host'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-600 bg-slate-700/30 text-gray-400 hover:border-purple-500/50'
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Host Artist</div>
                <div className="text-xs text-gray-500 mt-1">Host events</div>
              </button>
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="bg-green-500/20 text-green-300 p-3 rounded-lg mb-4 text-center">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">
              {errorMessage}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username (formerly Full Name) */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Select your location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading} // Disable button when loading
            >
              {isLoading ? 'Registering...' : 'Create Account'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Already have an account? <Link to="/signin" className="text-purple-400 hover:text-purple-300">Sign in</Link>
          </p>
        </div>

        {/* Bottom Links */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-600">© 2024 Gigs.lk. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
