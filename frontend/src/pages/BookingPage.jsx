import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { providersApi, bookingsApi, citiesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, IndianRupee, CheckCircle } from 'lucide-react';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM'
];

const BookingPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { selectedCity } = useAuth();
  const [provider, setProvider] = useState(null);
  const [cities, setCities] = useState({ cities: [], villages: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    booking_date: null,
    booking_time: '',
    address: '',
    city: selectedCity || '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providerRes, citiesRes] = await Promise.all([
          providersApi.getById(providerId),
          citiesApi.getAll()
        ]);
        setProvider(providerRes.data);
        setCities(citiesRes.data);
      } catch (error) {
        console.error('Failed to fetch data');
        toast.error('Failed to load provider details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [providerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.booking_date || !formData.booking_time || !formData.address || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      await bookingsApi.create({
        provider_id: providerId,
        sub_service_id: provider.sub_service_id,
        booking_date: format(formData.booking_date, 'yyyy-MM-dd'),
        booking_time: formData.booking_time,
        address: formData.address,
        city: formData.city,
        notes: formData.notes
      });

      toast.success('Booking request sent successfully!');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const allLocations = [...cities.cities, ...cities.villages];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
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

        <h1 
          className="text-2xl font-bold text-[#0F172A] mb-6"
          style={{ fontFamily: 'Poppins' }}
          data-testid="booking-title"
        >
          Book Service
        </h1>

        {/* Provider Summary */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-[#1E3A8A] rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {provider.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                {provider.full_name}
              </h3>
              <p className="text-sm text-slate-500">{provider.sub_service_name}</p>
              <div className="flex items-center gap-1 mt-2 text-[#1E3A8A] font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{provider.base_price}</span>
                <span className="text-slate-400 font-normal text-sm">base price</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#1E3A8A]" />
              Select Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal rounded-xl"
                  data-testid="booking-date"
                >
                  {formData.booking_date ? (
                    format(formData.booking_date, 'PPP')
                  ) : (
                    <span className="text-slate-400">Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.booking_date}
                  onSelect={(date) => setFormData({ ...formData, booking_date: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1E3A8A]" />
              Select Time *
            </Label>
            <Select 
              value={formData.booking_time} 
              onValueChange={(v) => setFormData({ ...formData, booking_time: v })}
            >
              <SelectTrigger className="h-12 rounded-xl" data-testid="booking-time">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1E3A8A]" />
              City *
            </Label>
            <Select 
              value={formData.city} 
              onValueChange={(v) => setFormData({ ...formData, city: v })}
            >
              <SelectTrigger className="h-12 rounded-xl" data-testid="booking-city">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {allLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.name}>
                    {loc.name}, {loc.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Full Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter your complete address with landmarks"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="min-h-[100px] rounded-xl"
              required
              data-testid="booking-address"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements or instructions"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[80px] rounded-xl"
              data-testid="booking-notes"
            />
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Pay After Service</p>
                <p className="text-sm text-blue-700">
                  No advance payment required. Pay the provider in cash after the service is completed.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 btn-cta"
            disabled={submitting}
            data-testid="submit-booking"
          >
            {submitting ? 'Submitting...' : 'Confirm Booking'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default BookingPage;
