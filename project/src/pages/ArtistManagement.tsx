import React, { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { Camera, Upload, Save, Eye, MapPin, Star, DollarSign,  X, PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


// Define the shape of the performer profile data received from backend/stored locally
interface PerformerProfile {
  id?: number;
  user_id: number;
  full_name: string;
  stage_name: string;
  location: string;
  performance_type: string;
  bio: string;
  price: string; // This will be price_display from backend
  skills: string[];
  profile_picture_url: string | null; // Can be null, will store persistent URL
  contact_number: string;
  direct_booking: boolean;
  travel_distance: number;
  availability_weekdays: boolean;
  availability_weekends: boolean;
  availability_morning: boolean;
  availability_evening: boolean;
  gallery_images: string[]; // Will store persistent URLs
  rating: number;
  review_count: number;
}

const ArtistManagement: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, token } = useAuth(); // Get token from AuthContext
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PerformerProfile | null>(null);
  const [formData, setFormData] = useState<PerformerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true); // For initial data fetch
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New state for actual File objects for upload
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  // State to hold temporary blob URLs for newly selected images (before saving)
  const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState<string | null>(null);
  const [tempGalleryImageUrls, setTempGalleryImageUrls] = useState<string[]>([]);


  // Function to fetch performer profile from backend
  const fetchPerformerProfile = async () => {
    if (!user || !token) {
      setErrorMessage("Authentication token or user data missing.");
      setLocalLoading(false);
      return;
    }

    try {
      const response = await fetch('https://gigslk-backend-production.up.railway.app/api/performers/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch performer profile.');
      }

      const data = await response.json();
      // Initialize profile and formData, handling potential nulls from backend
      const fetchedProfile: PerformerProfile = {
        ...data.profile,
        full_name: data.profile.full_name || user?.username || '', // Fallback to username or empty
        location: data.profile.location || 'Not Set', // Default if null
        performance_type: data.profile.performance_type || 'Not Set', 
        bio: data.profile.bio || 'Tell us about your talent and experience!', 
        price: data.profile.price || 'Rs. 0 - Rs. 0',
        skills: data.profile.skills || [], // Ensure it's an array
        contact_number: data.profile.contact_number || 'Not Set', // Default if null
        rating: data.profile.rating || 0, // Ensure rating is number
        review_count: data.profile.review_count || 0, // Ensure review_count is number
        // NEW: Handle profile picture URL to ensure it's a full URL for display
        profile_picture_url: data.profile.profile_picture_url
            ? `https://gigslk-backend-production.up.railway.app${data.profile.profile_picture_url}`
            : 'https://placehold.co/150x150/553c9a/ffffff?text=Profile',
        // NEW: Handle gallery images to ensure they are full URLs for display
        gallery_images: data.profile.gallery_images
            ? (data.profile.gallery_images as string[]).map(url =>
                url.startsWith('/uploads/') ? `https://gigslk-backend-production.up.railway.app${url}` : url
              )
            : [],
      };

      setProfile(fetchedProfile);
      setFormData(fetchedProfile); // Initialize form data with fetched profile

      // Clear temporary URLs and file objects when fetching fresh data
      setTempProfilePictureUrl(null);
      setTempGalleryImageUrls([]);
      setProfilePictureFile(null);
      setGalleryImageFiles([]);

      setLocalLoading(false);
    }
    catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error fetching performer profile:', error);
      setErrorMessage(errorMessage || 'An error occurred while fetching your profile.');
      setLocalLoading(false);
    }
  };

  // Effect to handle redirection and initial profile loading
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'performer') {
        navigate('/signin');
        return;
      }

      if (isAuthenticated && user?.role === 'performer') {
        fetchPerformerProfile(); // Fetch profile from backend
      }
    }
  }, [isAuthenticated, user, authLoading, navigate, token]); // Add token to dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;

    if (target.type === 'checkbox') {
      setFormData(prev => (prev ? { ...prev, [name]: target.checked } : null));
    } else {
      setFormData(prev => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData) {
      const newSkill = e.currentTarget.value.trim();
      if (newSkill && !formData.skills.includes(newSkill)) {
        setFormData(prev => (prev ? { ...prev, skills: [...prev.skills, newSkill] } : null));
        e.currentTarget.value = '';
      }
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    if (formData) {
      setFormData(prev => (prev ? { ...prev, skills: prev.skills.filter(s => s !== skillToRemove) } : null));
    }
  };

  const handleSave = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!formData || !user || !token) {
      setErrorMessage("No data to save or user not authenticated.");
      return;
    }

    // Create FormData object to send text fields and files
    const dataToSend = new FormData();

  
    // Ensure that fields which can be null are converted to empty strings if null
    dataToSend.append('full_name', formData.full_name || '');
    dataToSend.append('stage_name', formData.stage_name || '');
    dataToSend.append('location', formData.location || '');
    dataToSend.append('performance_type', formData.performance_type || '');
    dataToSend.append('bio', formData.bio || '');
    dataToSend.append('price', formData.price || '');
    dataToSend.append('contact_number', formData.contact_number || '');

    // Handle boolean values
    dataToSend.append('direct_booking', formData.direct_booking ? '1' : '0');
    dataToSend.append('travel_distance', String(formData.travel_distance));
    dataToSend.append('availability_weekdays', formData.availability_weekdays ? '1' : '0');
    dataToSend.append('availability_weekends', formData.availability_weekends ? '1' : '0');
    dataToSend.append('availability_morning', formData.availability_morning ? '1' : '0');
    dataToSend.append('availability_evening', formData.availability_evening ? '1' : '0');

    // Append skills and existing gallery images (persistent ones) as JSON strings
    dataToSend.append('skills', JSON.stringify(formData.skills));
    // Filter out any temporary blob URLs from formData.gallery_images before sending
    const persistentGalleryImages = formData.gallery_images.filter(url => !url.startsWith('blob:'));
    dataToSend.append('gallery_images', JSON.stringify(persistentGalleryImages));


    // Append image files if they exist
    if (profilePictureFile) {
      dataToSend.append('profile_picture', profilePictureFile);
      // Don't include profile_picture_url when sending an actual file
    } else if (formData.profile_picture_url && !formData.profile_picture_url.includes('placehold.co')) {
      // Only send the URL if it's not a placeholder
      const urlToAppend = formData.profile_picture_url.startsWith('https://gigslk-backend-production.up.railway.app')
          ? formData.profile_picture_url.replace('https://gigslk-backend-production.up.railway.app', '')
          : formData.profile_picture_url;
      dataToSend.append('profile_picture_url', urlToAppend);
    }
    console.log('Frontend: formData.profile_picture_url BEFORE sending:', formData.profile_picture_url);
    console.log('Frontend: formData.gallery_images BEFORE sending:', formData.gallery_images);

    if (profilePictureFile && profilePictureFile.size > 5 * 1024 * 1024) {
      setErrorMessage("Profile picture must be less than 5MB");
      return;
    }

