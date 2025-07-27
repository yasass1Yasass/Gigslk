import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, Users, MessageCircle, CheckCircle } from 'lucide-react';
import ArtistCard from '../components/ArtistCard';
import ArtistPreviewModal from '../components/ArtistPreviewModal';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const Home: React.FC = () => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated, user } = useAuth(); // Get auth state and user from context

  const featuredArtists = [
    {
      id: '1',
      name: 'Anna Dias',
      category: 'Wedding Singer',
      location: 'Colombo',
      rating: 5,
      reviewCount: 127,
      price: 'Rs. 15,000/Event',
      image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
    },
    {
      id: '2',
      name: 'Natalie Fernando',
      category: 'Pop Singer',
      location: 'Kandy',
      rating: 5,
      reviewCount: 98,
      price: 'Rs. 20,000/Event',
      image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
    },
    {
      id: '3',
      name: 'Nimal Perera',
      category: 'Classical Musician',
      location: 'Galle',
      rating: 5,
      reviewCount: 156,
      price: 'Rs. 18,000/Event',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
    },
    {
      id: '4',
      name: 'Rohan Silva',
      category: 'Band Leader',
      location: 'Negombo',
      rating: 5,
      reviewCount: 203,
      price: 'Rs. 35,000/Event',
      image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Rajapaksa',
      text: 'Found the perfect singer for our wedding through Gigs.lk. The booking process was seamless and the performance was outstanding!',
      rating: 5,
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      name: 'Kamal Mendis',
      text: 'As a performer, Gigs.lk has helped me connect with amazing clients and grow my business significantly.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      name: 'Chamari Silva',
      text: 'Excellent platform for booking entertainment. Wide variety of talented performers and fair pricing.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    }
  ];

  const handleViewArtist = (artist: any) => {
    setSelectedArtist(artist);
    setShowModal(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
          }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 font-inter"> {}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-900 via-slate-900 to-slate-900 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                Book Amazing{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Talent
                </span>{' '}
                for Your Events
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Connect with talented performers across Sri Lanka. From singers to musicians,
                find the perfect artist for your special occasion.
              </p>
              {/* Conditional rendering for Hero Section buttons */}
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/artists"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-medium transition-colors text-center"
                  >
                    Book an Artist
                  </Link>
                  <Link
                    to="/register?role=performer"
                    className="border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-lg font-medium transition-colors text-center"
                  >
                    Join as Artist
                  </Link>
                </div>
              ) : (
                // Content for logged-in users in Hero Section
                <div className="mt-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Welcome, {user?.username || user?.email}!
                  </h2>
                  <p className="text-lg text-gray-400 mb-6">
                    You are logged in as a {user?.role}. Explore your dashboard or browse events.
                  </p>
                  <div className="flex justify-center sm:justify-start space-x-4"> {/* Adjusted for better alignment */}
                    {user?.role === 'performer' && (
                      <Link
                        to="/artist-management" // Changed to /artist-management
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Go to Artist Dashboard
                      </Link>
                    )}
                    {user?.role === 'host' && (
                      <Link
                        to="/host-dashboard"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Go to Host Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin-dashboard"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Go to Admin Dashboard
                      </Link>
                    )}
                    {/* Only show "Join as Artist" if user is NOT a performer */}
                    {user?.role !== 'performer' && (
                      <Link
                        to="/register?role=performer"
                        className="bg-transparent border-2 border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Join as Artist
                      </Link>
                    )}
                    {/* Add a generic browse button for all logged-in users */}
                    <Link
                      to="/artists"
                      className="bg-transparent border-2 border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Browse Artists
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <img src="/Assets/1.png" alt="Performance" className="rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Artists</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover the talent performers ready for your next event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                {...artist}
                onViewProfile={handleViewArtist}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/artists"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block" // Updated button styling
            >
              View All Artists
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How Gigs.lk Works</h2>
            <p className="text-gray-400">Simple steps to book your perfect performer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"> {/* Updated icon background */}
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">1. Search</h3>
              <p className="text-gray-400">
                Find the perfect artist by category, location, style, or budget using our advanced search
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"> {/* Updated icon background */}
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">2. Book & Connect</h3>
              <p className="text-gray-400">
                Send booking requests and communicate directly with artists. Discuss details and finalize your booking
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"> {/* Updated icon background */}
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">3. Enjoy Your Event</h3>
              <p className="text-gray-400">
                Experience an amazing performance and leave reviews to help other event organizers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-gray-400">Real experiences from event hosts and performers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-900 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-purple-100 text-lg mb-8">
            Join thousands of satisfied customers who found their perfect entertainment through Gigs.lk
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/artists"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Start Booking Artists
            </Link>
            {/* Conditional rendering for "Become a Performer" button */}
            {user?.role !== 'performer' && ( // Only show if user is NOT a performer
              <Link
                to="/register?role=performer"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Become a Performer
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Gigs.lk. All rights reserved.
            </div>
            {/* Admin Panel button: Only show if NOT authenticated */}
            {!isAuthenticated && (
              <Link
                to="/signin" 
                className="bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </footer>

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

export default Home;
