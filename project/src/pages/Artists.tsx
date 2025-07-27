import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import ArtistCard from '../components/ArtistCard';
import ArtistPreviewModal from '../components/ArtistPreviewModal';



// Re-define PerformerProfile interface to match the backend structure
interface PerformerProfile {
  id?: number;
  user_id: number;
  full_name: string | null; // Can be null from DB
  stage_name: string;
  location: string | null; // Can be null from DB
  performance_type: string | null; // Can be null from DB
  bio: string | null; // Can be null from DB
  price: string | null; // This is price_display from backend, can be null
  skills: string[];
  profile_picture_url: string | null; // Can be null from DB
  contact_number: string | null; // Can be null from DB
  direct_booking: boolean;
  travel_distance: number;
  availability_weekdays: boolean;
  availability_weekends: boolean;
  availability_morning: boolean;
  availability_evening: boolean;
  gallery_images: string[];
  rating: number | string; // Can be decimal string from DB
  review_count: number;
}

// Define interface for data specifically used by ArtistCard
interface ArtistCardDisplayData { 
    id: string; // ArtistCard expects id as string
    name: string;
    category: string;
    location: string;
    rating: number;
    reviewCount: number;
    price: string;
    image: string; // This must always be a string
}

const Artists: React.FC = () => {
  // selectedArtist will now store the full PerformerProfile object
  const [selectedArtist, setSelectedArtist] = useState<PerformerProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedArtists, setDisplayedArtists] = useState<ArtistCardDisplayData[]>([]); // State to hold loaded artists for cards
  const [allPerformerProfiles, setAllPerformerProfiles] = useState<PerformerProfile[]>([]); // Store full profiles
  const [loading, setLoading] = useState(true); // New loading state
  const [error, setError] = useState<string | null>(null); // New error state

  // Effect to load artists from backend API on component mount
  useEffect(() => {
    const fetchAllPerformerProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/performers'); // Fetch from new public endpoint
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch artists.');
        }
        const data = await response.json();
        const profiles: PerformerProfile[] = data.profiles; // Backend returns 'profiles' array

        // Format URLs for both profile picture and gallery images immediately
        const formattedProfilesForDisplay: PerformerProfile[] = profiles.map(profile => ({
            ...profile,
            profile_picture_url: profile.profile_picture_url
                ? `http://localhost:5000${profile.profile_picture_url}`
                : 'https://placehold.co/400x400/553c9a/ffffff?text=No+Image', // Fallback image
            gallery_images: profile.gallery_images
                ? profile.gallery_images.map(url =>
                    url.startsWith('/uploads/') ? `http://localhost:5000${url}` : url
                  )
                : [],
            rating: typeof profile.rating === 'string' ? parseFloat(profile.rating) : (profile.rating || 0),
            full_name: profile.full_name || 'Unknown Artist', // Ensure full_name is not null for display
            location: profile.location || 'Not Set',
            performance_type: profile.performance_type || 'General',
            bio: profile.bio || 'No bio provided.',
            price: profile.price || 'Price Varies',
            contact_number: profile.contact_number || 'Not Set',
        }));

        setAllPerformerProfiles(formattedProfilesForDisplay); // Store full profiles
        
        // Prepare data specifically for ArtistCard display
        const formattedArtistsForCards: ArtistCardDisplayData[] = formattedProfilesForDisplay.map(profile => ({
            id: profile.id?.toString() || profile.user_id.toString(),
            name: profile.stage_name || profile.full_name || 'Unknown Artist',
            category: profile.performance_type || 'General',
            location: profile.location || 'Not Set',
            rating: typeof profile.rating === 'string' ? parseFloat(profile.rating) : (profile.rating || 0),
            reviewCount: profile.review_count || 0,
            price: profile.price || 'Price Varies',
            // Ensure image is always a string, using the fallback if profile_picture_url is null
            image: profile.profile_picture_url || 'https://placehold.co/400x400/553c9a/ffffff?text=No+Image',
        }));
        setDisplayedArtists(formattedArtistsForCards);

      } catch (err: any) {
        console.error('Error fetching all performer profiles:', err);
        setError(err.message || 'Could not load artists.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPerformerProfiles();
  }, []); // Empty dependency array means this runs once on mount


  const handleViewArtist = (artistId: string) => {
    const artist = allPerformerProfiles.find(p => (p.id?.toString() || p.user_id.toString()) === artistId);
    if (artist) {
      setSelectedArtist(artist);
      setShowModal(true);
    } else {
      console.error('Artist not found for ID:', artistId);
      setError('Artist details could not be loaded.');
    }
  };

  const categories = ['All Categories', 'Wedding Singer', 'Pop Singer', 'Classical Musician', 'Band Leader', 'DJ', 'Rapper', 'Jazz Singer', 'Folk Singer', 'Guitarist', 'Other'];
  const locations = ['All Locations', 'Colombo', 'Kandy', 'Galle', 'Negombo', 'Matara', 'Anuradhapura', 'Jaffna', 'Not Set'];
  const ratings = ['All Ratings', '5 Stars', '4+ Stars', '3+ Stars'];

  // Filtered artists based on search query (for future use)
  const filteredArtists = displayedArtists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.price.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading artists...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-inter py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Discover Amazing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Talent
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find the perfect performer for your event from Sri Lanka's top artists
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search artists, genres, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              <select className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                {ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            Showing {filteredArtists.length} artists found
          </p>
          <select className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm">
            <option>Sort by: Relevance</option>
            <option>Sort by: Rating</option>
            <option>Sort by: Price (Low to High)</option>
            <option>Sort by: Price (High to Low)</option>
          </select>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                id={artist.id}
                name={artist.name}
                category={artist.category}
                location={artist.location}
                rating={artist.rating}
                reviewCount={artist.reviewCount}
                price={artist.price}
                image={artist.image}
                onViewProfile={handleViewArtist} // Pass the ID here
              />
            ))
          ) : (
            <div className="lg:col-span-4 text-center text-gray-400 py-10">
              No artists found. Try adjusting your search or filters.
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredArtists.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Load More Artists
            </button>
          </div>
        )}
      </div>

      <ArtistPreviewModal
        artist={selectedArtist} 
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedArtist(null);
        }}
      />
    </div>
  );
};

export default Artists;
