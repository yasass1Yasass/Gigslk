import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Save, Eye, MapPin, Star, DollarSign, X, PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Define the base URL to match the backend
const BASE_URL = 'https://gigslk-backend-production.up.railway.app';

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
  const { isAuthenticated, user, isLoading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // Not directly used in the provided snippet but kept
  const [profile, setProfile] = useState<PerformerProfile | null>(null);
  const [formData, setFormData] = useState<PerformerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState<string | null>(null);
  const [tempGalleryImageUrls, setTempGalleryImageUrls] = useState<string[]>([]);

  // Function to fetch performer profile from backend
  const fetchPerformerProfile = async () => {
    if (!user || !token) {
      setErrorMessage('Authentication token or user data missing.');
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
      // Initialize profile and formData, handling potential nulls from backend
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
        // Backend now sends absolute URLs, so no need to prepend BASE_URL here.
        // Provide a default placeholder if URL is null or empty from backend.
        profile_picture_url: data.profile.profile_picture_url || 'https://placehold.co/150x150/553c9a/ffffff?text=Profile',
        gallery_images: data.profile.gallery_images || [], // Backend sends absolute URLs, directly use them
      };

      setProfile(fetchedProfile);
      setFormData(fetchedProfile);

      setTempProfilePictureUrl(null);
      setTempGalleryImageUrls([]);
      setProfilePictureFile(null);
      setGalleryImageFiles([]);

      setLocalLoading(false);
    } catch (error: any) {
      console.error('Error fetching performer profile:', error);
      setErrorMessage(error.message || 'An error occurred while fetching your profile.');
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
        fetchPerformerProfile();
      }
    }
  }, [isAuthenticated, user, authLoading, navigate, token]);

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
      setFormData(prev =>
          prev ? { ...prev, skills: prev.skills.filter(s => s !== skillToRemove) } : null
      );
    }
  };

  const handleSave = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!formData || !user || !token) {
      setErrorMessage('No data to save or user not authenticated.');
      return;
    }

    const dataToSend = new FormData();

    dataToSend.append('full_name', formData.full_name || '');
    dataToSend.append('stage_name', formData.stage_name || '');
    dataToSend.append('location', formData.location || '');
    dataToSend.append('performance_type', formData.performance_type || '');
    dataToSend.append('bio', formData.bio || '');
    dataToSend.append('price', formData.price || '');
    dataToSend.append('contact_number', formData.contact_number || '');
    dataToSend.append('direct_booking', formData.direct_booking ? 'true' : 'false');
    dataToSend.append('travel_distance', String(formData.travel_distance || 0));
    dataToSend.append('availability_weekdays', formData.availability_weekdays ? 'true' : 'false');
    dataToSend.append('availability_weekends', formData.availability_weekends ? 'true' : 'false');
    dataToSend.append('availability_morning', formData.availability_morning ? 'true' : 'false');
    dataToSend.append('availability_evening', formData.availability_evening ? 'true' : 'false');
    dataToSend.append('skills', JSON.stringify(formData.skills || []));

    // Handle gallery images: send only persistent URLs (non-blob)
    // The backend's toRelativePath will handle stripping BASE_URL
    const persistentGalleryImages = formData.gallery_images
        .filter(url => !url.startsWith('blob:')); // Keep only persistent URLs
    dataToSend.append('gallery_images', JSON.stringify(persistentGalleryImages));

    // Handle profile picture
    if (profilePictureFile) {
      dataToSend.append('profile_picture', profilePictureFile);
      console.log('Frontend: Sending NEW profile picture file.');
    } else if (formData.profile_picture_url && !formData.profile_picture_url.startsWith('blob:')) {
      // If it's an existing URL (not a temp blob URL), send it as is.
      // The backend's toRelativePath will correctly convert it for DB storage.
      dataToSend.append('profile_picture_url', formData.profile_picture_url);
      console.log('Frontend: Sending EXISTING profile_picture_url as string:', formData.profile_picture_url);
    } else {
      // If profile_picture_url is null, empty, or a blob URL that shouldn't persist, send an empty string.
      dataToSend.append('profile_picture_url', '');
      console.log('Frontend: Sending EMPTY profile_picture_url.');
    }

    // Append new gallery image files
    galleryImageFiles.forEach(file => {
      dataToSend.append('gallery_images', file); // Match backend's expected field name
    });

    try {
      const response = await fetch(`${BASE_URL}/api/performers/profile`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save performer profile.');
      }

      const data = await response.json();
      await fetchPerformerProfile(); // Re-fetch to get updated URLs

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
    setFormData(profile);
    setProfilePictureFile(null);
    setTempProfilePictureUrl(null);
    setGalleryImageFiles([]);
    setTempGalleryImageUrls([]);
    setIsEditing(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSwitchToHostMode = () => {
    navigate('/signin'); // This navigates to signin, assuming a mechanism there to switch roles.
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && formData) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      const tempUrl = URL.createObjectURL(file);
      setTempProfilePictureUrl(tempUrl);
      // Update formData with the temp URL for immediate display
      setFormData(prev => (prev ? { ...prev, profile_picture_url: tempUrl } : null));
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && formData) {
      const files = Array.from(e.target.files);
      setGalleryImageFiles(prev => [...prev, ...files]);
      const newTempUrls = files.map(file => URL.createObjectURL(file));
      setTempGalleryImageUrls(prev => [...prev, ...newTempUrls]);
      // Update formData with the temp URLs for immediate display
      setFormData(prev =>
          prev ? { ...prev, gallery_images: [...prev.gallery_images, ...newTempUrls] } : null
      );
      e.target.value = ''; // Clear the input so same file can be selected again
    }
  };

  const handleRemoveGalleryImage = (imageUrlToRemove: string, isTempUrl: boolean) => {
    if (isTempUrl) {
      // Revoke the object URL if it's a temporary blob URL
      URL.revokeObjectURL(imageUrlToRemove);
      setTempGalleryImageUrls(prev => prev.filter(url => url !== imageUrlToRemove));
      setGalleryImageFiles(prev =>
          prev.filter(file => URL.createObjectURL(file) !== imageUrlToRemove)
      );
    }
    if (formData) {
      setFormData(prev =>
          prev
              ? { ...prev, gallery_images: prev.gallery_images.filter(url => url !== imageUrlToRemove) }
              : null
      );
    }
  };

  if (authLoading || localLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          Loading profile...
        </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'performer') {
    return null;
  }

  if (!profile || !formData) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          Error: Profile data missing.
        </div>
    );
  }

  // Determine the URL to display for profile picture
  const displayProfilePictureUrl =
      tempProfilePictureUrl ||
      formData.profile_picture_url || // This will be the absolute URL from backend or a temp blob URL
      'https://placehold.co/150x150/553c9a/ffffff?text=Profile';

  // The gallery_images in formData already contains absolute URLs (from backend) and temp blob URLs (newly added)
  const displayGalleryImageUrls = [...formData.gallery_images];

  return (
      <div className="min-h-screen bg-slate-950 font-inter py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Artist Profile Management</h1>
              <p className="text-gray-400 mt-2">Manage your profile to attract more bookings</p>
            </div>
            <div className="flex space-x-3">
              {/* This button functionality is beyond the scope of this fix, assuming it's correctly linked to public profile view */}
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Details</h2>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <img
                        src={displayProfilePictureUrl}
                        alt="Profile"
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
                          {/* Add a button to clear profile picture if it's currently set and not a placeholder */}
                          {formData.profile_picture_url &&
                              formData.profile_picture_url !== 'https://placehold.co/150x150/553c9a/ffffff?text=Profile' && (
                                  <button
                                      onClick={() => {
                                        setProfilePictureFile(null);
                                        setTempProfilePictureUrl(null);
                                        setFormData(prev => (prev ? { ...prev, profile_picture_url: null } : null));
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
                        <p className="text-lg text-white flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {profile.location}
                        </p>
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
                              <span
                                  key={index}
                                  className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center"
                              >
                          {skill}
                                <button
                                    onClick={() => handleSkillRemove(skill)}
                                    className="ml-1 text-purple-300 hover:text-white"
                                >
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
                                <span
                                    key={index}
                                    className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                                >
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
                      <p className="text-lg text-white flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                        {profile.price}
                      </p>
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

            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Media Gallery</h3>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Drag & drop images to upload</p>
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

                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Gig Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Accept Direct Booking</span>
                      {isEditing ? (
                          <button
                              onClick={() =>
                                  setFormData(prev =>
                                      prev ? { ...prev, direct_booking: !prev.direct_booking } : null
                                  )
                              }
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
                          <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  profile.direct_booking ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                              }`}
                          >
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
                          <p className="text-lg text-white">{profile.travel_distance} km</p> // Added missing closing tag
                      )}
                    </div>
                    {/* ... rest of your preferences (availability) and buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                      {isEditing ? (
                          <>
                            <button
                                onClick={handleCancelEdit}
                                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              <Save className="h-4 w-4" />
                              <span>Save Changes</span>
                            </button>
                          </>
                      ) : (
                          <button
                              onClick={() => setIsEditing(true)}
                              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <PenTool className="h-4 w-4" />
                            <span>Edit Profile</span>
                          </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ArtistManagement;