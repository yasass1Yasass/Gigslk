import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Star, Calendar, Package, Search, Edit, Trash2, Ban, Plus, TrendingUp, LogOut, Settings, Bell, Music, Briefcase, FileText, CheckCircle, XCircle, Mail, Lock, UserRound } from 'lucide-react';

// Define a User interface for the data fetched in AdminDashboard
interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'host' | 'performer' | 'admin';
  status: 'Active' | 'Inactive' | 'Pending'; // Assuming a status field
  avatar?: string; // Optional avatar URL
}

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // State for active tab
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminErrorMessage, setAdminErrorMessage] = useState<string | null>(null);

  // State for user management
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'performer' as 'performer' | 'host' | 'admin', // Default role
  });
  const [userManagementLoading, setUserManagementLoading] = useState(false);
  const [userManagementMessage, setUserManagementMessage] = useState<string | null>(null);

  // User's provided mock data for demonstration (will be replaced by fetched data)
  const stats = [
    { label: 'Total Users', value: '2,547', icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
    { label: 'Active Performers', value: '1,342', icon: Star, color: 'text-green-400', bgColor: 'bg-green-400/20' },
    { label: 'Event Hosts', value: '856', icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-400/20' },
    { label: 'Monthly Bookings', value: '429', icon: Package, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
    { id: 'users', label: 'Manage Users', icon: Users },
    // Removed 'performers' and 'hosts' from sidebar
    { id: 'reports', label: 'Reports / Logs', icon: Package }
  ];

  // Function to fetch all users
  const fetchAllUsers = async () => {
    setUserManagementLoading(true);
    setUserManagementMessage(null);
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', { // NEW ADMIN USERS ENDPOINT
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '', // Send admin token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users.');
      }

      const data = await response.json();
      setAllUsers(data.users); // Assuming backend sends { users: [...] }
      setUserManagementMessage('Users fetched successfully.');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setUserManagementMessage(error.message || 'Failed to load users.');
    } finally {
      setUserManagementLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        navigate('/signin');
        return;
      }
      setAdminLoading(false);

      // Fetch users when the 'users' tab is active
      if (activeTab === 'users') {
        fetchAllUsers();
      }
    }
  }, [isAuthenticated, user, authLoading, navigate, activeTab, token]); // Added activeTab and token to dependencies

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // Handlers for Add User Modal
  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserManagementLoading(true);
    setUserManagementMessage(null);

    // Basic frontend validation for new user
    if (!newUserData.username || !newUserData.email || !newUserData.password || !newUserData.role) {
      setUserManagementMessage('Please fill all fields for the new user.');
      setUserManagementLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/users', { // NEW ADMIN ADD USER ENDPOINT
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user.');
      }

      const data = await response.json();
      setUserManagementMessage(data.message || 'User added successfully!');
      setShowAddUserModal(false);
      setNewUserData({ username: '', email: '', password: '', role: 'performer' }); // Reset form
      fetchAllUsers(); // Refresh the user list
    } catch (error: any) {
      console.error('Error adding user:', error);
      setUserManagementMessage(error.message || 'An error occurred while adding the user.');
    } finally {
      setUserManagementLoading(false);
    }
  };

  // Placeholder functions for user actions
  const handleEditUser = (user: AdminUser) => {
    alert(`Edit user: ${user.username}`);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm(`Are you sure you want to delete user ID: ${userId}? This action cannot be undone.`)) {
      setUserManagementLoading(true);
      setUserManagementMessage(null);
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, { // NEW ADMIN DELETE USER ENDPOINT
          method: 'DELETE',
          headers: {
            'x-auth-token': token || '',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete user.');
        }

        const data = await response.json();
        setUserManagementMessage(data.message || 'User deleted successfully!');
        fetchAllUsers(); // Refresh the user list
      } catch (error: any) {
        console.error('Error deleting user:', error);
        setUserManagementMessage(error.message || 'An error occurred while deleting the user.');
      } finally {
        setUserManagementLoading(false);
      }
    }
  };

  const handleBanUser = (user: AdminUser) => {
    alert(`Ban user: ${user.username}`);
    // Implement ban logic here (e.g., update user status in DB)
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-red-400 p-4">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg mb-6 text-center">You do not have administrative privileges to access this page.</p>
        <button
          onClick={() => navigate('/signin')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex font-inter">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-purple-600 p-2 rounded-lg">
              <span className="text-white font-bold">GL</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white">Gigs.lk</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-600/20 border-l-4 border-purple-600 text-purple-400'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'users' && 'Manage Users'}
              {}
              {activeTab === 'reports' && 'Reports / Logs'}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {user?.username ? user.username.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'AD')}
                </div>
                <div>
                  <p className="text-white font-medium">{user?.username || user?.email || 'Admin'}</p>
                  <p className="text-gray-400 text-sm">Administrator</p>
                </div>
              </div>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-600 pl-4">
                    <p className="text-white font-medium">New performer registered</p>
                    <p className="text-gray-400 text-sm">Sarah Silva joined as a wedding singer - 2 hours ago</p>
                  </div>
                  <div className="border-l-4 border-green-600 pl-4">
                    <p className="text-white font-medium">Booking completed</p>
                    <p className="text-400 text-sm">Corporate event booking successfully completed - 4 hours ago</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4">
                    <p className="text-white font-medium">New host verified</p>
                    <p className="text-gray-400 text-sm">Elite Events Co. profile verified and activated - 6 hours ago</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              {/* Search and Add User */}
              <div className="flex justify-between items-center mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New User</span>
                </button>
              </div>

              {/* User Management Messages */}
              {userManagementLoading && (
                <div className="bg-blue-500/20 text-blue-300 p-3 rounded-lg mb-4 text-center">
                  Loading...
                </div>
              )}
              {userManagementMessage && (
                <div className={`p-3 rounded-lg mb-4 text-center ${userManagementMessage.includes('successfully') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {userManagementMessage}
                </div>
              )}

              {/* Users Table */}
              <div className="bg-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {allUsers.length > 0 ? (
                        allUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-700/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={user.avatar || `https://placehold.co/40x40/553c9a/ffffff?text=${user.username.charAt(0).toUpperCase()}`}
                                  alt={user.username}
                                  className="w-8 h-8 rounded-full object-cover mr-3"
                                />
                                <span className="text-white font-medium">{user.username}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'performer' 
                                  ? 'bg-purple-600/20 text-purple-400' 
                                  : user.role === 'host'
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'bg-gray-600/20 text-gray-400' // For admin role
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'Active' 
                                  ? 'bg-green-600/20 text-green-400' 
                                  : user.status === 'Inactive'
                                    ? 'bg-red-600/20 text-red-400'
                                    : 'bg-yellow-600/20 text-yellow-400' // For Pending or other statuses
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Edit User"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleBanUser(user)}
                                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                  title="Ban User"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {}
          {activeTab === 'reports' && (
            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Package className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Reports & Analytics
                </h3>
                <p className="text-gray-400">
                  This section is under development. Advanced management features will be available soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Add New User</h2>
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={newUserData.username}
                    onChange={handleNewUserInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={newUserData.email}
                    onChange={handleNewUserInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={newUserData.password}
                    onChange={handleNewUserInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="role"
                    id="role"
                    value={newUserData.role}
                    onChange={handleNewUserInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="performer">Performer</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={userManagementLoading}
              >
                {userManagementLoading ? 'Adding User...' : 'Add User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
