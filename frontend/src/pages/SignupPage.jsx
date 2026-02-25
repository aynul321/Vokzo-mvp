import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, User } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'customer'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="w-full max-w-md">
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
              <div className="w-16 h-16 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-[#1E3A8A]" />
              </div>
            </div>
            
            <h1 
              className="text-2xl font-bold text-center text-[#0F172A] mb-2"
              style={{ fontFamily: 'Poppins' }}
              data-testid="signup-title"
            >
              Create Account
            </h1>
            <p className="text-slate-500 text-center mb-8">
              Sign up as a customer to book services
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                  required
                  data-testid="signup-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                  required
                  data-testid="signup-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 rounded-xl pr-12"
                    required
                    data-testid="signup-password"
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
                  placeholder="Confirm your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                  required
                  data-testid="signup-confirm-password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 btn-primary"
                disabled={loading}
                data-testid="signup-submit"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
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

          {/* Provider CTA */}
          <div className="mt-6 text-center">
            <p className="text-slate-500">
              Want to offer services?{' '}
              <Link to="/provider-signup" className="text-[#F97316] font-medium hover:underline" data-testid="provider-signup-link">
                Join as Provider
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
