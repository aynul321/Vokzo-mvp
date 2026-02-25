import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesApi } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceIcon from '@/components/ServiceIcon';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, ArrowRight } from 'lucide-react';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          servicesApi.getCategories(),
          servicesApi.getSubServices(categoryId)
        ]);
        const cat = catRes.data.find(c => c.id === categoryId);
        setCategory(cat);
        setSubServices(subRes.data);
      } catch (error) {
        console.error('Failed to fetch category data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  const handleSubServiceClick = (subServiceId) => {
    navigate(`/providers?sub_service=${subServiceId}&category=${categoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Category not found</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-slate-600"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Category Header */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1E3A8A]/10 rounded-xl flex items-center justify-center">
              <ServiceIcon name={category.icon} className="w-8 h-8 text-[#1E3A8A]" />
            </div>
            <div>
              <h1 
                className="text-2xl md:text-3xl font-bold text-[#0F172A]"
                style={{ fontFamily: 'Poppins' }}
                data-testid="category-title"
              >
                {category.name}
              </h1>
              <p className="text-slate-600">{category.description}</p>
              <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                <Users className="w-4 h-4" />
                <span>{category.provider_count} providers available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-services Grid */}
        <h2 
          className="text-xl font-semibold text-[#0F172A] mb-6"
          style={{ fontFamily: 'Poppins' }}
        >
          Select a Service
        </h2>

        {subServices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-slate-500">No services available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subServices.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubServiceClick(sub.id)}
                className="bg-white rounded-xl p-6 text-left hover:shadow-md transition-all group"
                data-testid={`sub-service-${sub.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#1E3A8A]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1E3A8A] transition-colors">
                      <ServiceIcon 
                        name={sub.icon} 
                        className="w-6 h-6 text-[#1E3A8A] group-hover:text-white transition-colors" 
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                        {sub.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{sub.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#1E3A8A] group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