// For gallery images:
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    for (const file of galleryImageFiles) {
      if (file.size > maxFileSize) {
        setErrorMessage("Gallery images must be less than 5MB each");
        return;
      }
    }
    // Append each gallery image file
    galleryImageFiles.forEach((file) => {
      dataToSend.append(`gallery_images`, file); // Multer expects same name for multiple files
    });

    try {
      const response = await fetch('https://gigslk-backend-production.up.railway.app/api/performers/profile', {
        method: 'PUT', // Use PUT for updating
        headers: {
          'x-auth-token': token, // Send the JWT token (Content-Type is handled by FormData)
        },
        body: dataToSend, // Send FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save performer profile.');
      }

      const data = await response.json();
      // Re-fetch profile after successful save to get updated persistent URLs
      await fetchPerformerProfile(); // This will update profile and formData states

      setIsEditing(false);
      setSuccessMessage(data.message || 'Profile saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving performer profile:', error);
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

  const handleSwitchToHostMode = () => {
    navigate('/signin');
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && formData) {
      const file = e.target.files[0];
      setProfilePictureFile(file); // Store the actual file object
      setTempProfilePictureUrl(URL.createObjectURL(file)); // Create temp URL for preview
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && formData) {
      const files = Array.from(e.target.files);
      setGalleryImageFiles(prev => [...prev, ...files]); // Store actual file objects
      const newTempUrls = files.map(file => URL.createObjectURL(file));
      setTempGalleryImageUrls(prev => [...prev, ...newTempUrls]); // Store temp URLs for preview
      e.target.value = ''; // Clear input so same file can be selected again
    }
  };

  const handleRemoveGalleryImage = (imageUrlToRemove: string, isTempUrl: boolean) => {
    if (isTempUrl) {
      // If it's a temporary blob URL, remove from temp state and revoke URL
      setTempGalleryImageUrls(prev => prev.filter(url => url !== imageUrlToRemove));
      // Find the corresponding file and remove it from galleryImageFiles
      const fileToRemove = galleryImageFiles.find(file => URL.createObjectURL(file) === imageUrlToRemove);
      if (fileToRemove) {
          setGalleryImageFiles(prev => prev.filter(file => URL.createObjectURL(file) !== imageUrlToRemove));
      }
      URL.revokeObjectURL(imageUrlToRemove);
    } else {
      // If it's a persistent URL (from DB), remove it from formData.gallery_images
      if (formData) {
        setFormData(prev => (prev ? { ...prev, gallery_images: prev.gallery_images.filter(url => url !== imageUrlToRemove) } : null));
      }
    }
  };


  if (authLoading || localLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading profile...</div>;
  }

  if (!isAuthenticated || user?.role !== 'performer') {
    return null;
  }

  if (!profile || !formData) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Error: Profile data missing.</div>;
  }


  // Determine which URL to display for profile picture
  const displayProfilePictureUrl = tempProfilePictureUrl || profile.profile_picture_url || 'https://placehold.co/150x150/553c9a/ffffff?text=Profile';

  // Combine persistent and temporary gallery image URLs for display
  const displayGalleryImageUrls = [...(formData.gallery_images || []), ...tempGalleryImageUrls];


  return (
    <div className="min-h-screen bg-slate-950 font-inter py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Artist Profile Management</h1>
            <p className="text-gray-400 mt-2">Manage your profile to attract more bookings</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Eye className="h-4 w-4" />
              <span>View Public Profile</span>
            </button>
            {user?.role === 'performer' && (
                <button
                    onClick={handleSwitchToHostMode}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <span>Switch to Host Mode</span>
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
          {/* Profile Details (lg:col-span-3 to make it wider, was lg:col-span-2) */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Details</h2>

              {/* Profile Picture */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <img
                    src={displayProfilePictureUrl} // Use the determined URL
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                  />
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="profilePictureUpload"
                        name="profile_picture" // Name for multer
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-white">{profile.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stage Name (Optional)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="stage_name"
                      value={formData.stage_name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-white">{profile.stage_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-white flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-500"/>{profile.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Performance Type</label>
                  {isEditing ? (
                    <select
                      name="performance_type"
                      value={formData.performance_type}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option>Singer</option>
                      <option>Musician</option>
                      <option>DJ</option>
                      <option>Band</option>
                      <option>Other</option>
                    </select>
                  ) : (
                    <p className="text-lg text-white">{profile.performance_type}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills/Tags</label>
                {isEditing ? (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills.map((skill, index) => (
                        <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center">
                          {skill}
                          <button onClick={() => handleSkillRemove(skill)} className="ml-1 text-purple-300 hover:text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      onKeyPress={handleSkillAdd}
                      placeholder="Add a skill and press Enter"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No skills added yet.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Pricing (LKR)</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., Rs. 15,000/Event or Rs. 15,000 - Rs. 25,000"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-white flex items-center"><DollarSign className="h-4 w-4 mr-2 text-gray-500"/>{profile.price}</p>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio / Description</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell potential clients about your experience, style, and what makes you unique..."
                  />
                ) : (
                  <p className="text-lg text-white leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Media Gallery & Preferences (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Media Gallery */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Media Gallery</h3>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Drag & drop videos or audio files to upload</p>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="galleryImageUpload"
                        name="gallery_images" // Name for multer
                        accept="image/*"
                        multiple // Allow multiple file selection
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
                {/* Display uploaded images */}
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

              {/* Gig Preferences */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Gig Preferences</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Accept Direct Booking</span>
                    {isEditing ? (
                      <button
                        onClick={() => setFormData(prev => (prev ? { ...prev, direct_booking: !prev.direct_booking } : null))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          formData?.direct_booking ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            formData?.direct_booking ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.direct_booking ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {profile.direct_booking ? 'Yes' : 'No'}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Travel Distance (km)</label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="200"
                          name="travel_distance"
                          value={formData.travel_distance}
                          onChange={handleInputChange}
                          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>0 km</span>
                          <span className="font-medium text-purple-400">{formData.travel_distance} km</span>
                          <span>200 km</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-white flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-500"/>{profile.travel_distance} km</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Preferred Availability</label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <label className="flex items-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            name="availability_weekdays"
                            checked={formData.availability_weekdays}
                            onChange={handleInputChange}
                            className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                          />
                        ) : (
                          <span className={`mr-2 ${profile.availability_weekdays ? 'text-green-400' : 'text-gray-600'}`}>
                            {profile.availability_weekdays ? '✓' : '✗'}
                          </span>
                        )}
                        <span className="text-gray-300">Weekdays</span>
                      </label>
                      <label className="flex items-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            name="availability_weekends"
                            checked={formData.availability_weekends}
                            onChange={handleInputChange}
                            className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                          />
                        ) : (
                          <span className={`mr-2 ${profile.availability_weekends ? 'text-green-400' : 'text-gray-600'}`}>
                            {profile.availability_weekends ? '✓' : '✗'}
                          </span>
                        )}
                        <span className="text-gray-300">Weekends</span>
                      </label>
                      <label className="flex items-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            name="availability_morning"
                            checked={formData.availability_morning}
                            onChange={handleInputChange}
                            className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                          />
                        ) : (
                          <span className={`mr-2 ${profile.availability_morning ? 'text-green-400' : 'text-gray-600'}`}>
                            {profile.availability_morning ? '✓' : '✗'}
                          </span>
                        )}
                        <span className="text-gray-300">Morning</span>
                      </label>
                      <label className="flex items-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            name="availability_evening"
                            checked={formData.availability_evening}
                            onChange={handleInputChange}
                            className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                          />
                        ) : (
                          <span className={`mr-2 ${profile.availability_evening ? 'text-green-400' : 'text-gray-600'}`}>
                            {profile.availability_evening ? '✓' : '✗'}
                          </span>
                        )}
                        <span className="text-gray-300">Evening</span>
                      </label>
                    </div>
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
                    <PenTool className="h-5 w-5" />
                    <span>Edit Profile</span>
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistManagement;
