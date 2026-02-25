import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { servicesApi, citiesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, Briefcase } from 'lucide-react';

const ProviderSignupPage = () => {
  const navigate = useNavigate();
  const { providerSignup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [cities, setCities] = useState({ cities: [], villages: [] });
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    category_id: '',
    sub_service_id: '',
    experience: '',
    base_price: '',
    city: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([
          servicesApi.getCategories(),
          citiesApi.getAll()
        ]);
        setCategories(catRes.data);
        setCities(cityRes.data);
      } catch (error) {
        console.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSubServices = async () => {
      if (formData.category_id) {
        try {
          const response = await servicesApi.getSubServices(formData.category_id);
          setSubServices(response.data);
        } catch (error) {
          console.error('Failed to fetch sub-services');
        }
      }
    };
    fetchSubServices();
  }, [formData.category_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (name === 'category_id') {
      setFormData(prev => ({ ...prev, category_id: value, sub_service_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await providerSignup({
        ...formData,
        experience: parseInt(formData.experience),
        base_price: parseFloat(formData.base_price)
      });
      toast.success('Provider account created! Awaiting admin approval.');
      navigate('/provider/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allLocations = [...cities.cities, ...cities.villages];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="font-bold text-2xl text-[#1E3A8A]" style={{ fontFamily: 'Poppins' }}>
                VOKZO
              </span>
            </Link>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-[#F97316]/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-[#F97316]" />
              </div>
            </div>
            
            <h1 
              className="text-2xl font-bold text-center text-[#0F172A] mb-2"
              style={{ fontFamily: 'Poppins' }}
              data-testid="provider-signup-title"
            >
              Become a Provider
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Join our network of trusted professionals
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                    required
                    data-testid="provider-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                    required
                    data-testid="provider-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-12 rounded-xl pr-12"
                      required
                      data-testid="provider-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                    required
                    data-testid="provider-confirm-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select value={formData.category_id} onValueChange={(v) => handleSelectChange('category_id', v)}>
                  <SelectTrigger className="h-12 rounded-xl" data-testid="provider-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sub-Service</Label>
                <Select 
                  value={formData.sub_service_id} 
                  onValueChange={(v) => handleSelectChange('sub_service_id', v)}
                  disabled={!formData.category_id}
                >
                  <SelectTrigger className="h-12 rounded-xl" data-testid="provider-sub-service">
                    <SelectValue placeholder="Select sub-service" />
                  </SelectTrigger>
                  <SelectContent>
                    {subServices.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    placeholder="Years of experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                    min="0"
                    required
                    data-testid="provider-experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price (₹)</Label>
                  <Input
                    id="base_price"
                    name="base_price"
                    type="number"
                    placeholder="Starting price"
                    value={formData.base_price}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                    min="0"
                    required
                    data-testid="provider-base-price"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Select value={formData.city} onValueChange={(v) => handleSelectChange('city', v)}>
                  <SelectTrigger className="h-12 rounded-xl" data-testid="provider-city">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">Major Cities</div>
                    {cities.cities.map((city) => (
                      <SelectItem key={city.id} value={city.name}>{city.name}, {city.state}</SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 mt-2">Towns</div>
                    {cities.villages.map((village) => (
                      <SelectItem key={village.id} value={village.name}>{village.name}, {village.state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">Note:</p>
                <p>Your account will be reviewed by our team. You'll be notified once approved.</p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full font-medium"
                disabled={loading}
                data-testid="provider-signup-submit"
              >
                {loading ? 'Creating Account...' : 'Join as Provider'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-[#1E3A8A] font-medium hover:underline" data-testid="login-link">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignupPage;
