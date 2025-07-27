import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, UserRound, Phone, MapPin, CalendarCheck, Star, MessageCircle, Edit3, PlusCircle, Search, Filter, Bell, User, Settings, LogOut, Mail, DollarSign } from 'lucide-react'; // Added Mail and DollarSign
import { useAuth } from '../contexts/AuthContext';

// Define the HostProfile interface (should match HostManagement.tsx and backend)
interface HostProfile {
  id?: number;
  user_id: number;
  company_organization: string;
  contact_person: string;
  contact_number: string;
  location: string;
  event_types_typically_hosted: string[]; // Stored as JSON string in DB
  bio: string;
  default_budget_range_min: number; // Stored as DECIMAL in DB
  default_budget_range_max: number; // Stored as DECIMAL in DB
  preferred_performer_types: string[]; // Stored as JSON string in DB
  preferred_locations_for_gigs: string[]; // Stored as JSON string in DB
  urgent_booking_enabled: boolean; // Stored as TINYINT(1) in DB
  email_notifications_enabled: boolean; // Stored as TINYINT(1) in DB
  sms_notifications_enabled: boolean; // Stored as TINYINT(1) in DB
  profile_picture_url: string | null;
  gallery_images: string[]; // Stored as JSON string in DB
  // These are not directly from the DB table, but derived/calculated for display
  events_hosted: number;
  average_rating: number;
  total_reviews: number;
}

