import React from 'react';
import { X, MapPin, Star, Phone, DollarSign, List, Info } from 'lucide-react';

// Re-define PerformerProfile interface 
interface PerformerProfile {
  id?: number;
  user_id: number;
  full_name: string | null;
  stage_name: string;
  location: string | null;
  performance_type: string | null;
  bio: string | null;
  price: string | null;
  skills: string[];
  profile_picture_url: string | null;
  contact_number: string | null;
  direct_booking: boolean;
  travel_distance: number;
  availability_weekdays: boolean;
  availability_weekends: boolean;
  availability_morning: boolean;
  availability_evening: boolean;
  gallery_images: string[]; // This is the array of absolute URLs
  rating: number | string;
  review_count: number;
}

interface ArtistPreviewModalProps {
  artist: PerformerProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const ArtistPreviewModal: React.FC<ArtistPreviewModalProps> = ({ artist, isOpen, onClose }) => {
  if (!isOpen || !artist) return null;

  const renderStars = (rating: number | string) => { // Accept string or number here
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < numRating ? 'text-yellow-400 fill-current' : 'text-gray-600'
          }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-purple-700 to-pink-600 flex items-center justify-center rounded-t-xl">
          <img
            src={artist.profile_picture_url || 'https://placehold.co/150x150/553c9a/ffffff?text=Profile'}
            alt={artist.stage_name || artist.full_name || 'Artist Profile'}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full border-4 border-slate-800 object-cover shadow-lg"
          />
          <h2 className="text-3xl font-bold text-white mt-12">{artist.stage_name || artist.full_name}</h2>
        </div>

        {/* Content Area */}
        <div className="pt-20 pb-6 px-6 space-y-6">
          {/* Basic Info */}
          <div className="text-center">
            <p className="text-gray-300 text-lg mb-2">{artist.performance_type} from {artist.location}</p>
            <div className="flex justify-center items-center space-x-2 text-gray-400">
              {renderStars(artist.rating)}
              <span>({artist.review_count} reviews)</span>
            </div>
            <p className="text-purple-400 text-xl font-semibold mt-3">{artist.price}</p>
          </div>

          {/* Bio */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center"><Info className="h-5 w-5 mr-2"/> Bio</h3>
            <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
          </div>

          {/* Skills */}
          {artist.skills && artist.skills.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center"><List className="h-5 w-5 mr-2"/> Skills</h3>
              <div className="flex flex-wrap gap-2">
                {artist.skills.map((skill, index) => (
                  <span key={index} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Images */}
          {artist.gallery_images && artist.gallery_images.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center"><img src="https://placehold.co/20x20/ffffff/000000?text=🖼️" alt="Gallery Icon" className="mr-2"/> Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {artist.gallery_images.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`Gallery Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md shadow-md"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contact and Booking Info */}
          <div className="bg-slate-700 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center"><Phone className="h-5 w-5 mr-2"/> Contact</h3>
              <p className="text-gray-300">{artist.contact_number || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center"><DollarSign className="h-5 w-5 mr-2"/> Booking</h3>
              <p className="text-gray-300">Direct Booking: {artist.direct_booking ? 'Yes' : 'No'}</p>
              <p className="text-gray-300">Travel Distance: {artist.travel_distance} km</p>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center"><MapPin className="h-5 w-5 mr-2"/> Availability</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-300">
              <span>Weekdays: {artist.availability_weekdays ? 'Yes' : 'No'}</span>
              <span>Weekends: {artist.availability_weekends ? 'Yes' : 'No'}</span>
              <span>Morning: {artist.availability_morning ? 'Yes' : 'No'}</span>
              <span>Evening: {artist.availability_evening ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="text-center mt-6">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Book {artist.stage_name || artist.full_name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPreviewModal;
