import React from 'react';
import { Star, MapPin } from 'lucide-react';

interface ArtistCardProps {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: string;
  image: string;
  // onViewProfile now expects only the artist's ID
  onViewProfile: (artistId: string) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  id,
  name,
  category,
  location,
  rating,
  reviewCount,
  price,
  image,
  onViewProfile
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const handleViewProfile = () => {
    // Pass only the artist's ID to the onViewProfile function
    onViewProfile(id);
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="relative h-48">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs text-white font-medium">{price}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
        <p className="text-purple-400 text-sm mb-2">{category}</p>
        
        <div className="flex items-center text-gray-400 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            {renderStars(rating)}
            <span className="text-gray-400 text-sm ml-2">({reviewCount})</span>
          </div>
        </div>
        
        <button
          onClick={handleViewProfile}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;
