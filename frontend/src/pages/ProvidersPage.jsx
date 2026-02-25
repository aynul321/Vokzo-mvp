import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { providersApi, servicesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Star, CheckCircle, Clock, MapPin, IndianRupee } from 'lucide-react';

const ProvidersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedCity } = useAuth();
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sub_service: searchParams.get('sub_service') || '',
    category: searchParams.get('category') || '',
    city: selectedCity || ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await servicesApi.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.sub_service) params.sub_service_id = filters.sub_service;
        if (filters.category) params.category_id = filters.category;
        if (filters.city) params.city = filters.city;
        
        const response = await providersApi.getAll(params);
        setProviders(response.data);
      } catch (error) {
        console.error('Failed to fetch providers');
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [filters]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, city: selectedCity }));
  }, [selectedCity]);

  const handleProviderClick = (providerId) => {
    navigate(`/provider/${providerId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <Select 
              value={filters.category || "all"} 
              onValueChange={(v) => setFilters({ ...filters, category: v === "all" ? "" : v, sub_service: '' })}
            >
              <SelectTrigger className="w-[200px]" data-testid="filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 
            className="text-2xl font-bold text-[#0F172A]"
            style={{ fontFamily: 'Poppins' }}
            data-testid="providers-title"
          >
            Available Providers
            {selectedCity && <span className="text-[#F97316]"> in {selectedCity}</span>}
          </h1>
          <p className="text-slate-600">{providers.length} providers found</p>
        </div>

        {/* Providers List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No Providers Found</h2>
            <p className="text-slate-500 mb-6">
              {selectedCity 
                ? `No verified providers available in ${selectedCity} for this service yet.`
                : 'Please select a city to find providers near you.'}
            </p>
            <Button onClick={() => navigate('/')} className="btn-primary">
              Browse Other Services
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleProviderClick(provider.id)}
                data-testid={`provider-card-${provider.id}`}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-[#1E3A8A] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">
                      {provider.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#0F172A] flex items-center gap-2" style={{ fontFamily: 'Poppins' }}>
                          {provider.full_name}
                          {provider.is_verified && (
                            <span className="verified-badge" data-testid="verified-badge">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500">{provider.sub_service_name}</p>
                      </div>
                      {provider.is_online && (
                        <div className="flex items-center gap-1">
                          <span className="online-dot"></span>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.rating || 'New'}</span>
                        {provider.total_reviews > 0 && (
                          <span className="text-slate-500">({provider.total_reviews})</span>
                        )}
                      </div>

                      {/* Experience */}
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{provider.experience} yrs exp</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.city}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-[#1E3A8A] font-semibold">
                        <IndianRupee className="w-4 h-4" />
                        <span>{provider.base_price}</span>
                        <span className="text-slate-400 font-normal text-sm">onwards</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/book/${provider.id}`);
                        }}
                        data-testid={`book-btn-${provider.id}`}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProvidersPage;
