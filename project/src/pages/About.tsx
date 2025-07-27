import React, { useState } from 'react';
import { Edit3, Save, X, Music, Users, Award, MapPin } from 'lucide-react';

const About = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState({
    title: 'About Gigs.lk',
    subtitle: 'Connecting Sri Lanka\'s finest artists with event organizers',
    description: 'Gigs.lk is Sri Lanka\'s premier platform for discovering and booking talented performers for all types of events. We bridge the gap between exceptional artists and event organizers, making it easier than ever to find the perfect entertainment for weddings, corporate events, private parties, and more.',
    mission: 'Our mission is to empower local artists by providing them with opportunities to showcase their talents while helping event organizers create memorable experiences through exceptional entertainment.',
    stats: {
      artists: '500+',
      events: '2,000+',
      cities: '25+',
      reviews: '4.8/5'
    }
  });

  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    setContent(editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const features = [
    {
      icon: <Music className="h-8 w-8 text-purple-400" />,
      title: 'Diverse Talent Pool',
      description: 'From traditional Sri Lankan performers to contemporary artists, find exactly what you need for your event.'
    },
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      title: 'Trusted Community',
      description: 'All artists are verified and rated by previous clients, ensuring quality and reliability.'
    },
    {
      icon: <Award className="h-8 w-8 text-purple-400" />,
      title: 'Professional Standards',
      description: 'We maintain high standards for all performers, guaranteeing professional service for your events.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Edit Button */}
        <div className="flex justify-end mb-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Page</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editContent.title}
                onChange={(e) => setEditContent({...editContent, title: e.target.value})}
                className="w-full text-4xl font-bold text-center bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                value={editContent.subtitle}
                onChange={(e) => setEditContent({...editContent, subtitle: e.target.value})}
                className="w-full text-xl text-center bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white mb-4">{content.title}</h1>
              <p className="text-xl text-gray-300">{content.subtitle}</p>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-8">
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={editContent.description}
                  onChange={(e) => setEditContent({...editContent, description: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mission</label>
                <textarea
                  value={editContent.mission}
                  onChange={(e) => setEditContent({...editContent, mission: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">{content.description}</p>
              <p className="text-gray-300 text-lg leading-relaxed">{content.mission}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editContent.stats.artists}
                  onChange={(e) => setEditContent({
                    ...editContent,
                    stats: {...editContent.stats, artists: e.target.value}
                  })}
                  className="w-full text-center bg-slate-700 border border-slate-600 rounded px-2 py-1 text-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                content.stats.artists
              )}
            </div>
            <p className="text-gray-400">Active Artists</p>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editContent.stats.events}
                  onChange={(e) => setEditContent({
                    ...editContent,
                    stats: {...editContent.stats, events: e.target.value}
                  })}
                  className="w-full text-center bg-slate-700 border border-slate-600 rounded px-2 py-1 text-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                content.stats.events
              )}
            </div>
            <p className="text-gray-400">Events Completed</p>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editContent.stats.cities}
                  onChange={(e) => setEditContent({
                    ...editContent,
                    stats: {...editContent.stats, cities: e.target.value}
                  })}
                  className="w-full text-center bg-slate-700 border border-slate-600 rounded px-2 py-1 text-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                content.stats.cities
              )}
            </div>
            <p className="text-gray-400">Cities Covered</p>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editContent.stats.reviews}
                  onChange={(e) => setEditContent({
                    ...editContent,
                    stats: {...editContent.stats, reviews: e.target.value}
                  })}
                  className="w-full text-center bg-slate-700 border border-slate-600 rounded px-2 py-1 text-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                content.stats.reviews
              )}
            </div>
            <p className="text-gray-400">Average Rating</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">For Artists</h3>
              <p className="text-gray-300 mb-4">
                Ready to showcase your talent and connect with event organizers? Join our platform and start building your performance career.
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                Join as Artist
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">For Event Organizers</h3>
              <p className="text-gray-300 mb-4">
                Looking for the perfect entertainment for your event? Browse our talented artists and book with confidence.
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                Find Artists
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;