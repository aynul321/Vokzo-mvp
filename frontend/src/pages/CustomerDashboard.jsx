import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi, reviewsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, IndianRupee, Star, Search } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsApi.getCustomerBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (booking) => {
    setReviewModal({ open: true, booking });
    setReviewData({ rating: 5, comment: '' });
  };

  const submitReview = async () => {
    if (!reviewModal.booking) return;
    
    setSubmittingReview(true);
    try {
      await reviewsApi.create({
        booking_id: reviewModal.booking.id,
        provider_id: reviewModal.booking.provider_id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      toast.success('Review submitted successfully!');
      setReviewModal({ open: false, booking: null });
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#0F172A]"
            style={{ fontFamily: 'Poppins' }}
            data-testid="dashboard-title"
          >
            My Bookings
          </h1>
          <p className="text-slate-600 mt-1">View and manage your service bookings</p>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No Bookings Yet</h2>
            <p className="text-slate-500 mb-6">You haven't booked any services yet.</p>
            <Button onClick={() => navigate('/')} className="btn-primary" data-testid="find-service-btn">
              <Search className="w-4 h-4 mr-2" />
              Find a Service
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white rounded-xl p-5 shadow-sm"
                data-testid={`booking-card-${booking.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                      {booking.sub_service_name}
                    </h3>
                    <p className="text-sm text-slate-500">{booking.category_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-8 h-8 bg-[#1E3A8A]/10 rounded-lg flex items-center justify-center">
                      <span className="text-[#1E3A8A] font-medium text-xs">
                        {booking.provider_name?.charAt(0)}
                      </span>
                    </div>
                    <span>{booking.provider_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{booking.booking_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{booking.booking_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1E3A8A] font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    <span>{booking.base_price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{booking.address}, {booking.city}</span>
                </div>

                {booking.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewModal(booking)}
                      className="text-[#F97316] border-[#F97316] hover:bg-[#F97316]/10"
                      data-testid={`review-btn-${booking.id}`}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Leave Review
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      <Dialog open={reviewModal.open} onOpenChange={(open) => setReviewModal({ ...reviewModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins' }}>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">Rate your experience</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="focus:outline-none"
                    data-testid={`star-${star}`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Your feedback (optional)</p>
              <Textarea
                placeholder="Share your experience..."
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="min-h-[100px]"
                data-testid="review-comment"
              />
            </div>
            <Button
              className="w-full btn-primary"
              onClick={submitReview}
              disabled={submittingReview}
              data-testid="submit-review-btn"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;
