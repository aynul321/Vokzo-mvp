import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { providersApi, bookingsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Calendar, Clock, MapPin, IndianRupee, Star, 
  CheckCircle, XCircle, AlertCircle, TrendingUp, Users, Wallet
} from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        providersApi.getDashboardStats(),
        bookingsApi.getProviderBookings()
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setIsOnline(statsRes.data.provider?.is_online || false);
    } catch (error) {
      console.error('Failed to fetch data');
      if (error.response?.status === 404) {
        toast.error('Provider profile not found. Please complete registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleOnline = async () => {
    setTogglingStatus(true);
    try {
      const response = await providersApi.toggleOnline();
      setIsOnline(response.data.is_online);
      toast.success(response.data.is_online ? 'You are now online!' : 'You are now offline');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      if (action === 'accept') {
        await bookingsApi.accept(bookingId);
        toast.success('Booking accepted!');
      } else if (action === 'reject') {
        await bookingsApi.reject(bookingId);
        toast.success('Booking rejected');
      } else if (action === 'complete') {
        await bookingsApi.complete(bookingId);
        toast.success('Booking marked as completed!');
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'accepted');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats?.provider) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Profile Not Found</h1>
          <p className="text-slate-500 mb-6">Your provider profile is not set up yet.</p>
          <Button onClick={() => navigate('/provider-signup')} className="btn-primary">
            Complete Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold text-[#0F172A]"
              style={{ fontFamily: 'Poppins' }}
              data-testid="provider-dashboard-title"
            >
              Provider Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Welcome back, {user?.full_name}!
            </p>
          </div>
          
          {/* Online Toggle */}
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-slate-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <Switch
              checked={isOnline}
              onCheckedChange={toggleOnline}
              disabled={togglingStatus || !stats.provider.is_approved}
              data-testid="online-toggle"
            />
          </div>
        </div>

        {/* Approval Status */}
        {!stats.provider.is_approved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Pending Approval</p>
                <p className="text-sm text-yellow-700">
                  Your account is under review. You'll be able to receive bookings once approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.total_bookings}</p>
                <p className="text-xs text-slate-500">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.pending_bookings}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.completed_bookings}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F97316]/10 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#F97316]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">₹{stats.total_earnings.toFixed(0)}</p>
                <p className="text-xs text-slate-500">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-xl p-5 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1E3A8A] rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {stats.provider.full_name?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                  {stats.provider.full_name}
                </h3>
                <p className="text-sm text-slate-500">{stats.provider.sub_service_name || 'Service Provider'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{stats.provider.rating || 'New'}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-500">{stats.provider.experience} yrs exp</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-[#1E3A8A] font-medium">₹{stats.provider.base_price} base</span>
                </div>
              </div>
            </div>
            {stats.provider.is_verified && (
              <span className="verified-badge">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed ({completedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No pending booking requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onAction={handleBookingAction}
                    showActions
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {activeBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No active bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onAction={handleBookingAction}
                    showComplete
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No completed bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Booking Card Component
const BookingCard = ({ booking, onAction, showActions, showComplete }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm" data-testid={`booking-${booking.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
          {booking.customer_name}
        </h3>
        <p className="text-sm text-slate-500">{booking.sub_service_name}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
      </span>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
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
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <TrendingUp className="w-4 h-4" />
        <span>₹{booking.provider_earnings.toFixed(0)} earning</span>
      </div>
    </div>

    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
      <MapPin className="w-4 h-4" />
      <span className="truncate">{booking.address}, {booking.city}</span>
    </div>

    {showActions && (
      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <Button
          onClick={() => onAction(booking.id, 'accept')}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          data-testid={`accept-${booking.id}`}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Accept
        </Button>
        <Button
          onClick={() => onAction(booking.id, 'reject')}
          variant="outline"
          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          data-testid={`reject-${booking.id}`}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>
    )}

    {showComplete && (
      <div className="pt-4 border-t border-slate-100">
        <Button
          onClick={() => onAction(booking.id, 'complete')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          data-testid={`complete-${booking.id}`}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Mark as Completed
        </Button>
      </div>
    )}
  </div>
);

export default ProviderDashboard;
