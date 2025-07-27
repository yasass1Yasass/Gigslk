import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Upload, Save, Eye, MapPin, UserRound, Phone, Briefcase, CalendarCheck, MessageSquare, Edit3, X, DollarSign, List, Bell, Mail, MessageSquareText, Star } from 'lucide-react'; // Ensure Star is imported
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

// Define the shape of the host profile data based on your XAMPP hosts table
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
  events_hosted: number;
  average_rating: number;
  total_reviews: number;
}

const HostManagement: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [formData, setFormData] = useState<HostProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState<string | null>(null);
  const [tempGalleryImageUrls, setTempGalleryImageUrls] = useState<string[]>([]);

  // Static lists for selections
  const eventTypes = ['Weddings', 'Corporate Events', 'Birthdays', 'Concerts', 'Festivals', 'Private Parties', 'Other'];
  const performerTypes = ['Singer', 'Musician', 'DJ', 'Band', 'Dancer', 'Magician', 'Comedian', 'Other'];
  const locations = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Trincomalee', 'Matara', 'Ratnapura', 'Not Set'];


  // Function to fetch host profile from backend
  const fetchHostProfile = async () => {
    console.log('HostManagement: Attempting to fetch host profile...');
    if (!user || !token) {
      console.log('HostManagement: User or token missing for fetch.');
      setErrorMessage("Authentication token or user data missing.");
      setLocalLoading(false);
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
        console.error('HostManagement: Failed to fetch profile, response not OK:', errorData);
        throw new Error(errorData.message || 'Failed to fetch host profile.');
      }

      const data = await response.json();
      console.log('HostManagement: Raw data received from backend:', data); // Log raw data

      let fetchedProfile: HostProfile;

      // If data.profile is null (meaning no profile exists for this user_id)
      if (!data.profile) {
        console.log('HostManagement: No existing profile found, initializing with defaults.');
        fetchedProfile = {
          user_id: user.id, // Must set user_id
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
        setIsEditing(true); // Automatically enable editing if profile is new
        setErrorMessage('No existing profile found. Please fill out your details and save.');
      } else {
        // If a profile exists, format it
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
          
          // Ensure profile_picture_url is a full URL for frontend display
          profile_picture_url: data.profile.profile_picture_url
              ? (typeof data.profile.profile_picture_url === 'string' && data.profile.profile_picture_url.startsWith('http')) // Check if it's already a full URL
                  ? data.profile.profile_picture_url
                  : `http://localhost:5000${data.profile.profile_picture_url}`
              : 'https://placehold.co/150x150/553c9a/ffffff?text=Host',
          // Ensure gallery_images are full URLs for frontend display
          gallery_images: Array.isArray(data.profile.gallery_images)
              ? data.profile.gallery_images.map((url: string) =>
                  (typeof url === 'string' && url.startsWith('http'))
                      ? url
                      : `http://localhost:5000${url}`
                ).filter(Boolean) // Filter out any null/undefined entries
              : [],
          events_hosted: data.profile.events_hosted || 0,
          average_rating: parseFloat(data.profile.average_rating) || 0, // Explicitly parse to float
          total_reviews: data.profile.total_reviews || 0,
        };
        setIsEditing(false); // Not editing by default if profile exists
      }

      setProfile(fetchedProfile);
      setFormData(fetchedProfile);

      setTempProfilePictureUrl(null);
      setTempGalleryImageUrls([]);
      setProfilePictureFile(null);
      setGalleryImageFiles([]);

      setLocalLoading(false);
      console.log('HostManagement: Profile fetched and states set successfully.');
    } catch (error: any) {
      console.error('HostManagement: Error fetching host profile:', error);
      setErrorMessage(error.message || 'An error occurred while fetching your profile.');
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    console.log('HostManagement: useEffect triggered. authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'user role:', user?.role);
    if (!authLoading) {
      // Corrected role check: Ensure user is a 'host'
      if (!isAuthenticated || user?.role !== 'host') {
        console.log('HostManagement: Redirecting to signin due to auth status or role mismatch.');
        navigate('/signin');
        return;
      }

      if (isAuthenticated && user?.role === 'host') {
        console.log('HostManagement: User is authenticated and a host, fetching profile.');
        fetchHostProfile();
      }
    }
  }, [isAuthenticated, user, authLoading, navigate, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      setFormData(prev => (prev ? { ...prev, [name]: checked } : null));
    } else if (type === 'number') {
        setFormData(prev => (prev ? { ...prev, [name]: parseFloat(value) } : null));
    }
    else {
      setFormData(prev => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleArrayFieldChange = (fieldName: keyof HostProfile, value: string, isChecked: boolean) => {
    setFormData(prev => {
      if (!prev) return null;
      const currentArray = prev[fieldName] as string[];
      if (isChecked) {
        return { ...prev, [fieldName]: [...currentArray, value] };
      } else {
        return { ...prev, [fieldName]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleSave = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!formData || !user || !token) {
      setErrorMessage("No data to save or user not authenticated.");
      return;
    }

    const dataToSend = new FormData();

    dataToSend.append('company_organization', formData.company_organization || '');
    dataToSend.append('contact_person', formData.contact_person || '');
    dataToSend.append('contact_number', formData.contact_number || '');
    dataToSend.append('location', formData.location || '');
    dataToSend.append('bio', formData.bio || '');

    // Stringify array fields
    dataToSend.append('event_types_typically_hosted', JSON.stringify(formData.event_types_typically_hosted));
    dataToSend.append('preferred_performer_types', JSON.stringify(formData.preferred_performer_types));
    dataToSend.append('preferred_locations_for_gigs', JSON.stringify(formData.preferred_locations_for_gigs));

    // Append number fields
    dataToSend.append('default_budget_range_min', String(formData.default_budget_range_min));
    dataToSend.append('default_budget_range_max', String(formData.default_budget_range_max));

    // Convert booleans to 0 or 1
    dataToSend.append('urgent_booking_enabled', formData.urgent_booking_enabled ? '1' : '0');
    dataToSend.append('email_notifications_enabled', formData.email_notifications_enabled ? '1' : '0');
    dataToSend.append('sms_notifications_enabled', formData.sms_notifications_enabled ? '1' : '0');

    // Handle profile picture
    if (profilePictureFile) {
      dataToSend.append('profile_picture', profilePictureFile);
    } else {
      const currentProfilePicUrl = formData.profile_picture_url;
      let urlToAppend = '';
      if (currentProfilePicUrl && currentProfilePicUrl.startsWith('http://localhost:5000/uploads/')) {
        urlToAppend = currentProfilePicUrl.replace('http://localhost:5000', '');
      } else if (currentProfilePicUrl && currentProfilePicUrl.startsWith('https://placehold.co/')) {
          urlToAppend = ''; 
      } else if (currentProfilePicUrl) {
        urlToAppend = currentProfilePicUrl; 
      }
      dataToSend.append('profile_picture_url', urlToAppend);
    }

    // Handle gallery images (existing ones as JSON string, new ones as files)
    const persistentGalleryImages = formData.gallery_images.filter(url => !url.startsWith('blob:'));
    dataToSend.append('gallery_images', JSON.stringify(persistentGalleryImages));

    galleryImageFiles.forEach((file) => {
      dataToSend.append(`gallery_images`, file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/hosts/profile', {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save host profile.');
      }

      const data = await response.json();
      await fetchHostProfile();
      setIsEditing(false);
      setSuccessMessage(data.message || 'Profile saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving host profile:', error);
      setErrorMessage(error.message || 'An error occurred while saving your profile.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleCancelEdit = () => {
    setFormData(profile); // Revert to last saved profile
    // Revert temporary image states
    setProfilePictureFile(null);
    setTempProfilePictureUrl(null);
    setGalleryImageFiles([]);
    setTempGalleryImageUrls([]);
    setIsEditing(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSwitchToArtistMode = () => {
    navigate('/signin');
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && formData) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      setTempProfilePictureUrl(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && formData) {
      const files = Array.from(e.target.files);
      setGalleryImageFiles(prev => [...prev, ...files]);
      const newTempUrls = files.map(file => URL.createObjectURL(file));
      setTempGalleryImageUrls(prev => [...prev, ...newTempUrls]);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (imageUrlToRemove: string, isTempUrl: boolean) => {
    if (isTempUrl) {
      setTempGalleryImageUrls(prev => prev.filter(url => url !== imageUrlToRemove));
      const fileToRemove = galleryImageFiles.find(file => URL.createObjectURL(file) === imageUrlToRemove);
      if (fileToRemove) {
          URL.revokeObjectURL(imageUrlToRemove); // Revoke the object URL
          setGalleryImageFiles(prev => prev.filter(file => URL.createObjectURL(file) !== imageUrlToRemove));
      }
    } else {
      if (formData) {
        setFormData(prev => (prev ? { ...prev, gallery_images: prev.gallery_images.filter(url => url !== imageUrlToRemove) } : null));
      }
    }
  };


  console.log('HostManagement: Rendering. authLoading:', authLoading, 'localLoading:', localLoading);
  console.log('HostManagement: isAuthenticated:', isAuthenticated, 'user role:', user?.role);
  console.log('HostManagement: Current Profile State (before render check):', profile);
  console.log('HostManagement: Current FormData State (before render check):', formData);


  if (authLoading || localLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading host profile...</div>;
  }

  // Check if user is NOT authenticated OR user role is NOT 'host'
  if (!isAuthenticated || user?.role !== 'host') {
    console.log('HostManagement: Not authenticated or not a host. Returning null.');
    return null;
  }

 
  // If there's an error message or profile is null, prompt user to create profile
  if (errorMessage || !profile || !formData) {
    console.log('HostManagement: Displaying error or create profile prompt.');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-red-400 p-4">
        <h2 className="text-2xl font-bold mb-4">Error Loading Host Profile</h2>
        <p className="text-lg mb-6 text-center">{errorMessage || 'Host profile data is missing or could not be loaded. Please create or update your profile.'}</p>
        <button
          onClick={() => {
            setIsEditing(true); // Force editing mode to allow creation
            setErrorMessage(null); // Clear error message
            // If profile is null, re-initialize formData with defaults for new creation
            if (!profile && user) {
                setFormData({
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
                });
            }
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {profile ? 'Try Editing Again' : 'Create Your Profile'}
        </button>
      </div>
    );
  }

  // Define renderStars inside the component to ensure Star is in scope
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
          }`}
      />
    ));
  };

  const displayProfilePictureUrl = tempProfilePictureUrl || profile.profile_picture_url || 'https://placehold.co/150x150/553c9a/ffffff?text=Host';
  const displayGalleryImageUrls = [...(formData.gallery_images || []), ...tempGalleryImageUrls];

  return (
    <div className="min-h-screen bg-slate-950 font-inter py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Host Profile Management</h1>
            <p className="text-gray-400 mt-2">Manage your organization's profile and events</p>
          </div>
          <div className="flex space-x-3">
            {user?.role === 'host' && (
                <button
                    onClick={handleSwitchToArtistMode}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <span>Switch to Artist Mode</span>
                </button>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Details (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Organization Details</h2>

              {/* Profile Picture */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Organization Logo / Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <img
                    src={displayProfilePictureUrl}
                    alt="Host Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                  />
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="profilePictureUpload"
                        name="profile_picture"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profilePictureUpload"
                        className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload New</span>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company / Organization Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company_organization"
                      value={formData.company_organization}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-white flex items-center"><Briefcase className="h-4 w-4 mr-2 text-gray-500"/>{profile.company_organization}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Person</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-white flex items-center"><UserRound className="h-4 w-4 mr-2 text-gray-500"/>{profile.contact_person}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-white flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-500"/>{profile.contact_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  {isEditing ? (
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg text-white flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-500"/>{profile.location}</p>
                  )}
                </div>
              </div>

              {/* New fields from DB schema */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Types Typically Hosted</label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map(type => (
                      <label key={type} className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-slate-600/50">
                        <input
                          type="checkbox"
                          checked={formData.event_types_typically_hosted.includes(type)}
                          onChange={(e) => handleArrayFieldChange('event_types_typically_hosted', type, e.target.checked)}
                          className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.event_types_typically_hosted.length > 0 ? (
                      profile.event_types_typically_hosted.map((type, index) => (
                        <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                          {type}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Not specified.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Budget Range (Min)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="default_budget_range_min"
                      value={formData.default_budget_range_min}
                      onChange={handleInputChange}
                      placeholder="e.g., 10000"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-white flex items-center"><DollarSign className="h-4 w-4 mr-2 text-gray-500"/>Rs. {profile.default_budget_range_min}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Budget Range (Max)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="default_budget_range_max"
                      value={formData.default_budget_range_max}
                      onChange={handleInputChange}
                      placeholder="e.g., 50000"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-white flex items-center"><DollarSign className="h-4 w-4 mr-2 text-gray-500"/>Rs. {profile.default_budget_range_max}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Performer Types</label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {performerTypes.map(type => (
                      <label key={type} className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-slate-600/50">
                        <input
                          type="checkbox"
                          checked={formData.preferred_performer_types.includes(type)}
                          onChange={(e) => handleArrayFieldChange('preferred_performer_types', type, e.target.checked)}
                          className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_performer_types.length > 0 ? (
                      profile.preferred_performer_types.map((type, index) => (
                        <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                          {type}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Not specified.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Locations for Gigs</label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {locations.map(loc => (
                      <label key={loc} className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-slate-600/50">
                        <input
                          type="checkbox"
                          checked={formData.preferred_locations_for_gigs.includes(loc)}
                          onChange={(e) => handleArrayFieldChange('preferred_locations_for_gigs', loc, e.target.checked)}
                          className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                        />
                        {loc}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_locations_for_gigs.length > 0 ? (
                      profile.preferred_locations_for_gigs.map((loc, index) => (
                        <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                          {loc}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Not specified.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio / About Your Organization</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell potential artists about your organization, types of events you host, and your experience..."
                  />
                ) : (
                  <p className="text-lg text-white leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Media Gallery & Notifications (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Media Gallery */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Event Gallery</h3>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Drag & drop videos or audio files to upload</p>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="galleryImageUpload"
                        name="gallery_images"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="galleryImageUpload"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                      >
                        Choose Files
                      </label>
                    </>
                  )}
                </div>
                {displayGalleryImageUrls.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {displayGalleryImageUrls.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveGalleryImage(imageUrl, imageUrl.startsWith('blob:'))}
                            className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                    !isEditing && <p className="text-gray-500 text-sm mt-4">No gallery images uploaded yet.</p>
                )}
              </div>

              {/* Notification Settings */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center"><Bell className="h-4 w-4 mr-2"/> Urgent Booking Notifications</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="urgent_booking_enabled"
                        checked={formData.urgent_booking_enabled}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.urgent_booking_enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {profile.urgent_booking_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center"><Mail className="h-4 w-4 mr-2"/> Email Notifications</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="email_notifications_enabled"
                        checked={formData.email_notifications_enabled}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.email_notifications_enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {profile.email_notifications_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center"><MessageSquareText className="h-4 w-4 mr-2"/> SMS Notifications</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="sms_notifications_enabled"
                        checked={formData.sms_notifications_enabled}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.sms_notifications_enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {profile.sms_notifications_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Host Stats */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Host Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <CalendarCheck className="h-5 w-5 mr-3 text-purple-400" />
                    <span>Events Hosted: <span className="font-semibold text-white">{profile.events_hosted}</span></span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Star className="h-5 w-5 mr-3 text-yellow-400 fill-current" />
                    <span>Average Rating: <span className="font-semibold text-white">{profile.average_rating.toFixed(1)}</span></span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MessageSquare className="h-5 w-5 mr-3 text-blue-400" />
                    <span>Total Reviews: <span className="font-semibold text-white">{profile.total_reviews}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="lg:col-span-4 flex justify-end space-x-4 mt-8">
            {isEditing && (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </button>
              </>
            )}
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    <Edit3 className="h-5 w-5" />
                    <span>Edit Profile</span>
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostManagement;
