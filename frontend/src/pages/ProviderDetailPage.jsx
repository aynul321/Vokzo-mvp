import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { providersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, CheckCircle, Clock, MapPin, IndianRupee, Calendar, MessageSquare } from 'lucide-react';

const ProviderDetailPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await providersApi.getById(providerId);
        setProvider(response.data);
      } catch (error) {
        console.error('Failed to fetch provider');
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [providerId]);

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 animate-pulse">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-slate-200 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Provider not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-slate-600"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Provider Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-[#1E3A8A] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-3xl font-bold">
                  {provider.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 
                      className="text-2xl font-bold text-[#0F172A] flex items-center gap-2"
                      style={{ fontFamily: 'Poppins' }}
                      data-testid="provider-name"
                    >
                      {provider.full_name}
                      {provider.is_verified && (
                        <span className="verified-badge">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </h1>
                    <p className="text-slate-600 mt-1">
                      {provider.sub_service_name} • {provider.category_name}
                    </p>
                  </div>
                  {provider.is_online && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                      <span className="online-dot"></span>
                      <span className="text-sm text-green-700 font-medium">Online Now</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-6 mt-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">{provider.rating || 'New'}</span>
                    </div>
                    {provider.total_reviews > 0 && (
                      <span className="text-slate-500">({provider.total_reviews} reviews)</span>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-5 h-5" />
                    <span>{provider.experience} years experience</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-5 h-5" />
                    <span>{provider.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Book */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-sm text-slate-500 mb-1">Starting Price</p>
                <div className="flex items-center gap-1 text-2xl font-bold text-[#1E3A8A]">
                  <IndianRupee className="w-6 h-6" />
                  <span>{provider.base_price}</span>
                </div>
              </div>
              <Button 
                className="btn-cta"
                onClick={handleBook}
                data-testid="book-now-btn"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
              </Button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-100">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4" style={{ fontFamily: 'Poppins' }}>
              About
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#1E3A8A]">{provider.experience}</p>
                <p className="text-sm text-slate-500">Years Exp.</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#1E3A8A]">{provider.total_reviews || 0}</p>
                <p className="text-sm text-slate-500">Reviews</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#1E3A8A]">{provider.rating || '-'}</p>
                <p className="text-sm text-slate-500">Rating</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#F97316]">₹{provider.base_price}</p>
                <p className="text-sm text-slate-500">Base Price</p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="p-6 md:p-8 border-t border-slate-100">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4" style={{ fontFamily: 'Poppins' }}>
              Reviews
            </h2>
            
            {provider.reviews && provider.reviews.length > 0 ? (
              <div className="space-y-4">
                {provider.reviews.map((review) => (
                  <div key={review.id} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-[#1E3A8A]">
                            {review.customer_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800">{review.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-slate-600 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No reviews yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Book Button (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Starting at</p>
              <p className="text-xl font-bold text-[#1E3A8A]">₹{provider.base_price}</p>
            </div>
            <Button 
              className="bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full px-8"
              onClick={handleBook}
            >
              Book Now
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProviderDetailPage;
