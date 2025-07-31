import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Save, Eye, MapPin, Star, DollarSign, X, PenTool } from 'lucide-react';
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

const BASE_URL = 'https://gigslk-backend-production.up.railway.app'; // Define your base URL

// Helper function to check if a URL is a blob URL (for newly selected files)
const isBlobUrl = (url: string): boolean => url.startsWith('blob:');

// Helper function to get the relative path from a full backend URL
const getRelativePath = (url: string | null): string | null => {
  if (url && url.startsWith(BASE_URL)) {
    return url.replace(BASE_URL, '');
  }
  return url; // If it's not a full backend URL, return as is (e.g., /uploads/...)
};


const ArtistManagement: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<PerformerProfile | null>(null);
  const [formData, setFormData] = useState<PerformerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for actual File objects for new uploads
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);


  // Function to fetch performer profile from backend
  const fetchPerformerProfile = async () => {
    if (!user || !token) {
      setErrorMessage("Authentication token or user data missing.");
      setLocalLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/performers/profile`, {
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
      const fetchedProfile: PerformerProfile = {
        ...data.profile,
        full_name: data.profile.full_name || user?.username || '',
        location: data.profile.location || 'Not Set',
        performance_type: data.profile.performance_type || 'Not Set',
        bio: data.profile.bio || 'Tell us about your talent and experience!',
        price: data.profile.price || 'Rs. 0 - Rs. 0',
        skills: data.profile.skills || [],
        contact_number: data.profile.contact_number || 'Not Set',
        rating: data.profile.rating || 0,
        review_count: data.profile.review_count || 0,
        profile_picture_url: data.profile.profile_picture_url
            ? `${BASE_URL}${data.profile.profile_picture_url}`
            : null, // If backend sends null or no path, keep it null
        gallery_images: Array.isArray(data.profile.gallery_images) // Ensure it's an array
            ? data.profile.gallery_images.map((url: string) =>
                url.startsWith('/uploads/') ? `${BASE_URL}${url}` : url
            )
            : [], // Default to empty array if not an array
      };

      setProfile(fetchedProfile);
      setFormData(fetchedProfile);

      // IMPORTANT: Clear file inputs and temporary URLs when fresh data is fetched
      setProfilePictureFile(null);
      setGalleryImageFiles([]);

      setLocalLoading(false);
    } catch (error: any) {
      console.error('Error fetching performer profile:', error);
      setErrorMessage(error.message || 'An error occurred while fetching your profile.');
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'performer') {
        navigate('/signin');
        return;
      }
      fetchPerformerProfile();
    }
  }, [isAuthenticated, user, authLoading, navigate, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;

    setFormData(prev => (prev ? {
      ...prev,
      [name]: target.type === 'checkbox' ? target.checked : value
    } : null));
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

    const dataToSend = new FormData();

    // Append all regular fields
    Object.keys(formData).forEach((key) => {
      // Exclude special fields handled separately
      if (key !== 'profile_picture_url' && key !== 'gallery_images' && key !== 'id' && key !== 'user_id' && key !== 'rating' && key !== 'review_count') {
        if (Array.isArray(formData[key])) {
          dataToSend.append(key, JSON.stringify(formData[key]));
        } else if (typeof formData[key] === 'boolean') {
          dataToSend.append(key, formData[key] ? '1' : '0'); // Convert boolean to '1' or '0'
        } else if (formData[key] !== null && formData[key] !== undefined) {
          dataToSend.append(key, String(formData[key])); // Ensure all values are strings
        } else {
          dataToSend.append(key, ''); // Send empty string for null/undefined fields
        }
      }
    });

    // --- Profile Picture Handling ---
    if (profilePictureFile) {
      // If a new file was selected, append the file itself
      dataToSend.append('profile_picture', profilePictureFile);
      console.log('Frontend: Appending NEW profile_picture file.');
    } else if (formData.profile_picture_url && !isBlobUrl(formData.profile_picture_url)) {
      // If no new file, but there's an existing (non-blob) URL, send its relative path
      dataToSend.append('profile_picture_url', getRelativePath(formData.profile_picture_url) || '');
      console.log('Frontend: Appending EXISTING profile_picture_url string:', getRelativePath(formData.profile_picture_url));
    } else {
      // If no new file and no existing URL (e.g., cleared or never set), send empty string
      dataToSend.append('profile_picture_url', '');
      console.log('Frontend: Appending EMPTY profile_picture_url string.');
    }


    // --- Gallery Images Handling ---
    // 1. Append new gallery files (File objects)
    galleryImageFiles.forEach((file) => {
      dataToSend.append('new_gallery_images', file); // Multer expects 'new_gallery_images'
      console.log('Frontend: Appending new_gallery_images file:', file.name);
    });

    // 2. Append existing gallery image URLs (already saved in DB) as a JSON string
    const existingPersistentGalleryUrls = formData.gallery_images
        .filter(url => !isBlobUrl(url)) // Filter out temporary blob URLs for new, unsaved files
        .map(url => getRelativePath(url)); // Convert full URLs to relative paths for backend
    dataToSend.append('existing_gallery_images', JSON.stringify(existingPersistentGalleryUrls));
    console.log('Frontend: Appending existing_gallery_images JSON:', JSON.stringify(existingPersistentGalleryUrls));


    try {
      const response = await fetch(`${BASE_URL}/api/performers/profile`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
          // 'Content-Type': 'multipart/form-data' is automatically set by browser for FormData
        },
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save performer profile.');
      }

      const data = await response.json();
      // Re-fetch profile after successful save to get updated persistent URLs (critical for gallery)
      await fetchPerformerProfile();

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
    // Clear any temporary image states
    setProfilePictureFile(null);
    setGalleryImageFiles([]);
    setIsEditing(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSwitchToHostMode = () => {
    navigate('/signin'); // Or navigate to a specific host dashboard if it exists
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && formData) {
      const file = e.target.files[0];
      setProfilePictureFile(file); // Store the actual file object
      // Update formData's profile_picture_url for instant preview with blob URL
      setFormData(prev => prev ? { ...prev, profile_picture_url: URL.createObjectURL(file) } : null);
    } else if (formData) {
      // If file input is cleared, reset the file and URL
      setProfilePictureFile(null);
      setFormData(prev => prev ? { ...prev, profile_picture_url: profile?.profile_picture_url || null } : null);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && formData) {
      const files = Array.from(e.target.files);
      setGalleryImageFiles(prev => [...prev, ...files]); // Add new file objects to state

      // Create blob URLs for immediate preview and add them to formData.gallery_images
      const newBlobUrls = files.map(file => URL.createObjectURL(file));
      setFormData(prev => prev ? { ...prev, gallery_images: [...prev.gallery_images, ...newBlobUrls] } : null);

      e.target.value = ''; // Clear input so same file can be selected again
    }
  };

  const handleRemoveGalleryImage = (imageUrlToRemove: string) => {
    if (!formData) return;

    // Remove from formData.gallery_images (which holds all URLs for display)
    const updatedGalleryUrls = formData.gallery_images.filter(url => url !== imageUrlToRemove);
    setFormData(prev => prev ? { ...prev, gallery_images: updatedGalleryUrls } : null);

    // If it was a temporary blob URL, also remove the corresponding file and revoke object URL
    if (isBlobUrl(imageUrlToRemove)) {
      const fileIndex = galleryImageFiles.findIndex(file => URL.createObjectURL(file) === imageUrlToRemove);
      if (fileIndex > -1) {
        const newFiles = [...galleryImageFiles];
        newFiles.splice(fileIndex, 1);
        setGalleryImageFiles(newFiles);
      }
      URL.revokeObjectURL(imageUrlToRemove); // Revoke the blob URL to free memory
    }
    // If it's a persistent URL, it's removed from formData.gallery_images, and that's sufficient;
    // it will be excluded from existing_gallery_images sent to backend.
  };

  if (authLoading || localLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading profile...</div>;
  }

  if (!isAuthenticated || user?.role !== 'performer') {
    return null; // Or show a redirecting message
  }

  if (!profile || !formData) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Error: Profile data missing.</div>;
  }

  // Determine which URL to display for profile picture: new temp URL, or existing profile URL
  const displayProfilePictureUrl = formData.profile_picture_url || 'https://placehold.co/150x150/553c9a/ffffff?text=Profile';

  // Combine persistent and temporary gallery image URLs for display
  const displayGalleryImageUrls = formData.gallery_images; // formData.gallery_images now contains both persistent and temporary blob URLs


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
                          {/* Optional: Add a clear button for profile picture */}
                          {formData.profile_picture_url && (
                              <button
                                  type="button"
                                  onClick={() => {
                                    setProfilePictureFile(null);
                                    setFormData(prev => prev ? { ...prev, profile_picture_url: null } : null);
                                  }}
                                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4" />
                                <span>Clear</span>
                              </button>
                          )}
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
                                <button type="button" onClick={() => handleSkillRemove(skill)} className="ml-1 text-purple-300 hover:text-white">
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
                    <p className="text-gray-400 mb-4">Upload images to showcase your talent!</p>
                    {isEditing && (
                        <>
                          <input
                              type="file"
                              id="galleryImageUpload"
                              name="new_gallery_images" // Matches backend's Multer field name
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
                                      type="button"
                                      onClick={() => handleRemoveGalleryImage(imageUrl)}
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
                      // Only show "No gallery images" if not editing or no images exist
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
                              type="button"
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
          </div>

          {/* Action Buttons (Edit/Save/Cancel) */}
          <div className="mt-8 flex justify-end space-x-4">
            {isEditing ? (
                <>
                  <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50"
                      disabled={localLoading} // Use localLoading as it indicates saving process
                  >
                    <Save className="h-5 w-5" />
                    <span>{localLoading ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  <PenTool className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default ArtistManagement;