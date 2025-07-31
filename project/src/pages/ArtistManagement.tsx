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

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState<string | null>(null);
  const [tempGalleryImageUrls, setTempGalleryImageUrls] = useState<string[]>([]);

  const fetchPerformerProfile = async () => {
    if (!user || !token) {
      setErrorMessage('Authentication token or user data missing.');
      setLocalLoading(false);
      return;
    }

    try {
      const response = await fetch('https://gigslk-backend-production.up.railway.app/api/hosts/profile', { // CHANGE 1: Update endpoint to /api/hosts/profile
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
        user_id: data.profile.user_id || user.id, // Ensure user_id is set
        full_name: data.profile.company_organization || user?.username || '', // Map company_organization to full_name
        stage_name: '', // No equivalent in host profile, set to empty
        location: data.profile.location || 'Not Set',
        performance_type: data.profile.event_types_typically_hosted?.join(', ') || 'Not Set', // Map event_types
        bio: data.profile.bio || 'Tell us about your talent and experience!',
        price: `${data.profile.default_budget_range_min || 0} - ${data.profile.default_budget_range_max || 0}`, // Map budget range
        skills: data.profile.preferred_performer_types || [],
        contact_number: data.profile.contact_number || 'Not Set',
        direct_booking: data.profile.urgent_booking_enabled || false,
        travel_distance: data.profile.preferred_locations_for_gigs?.length || 0, // Approximate mapping
        availability_weekdays: true, // Default, no direct mapping
        availability_weekends: true, // Default
        availability_morning: true, // Default
        availability_evening: true, // Default
        profile_picture_url: data.profile.profile_picture_url
            ? `https://gigslk-backend-production.up.railway.app${data.profile.profile_picture_url}`
            : 'https://placehold.co/150x150/553c9a/ffffff?text=Profile',
        gallery_images: data.profile.gallery_images
            ? (data.profile.gallery_images as string[]).map(url =>
                url.startsWith('/uploads/') ? `https://gigslk-backend-production.up.railway.app${url}` : url
            )
            : [],
        rating: data.profile.average_rating || 0,
        review_count: data.profile.total_reviews || 0,
      };

      console.log('Fetched profile gallery_images:', fetchedProfile.gallery_images); // CHANGE 2: Add debug log
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
      setErrorMessage('No data to save or user not authenticated.');
      return;
    }

    const dataToSend = new FormData();

    // Map frontend fields to backend host profile fields
    dataToSend.append('company_organization', formData.full_name || '');
    dataToSend.append('contact_person', formData.stage_name || '');
    dataToSend.append('contact_number', formData.contact_number || '');
    dataToSend.append('location', formData.location || '');
    dataToSend.append('event_types_typically_hosted', JSON.stringify(formData.performance_type.split(',').map(s => s.trim()).filter(Boolean) || []));
    dataToSend.append('bio', formData.bio || '');
    const [minPrice, maxPrice] = formData.price.split('-').map(s => parseFloat(s.replace(/[^0-9.]/g, '')) || 0);
    dataToSend.append('default_budget_range_min', String(minPrice));
    dataToSend.append('default_budget_range_max', String(maxPrice));
    dataToSend.append('preferred_performer_types', JSON.stringify(formData.skills || []));
    dataToSend.append('preferred_locations_for_gigs', JSON.stringify([formData.location] || []));
    dataToSend.append('urgent_booking_enabled', formData.direct_booking ? '1' : '0');
    dataToSend.append('email_notifications_enabled', '1'); // Default
    dataToSend.append('sms_notifications_enabled', '0'); // Default

    // Handle profile picture
    if (profilePictureFile) {
      dataToSend.append('profile_picture', profilePictureFile);
      console.log('Frontend: Sending new profile picture file.');
    } else {
      const currentProfilePicUrl = formData.profile_picture_url;
      let urlToAppend = '';
      if (currentProfilePicUrl && currentProfilePicUrl.startsWith('https://gigslk-backend-production.up.railway.app/uploads/')) {
        urlToAppend = currentProfilePicUrl.replace('https://gigslk-backend-production.up.railway.app', '');
      } else if (currentProfilePicUrl) {
        urlToAppend = currentProfilePicUrl;
      }
      dataToSend.append('profile_picture_url', urlToAppend);
      console.log('Frontend: Sending existing profile_picture_url as string:', urlToAppend);
    }

    // Handle gallery images
    const persistentGalleryImages = (formData.gallery_images || []).filter(url => !url.startsWith('blob:')); // CHANGE 3: Ensure non-empty array
    console.log('Frontend: persistentGalleryImages:', persistentGalleryImages); // CHANGE 4: Add debug log
    dataToSend.append('gallery_images', JSON.stringify(persistentGalleryImages));

    galleryImageFiles.forEach((file) => {
      dataToSend.append('gallery_images', file);
    });

    console.log('Frontend: formData.profile_picture_url BEFORE sending:', formData.profile_picture_url);
    console.log('Frontend: formData.gallery_images BEFORE sending:', formData.gallery_images);

    try {
      const response = await fetch('https://gigslk-backend-production.up.railway.app/api/hosts/profile', { // CHANGE 5: Update endpoint to /api/hosts/profile
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
      // CHANGE 6: Update formData.gallery_images to include new temp URLs
      setFormData(prev => (prev ? { ...prev, gallery_images: [...prev.gallery_images, ...newTempUrls] } : null));
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (imageUrlToRemove: string, isTempUrl: boolean) => {
    if (isTempUrl) {
      setTempGalleryImageUrls(prev => prev.filter(url => url !== imageUrlToRemove));
      const fileToRemove = galleryImageFiles.find(file => URL.createObjectURL(file) === imageUrlToRemove);
      if (fileToRemove) {
        setGalleryImageFiles(prev => prev.filter(file => URL.createObjectURL(file) !== imageUrlToRemove));
      }
      URL.revokeObjectURL(imageUrlToRemove);
    }
    // CHANGE 7: Always update formData.gallery_images when removing
    setFormData(prev => (prev ? { ...prev, gallery_images: prev.gallery_images.filter(url => url !== imageUrlToRemove) } : null));
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
        <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
        />
    ));
  };

  const displayProfilePictureUrl = tempProfilePictureUrl || profile.profile_picture_url || 'https://placehold.co/150x150/553c9a/ffffff?text=Profile';
  const displayGalleryImageUrls = [...(formData.gallery_images || []), ...tempGalleryImageUrls];

  return (
      <div className="min-h-screen bg-slate-950 font-inter py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                          <p className="text-lg text-white flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            {profile.travel_distance} km
                          </p>
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