const HostDashboard: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [hostLoading, setHostLoading] = useState(true);
  const [hostErrorMessage, setHostErrorMessage] = useState<string | null>(null);

  // Static data for Available Artists (kept as per your request)
  const availableArtists = [
    {
      id: '1',
      name: 'Sarah Williams',
      category: 'Pop Singer',
      rating: 5,
      price: 'Rs. 15,000/Event',
      image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      category: 'Jazz Guitarist',
      rating: 5,
      price: 'Rs. 12,000/Event',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'
    },
    {
      id: '3',
      name: 'Emma Davis',
      category: 'Classical Violinist',
      rating: 5,
      price: 'Rs. 20,000/Event',
      image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'
    }
  ];

  // Static data for Recent Bookings (kept as per your request)
  const recentBookings = [
    {
      id: '1',
      artist: 'Lisa Chen',
      type: 'Wedding Singer',
      date: 'March 15, 2024',
      status: 'Completed',
      amount: 'Rs. 18,000',
      image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      id: '2',
      artist: 'David Kumar',
      type: 'Photographer',
      date: 'March 12, 2024',
      status: 'Upcoming',
      amount: 'Rs. 25,000',
      image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      id: '3',
      artist: 'Alex Fernando',
      type: 'DJ',
      date: 'March 8, 2024',
      status: 'Completed',
      amount: 'Rs. 22,000',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    }
  ];

  // Function to fetch host profile from backend
  const fetchHostProfile = async () => {
    if (!user || !token) {
      setHostErrorMessage("Authentication token or user data missing.");
      setHostLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/hosts/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch host profile.');
      }

      const data = await response.json();
      let fetchedProfile: HostProfile;

      if (!data.profile) {
        fetchedProfile = {
          user_id: user.id,
          company_organization: user.username || '',
          contact_person: '',
          contact_number: '',
          location: 'Not Set',
          event_types_typically_hosted: [],
          bio: '',
          default_budget_range_min: 0,
          default_budget_range_max: 0,
          preferred_performer_types: [],
          preferred_locations_for_gigs: [],
          urgent_booking_enabled: false,
          email_notifications_enabled: false,
          sms_notifications_enabled: false,
          profile_picture_url: 'https://placehold.co/150x150/553c9a/ffffff?text=Host',
          gallery_images: [],
          events_hosted: 0,
          average_rating: 0,
          total_reviews: 0,
        };
        setHostErrorMessage('No existing profile found. Please fill out your details and save via Host Management.');
      } else {
        fetchedProfile = {
          ...data.profile,
          company_organization: data.profile.company_organization || user?.username || '',
          contact_person: data.profile.contact_person || '',
          contact_number: data.profile.contact_number || '',
          location: data.profile.location || 'Not Set',
          event_types_typically_hosted: data.profile.event_types_typically_hosted || [],
          bio: data.profile.bio || '',
          default_budget_range_min: data.profile.default_budget_range_min !== null ? parseFloat(data.profile.default_budget_range_min) : 0,
          default_budget_range_max: data.profile.default_budget_range_max !== null ? parseFloat(data.profile.default_budget_range_max) : 0,
          preferred_performer_types: data.profile.preferred_performer_types || [],
          preferred_locations_for_gigs: data.profile.preferred_locations_for_gigs || [],
          urgent_booking_enabled: data.profile.urgent_booking_enabled === 1,
          email_notifications_enabled: data.profile.email_notifications_enabled === 1,
          sms_notifications_enabled: data.profile.sms_notifications_enabled === 1,
          profile_picture_url: data.profile.profile_picture_url
              ? `http://localhost:5000${data.profile.profile_picture_url}`
              : 'https://placehold.co/150x150/553c9a/ffffff?text=Host',
          gallery_images: data.profile.gallery_images
              ? (data.profile.gallery_images as string[]).map(url =>
                  url.startsWith('/uploads/') ? `http://localhost:5000${url}` : url
                )
              : [],
          events_hosted: data.profile.events_hosted || 0,
          average_rating: parseFloat(data.profile.average_rating || 0), // Ensure rating is a float, default to 0
          total_reviews: data.profile.total_reviews || 0,
        };
      }
      setHostProfile(fetchedProfile);
      setHostLoading(false);
    } catch (error: any) {
      console.error('Error fetching host profile:', error);
      setHostErrorMessage(error.message || 'An error occurred while fetching your profile.');
      setHostLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'host') {
        navigate('/signin'); // Redirect if not authenticated or not a host
        return;
      }
      fetchHostProfile();
      // Removed fetchAllArtists() here
    }
  }, [isAuthenticated, user, authLoading, navigate, token]);

  if (authLoading || hostLoading) { 
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading dashboard...</div>;
  }

  if (!isAuthenticated || user?.role !== 'host') {
    return null;
  }

  if (hostErrorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-red-400 p-4">
        <h2 className="text-2xl font-bold mb-4">Error Loading Host Profile</h2>
        <p className="text-lg mb-6 text-center">{hostErrorMessage}</p>
        <button
          onClick={() => navigate('/host-management')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go to Host Management to Create/Edit Profile
        </button>
      </div>
    );
  }

  if (!hostProfile) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">No host profile data available.</div>;
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex font-inter">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-purple-600 p-2 rounded-lg">
              <span className="text-white font-bold">GL</span>
            </div>
            <span className="text-xl font-bold text-white">Gigs.lk</span>
          </div>

          <nav className="space-y-2">
            <div className="bg-purple-600/20 border-l-4 border-purple-600 text-purple-400 px-4 py-3 rounded-r-lg flex items-center space-x-3">
              <CalendarCheck className="h-5 w-5" />
              <span>Dashboard</span>
            </div>
            
            <Link
              to="/host-management"
              className="text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Host Management</span>
            </Link>
            
            <a href="#" className="text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
            </a>
            
            {}
            
            <a href="#" className="text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors" onClick={() => { /* Implement logout logic here */ }}>
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Host Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="relative text-gray-400 hover:text-white transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={hostProfile.profile_picture_url || 'https://placehold.co/100x100/553c9a/ffffff?text=Host'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-medium">{hostProfile.company_organization || user?.username}</p>
                  <p className="text-gray-400 text-sm">Event Host</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* My Profile Overview Section */}
          <div className="bg-slate-800 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">My Profile</h2>
              <Link
                to="/host-management"
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
                <span><span className="font-medium">Organization:</span> {hostProfile.company_organization}</span>
              </div>
              <div className="flex items-center">
                <UserRound className="h-5 w-5 mr-2 text-purple-400" />
                <span><span className="font-medium">Contact Person:</span> {hostProfile.contact_person}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-purple-400" />
                <span><span className="font-medium">Contact No:</span> {hostProfile.contact_number}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-purple-400" />
                <span><span className="font-medium">Location:</span> {hostProfile.location}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
                <span><span className="font-medium">Budget Range:</span> Rs. {hostProfile.default_budget_range_min} - Rs. {hostProfile.default_budget_range_max}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-purple-400" />
                <span><span className="font-medium">Email:</span> {user?.email}</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-300 mb-2">Bio:</h4>
              <p className="text-gray-400 text-sm">{hostProfile.bio || 'No bio provided yet.'}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-300 mb-2">Event Types:</h4>
              <div className="flex flex-wrap gap-2">
                {hostProfile.event_types_typically_hosted.length > 0 ? (
                  hostProfile.event_types_typically_hosted.map((type, index) => (
                    <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                      {type}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Not specified.</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-300 mb-2">Preferred Performers:</h4>
              <div className="flex flex-wrap gap-2">
                {hostProfile.preferred_performer_types.length > 0 ? (
                  hostProfile.preferred_performer_types.map((type, index) => (
                    <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                      {type}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Not specified.</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-300 mb-2">Preferred Gig Locations:</h4>
              <div className="flex flex-wrap gap-2">
                {hostProfile.preferred_locations_for_gigs.length > 0 ? (
                  hostProfile.preferred_locations_for_gigs.map((loc, index) => (
                    <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                      {loc}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Not specified.</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center text-gray-300">
              <CalendarCheck className="h-5 w-5 mr-2 text-purple-400" />
              <span>Events Hosted: <span className="font-semibold text-white">{hostProfile.events_hosted}</span></span>
            </div>
            <div className="mt-2 flex items-center text-gray-300">
              <Star className="h-5 w-5 mr-2 text-yellow-400 fill-current" />
              <span>Average Rating: <span className="font-semibold text-white">{hostProfile.average_rating.toFixed(1)}</span></span>
            </div>
            <div className="mt-2 flex items-center text-gray-300">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-400" />
              <span>Total Reviews: <span className="font-semibold text-white">{hostProfile.total_reviews}</span></span>
            </div>
          </div>

          {/* Find Artists Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Find Artists</h2>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search artists, genres, performances..."
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500">
                <option>Performance Type</option>
                <option>Singer</option>
                <option>Musician</option>
                <option>DJ</option>
                <option>Band</option>
                <option>Other</option>
              </select>
              
              <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500">
                <option>Location</option>
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Negombo</option>
                <option>Jaffna</option>
                <option>Trincomalee</option>
                <option>Matara</option>
                <option>Ratnapura</option>
              </select>
              
              <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500">
                <option>Price Range</option>
                <option>Under Rs. 15,000</option>
                <option>Rs. 15,000 - 25,000</option>
                <option>Rs. 25,000+</option>
              </select>
              
              <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500">
                <option>Ratings</option>
                <option>5 Stars</option>
                <option>4+ Stars</option>
                <option>3+ Stars</option>
              </select>
            </div>
          </div>

          {/* Available Artists - Reverted to static data */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Available Artists</h3>
              <p className="text-gray-400 text-sm">{availableArtists.length} artists found</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableArtists.length > 0 ? (
                availableArtists.map((artist) => (
                  <div key={artist.id} className="bg-slate-800 rounded-xl overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-white mb-1">{artist.name}</h4>
                      <p className="text-purple-400 text-sm mb-2">{artist.category}</p>
                      <div className="flex items-center mb-3">
                        {renderStars(artist.rating)}
                        <span className="text-gray-400 text-sm ml-2">(127)</span>
                      </div>
                      <p className="text-gray-300 font-medium mb-3">{artist.price}</p>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center">No artists found.</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
              <button className="text-purple-400 hover:text-purple-300 text-sm">View All Bookings</button>
            </div>
            
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              {recentBookings.map((booking, index) => (
                <div key={booking.id} className={`p-4 flex items-center justify-between ${index !== recentBookings.length - 1 ? 'border-b border-slate-700' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <img
                      src={booking.image}
                      alt={booking.artist}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">{booking.artist} - {booking.type}</p>
                      <p className="text-gray-400 text-sm">{booking.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'Completed' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {booking.status}
                    </span>
                    <p className="text-white font-medium mt-1">{booking.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
