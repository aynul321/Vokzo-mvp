import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceIcon from '@/components/ServiceIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, Shield, Clock, Star, ArrowRight, Users } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { selectedCity } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await servicesApi.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/providers?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-[#1E3A8A] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F97316] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in"
              style={{ fontFamily: 'Poppins' }}
              data-testid="hero-title"
            >
              One Platform. Complete Trust.{' '}
              <span className="text-[#F97316]">Every Service.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 animate-fade-in stagger-1">
              Find verified professionals for all your needs. From home repairs to personal care, 
              we connect you with trusted local experts.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="animate-fade-in stagger-2">
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="What service do you need?"
                    className="pl-12 h-14 text-lg rounded-xl border-0 shadow-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="hero-search-input"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-14 px-8 bg-[#F97316] hover:bg-[#ea580c] text-white rounded-xl text-lg font-semibold shadow-lg shadow-orange-500/30"
                  data-testid="hero-search-btn"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in stagger-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-blue-200 text-sm">Verified Providers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">50K+</p>
                <p className="text-blue-200 text-sm">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">20+</p>
                <p className="text-blue-200 text-sm">Cities Covered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4"
              style={{ fontFamily: 'Poppins' }}
              data-testid="categories-title"
            >
              Browse Services
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Choose from a wide range of professional services
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 h-40 animate-pulse">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="service-card group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`category-${category.id}`}
                >
                  <div className="w-14 h-14 bg-[#1E3A8A]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1E3A8A] transition-colors">
                    <ServiceIcon 
                      name={category.icon} 
                      className="w-7 h-7 text-[#1E3A8A] group-hover:text-white transition-colors" 
                    />
                  </div>
                  <h3 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {category.provider_count} providers
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4"
              style={{ fontFamily: 'Poppins' }}
            >
              How It Works
            </h2>
            <p className="text-slate-600 text-lg">
              Get your service done in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Service',
                description: 'Browse our categories and select the service you need',
                icon: Search
              },
              {
                step: '02',
                title: 'Book Provider',
                description: 'Compare providers and book your preferred expert',
                icon: Users
              },
              {
                step: '03',
                title: 'Get It Done',
                description: 'Provider arrives, completes the job. Pay after service.',
                icon: CheckCircle
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="relative text-center p-8 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#F97316] rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <div className="mt-16">
                  <div className="w-20 h-20 bg-[#1E3A8A]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-10 h-10 text-[#1E3A8A]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-2" style={{ fontFamily: 'Poppins' }}>
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 
                className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-6"
                style={{ fontFamily: 'Poppins' }}
              >
                Why Trust VOKZO?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: 'Verified Professionals',
                    description: 'Every provider goes through background verification and skill assessment'
                  },
                  {
                    icon: Star,
                    title: 'Transparent Ratings',
                    description: 'Real reviews from real customers help you make informed decisions'
                  },
                  {
                    icon: Clock,
                    title: 'On-Time Service',
                    description: 'Providers committed to punctuality and professional service'
                  },
                  {
                    icon: CheckCircle,
                    title: 'Pay After Service',
                    description: 'No advance payment. Pay only after satisfactory completion'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-[#1E3A8A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#1E3A8A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0F172A] mb-1" style={{ fontFamily: 'Poppins' }}>
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#1E3A8A] rounded-xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                      100% Secure
                    </h3>
                    <p className="text-slate-600">Your trust, our priority</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>ID Verified Providers</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Background Checked</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Skill Assessed</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Customer Support 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#1E3A8A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: 'Poppins' }}
          >
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of happy customers who trust VOKZO for their service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/signup')}
              className="btn-cta"
              data-testid="cta-book-service"
            >
              Book a Service
            </Button>
            <Button 
              onClick={() => navigate('/provider-signup')}
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1E3A8A] rounded-full px-8 py-4 text-lg font-semibold"
              data-testid="cta-become-provider"
            >
              Become a Provider
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
