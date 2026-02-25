import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { citiesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, User, LogOut, Calendar, LayoutDashboard, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout, selectedCity, updateCity } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState({ cities: [], villages: [] });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await citiesApi.getAll();
        setCities(response.data);
      } catch (error) {
        console.error('Failed to fetch cities');
      }
    };
    fetchCities();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const allLocations = [...cities.cities, ...cities.villages];

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl text-[#1E3A8A] hidden sm:block" style={{ fontFamily: 'Poppins' }}>
              VOKZO
            </span>
          </Link>

          {/* City Selector - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1E3A8A]" />
            <Select value={selectedCity} onValueChange={updateCity}>
              <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0" data-testid="city-selector">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">Major Cities</div>
                {cities.cities.map((city) => (
                  <SelectItem key={city.id} value={city.name} data-testid={`city-${city.id}`}>
                    {city.name}, {city.state}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 mt-2">Towns</div>
                {cities.villages.map((village) => (
                  <SelectItem key={village.id} value={village.name} data-testid={`city-${village.id}`}>
                    {village.name}, {village.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-trigger">
                    <div className="w-8 h-8 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-slate-700">{user.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="text-xs text-[#F97316] capitalize">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === 'customer' && (
                    <DropdownMenuItem onClick={() => navigate('/my-bookings')} data-testid="my-bookings-link">
                      <Calendar className="w-4 h-4 mr-2" />
                      My Bookings
                    </DropdownMenuItem>
                  )}
                  {user.role === 'provider' && (
                    <DropdownMenuItem onClick={() => navigate('/provider/dashboard')} data-testid="provider-dashboard-link">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="admin-dashboard-link">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/login')} data-testid="login-btn">
                  Login
                </Button>
                <Button className="btn-primary" onClick={() => navigate('/signup')} data-testid="signup-btn">
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-fade-in">
            {/* City Selector */}
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#1E3A8A]" />
              <Select value={selectedCity} onValueChange={(v) => { updateCity(v); }}>
                <SelectTrigger className="flex-1" data-testid="mobile-city-selector">
                  <SelectValue placeholder="Select City" />
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

            {user ? (
              <div className="space-y-2">
                <div className="px-2 py-2 bg-slate-50 rounded-lg">
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                {user.role === 'customer' && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => { navigate('/my-bookings'); setMobileMenuOpen(false); }}
                    data-testid="mobile-my-bookings"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                  </Button>
                )}
                {user.role === 'provider' && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => { navigate('/provider/dashboard'); setMobileMenuOpen(false); }}
                    data-testid="mobile-provider-dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                {user.role === 'admin' && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                    data-testid="mobile-admin-dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600"
                  onClick={handleLogout}
                  data-testid="mobile-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} data-testid="mobile-login">
                  Login
                </Button>
                <Button className="btn-primary" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} data-testid="mobile-signup">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
