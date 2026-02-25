import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, servicesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Users, Calendar, TrendingUp, Wallet, 
  CheckCircle, XCircle, Clock, Star,
  Plus, Trash2, Settings, BarChart3
} from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commission, setCommission] = useState(15);
  const [savingCommission, setSavingCommission] = useState(false);

  // New category/sub-service form
  const [newCategory, setNewCategory] = useState({ name: '', icon: '', description: '' });
  const [newSubService, setNewSubService] = useState({ category_id: '', name: '', description: '', icon: '' });
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingSubService, setAddingSubService] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, providersRes, bookingsRes, categoriesRes, subServicesRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getProviders(),
        adminApi.getBookings(),
        servicesApi.getCategories(),
        servicesApi.getAllSubServices()
      ]);
      setAnalytics(analyticsRes.data);
      setProviders(providersRes.data);
      setBookings(bookingsRes.data);
      setCategories(categoriesRes.data);
      setSubServices(subServicesRes.data);
      setCommission(analyticsRes.data.commission_percentage);
    } catch (error) {
      console.error('Failed to fetch data');
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (providerId) => {
    try {
      await adminApi.approveProvider(providerId);
      toast.success('Provider approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve provider');
    }
  };

  const handleRejectProvider = async (providerId) => {
    try {
      await adminApi.rejectProvider(providerId);
      toast.success('Provider rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject provider');
    }
  };

  const handleUpdateCommission = async () => {
    setSavingCommission(true);
    try {
      await adminApi.updateCommission(commission);
      toast.success('Commission updated!');
    } catch (error) {
      toast.error('Failed to update commission');
    } finally {
      setSavingCommission(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.icon) {
      toast.error('Please fill name and icon');
      return;
    }
    setAddingCategory(true);
    try {
      await adminApi.createCategory(newCategory);
      toast.success('Category added!');
      setNewCategory({ name: '', icon: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddSubService = async () => {
    if (!newSubService.category_id || !newSubService.name) {
      toast.error('Please fill all required fields');
      return;
    }
    setAddingSubService(true);
    try {
      await adminApi.createSubService(newSubService);
      toast.success('Sub-service added!');
      setNewSubService({ category_id: '', name: '', description: '', icon: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add sub-service');
    } finally {
      setAddingSubService(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category and all its sub-services?')) return;
    try {
      await adminApi.deleteCategory(categoryId);
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSubService = async (subServiceId) => {
    if (!window.confirm('Delete this sub-service?')) return;
    try {
      await adminApi.deleteSubService(subServiceId);
      toast.success('Sub-service deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete sub-service');
    }
  };

  const pendingProviders = providers.filter(p => !p.is_approved);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#0F172A]"
            style={{ fontFamily: 'Poppins' }}
            data-testid="admin-dashboard-title"
          >
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Manage VOKZO platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{analytics?.total_users || 0}</p>
                <p className="text-xs text-slate-500">Total Users</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{analytics?.approved_providers || 0}</p>
                <p className="text-xs text-slate-500">Active Providers</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{analytics?.total_bookings || 0}</p>
                <p className="text-xs text-slate-500">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F97316]/10 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#F97316]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">₹{analytics?.total_revenue?.toFixed(0) || 0}</p>
                <p className="text-xs text-slate-500">Platform Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="providers" data-testid="tab-providers">
              Providers {pendingProviders.length > 0 && `(${pendingProviders.length})`}
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          {/* Providers Tab */}
          <TabsContent value="providers">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                  Provider Management
                </h2>
              </div>
              
              {providers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No providers registered yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {providers.map((provider) => (
                    <div key={provider.id} className="p-4 hover:bg-slate-50" data-testid={`provider-row-${provider.id}`}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                            <span className="text-white font-medium">
                              {provider.full_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{provider.full_name}</p>
                            <p className="text-sm text-slate-500">{provider.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">{provider.sub_service_name || provider.category_name}</span>
                          <span className="text-slate-600">{provider.city}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{provider.rating || 'New'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {provider.is_approved ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Approved
                            </span>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveProvider(provider.id)}
                                className="bg-green-500 hover:bg-green-600 text-white"
                                data-testid={`approve-${provider.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectProvider(provider.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                data-testid={`reject-${provider.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                  All Bookings
                </h2>
              </div>
              
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No bookings yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 hover:bg-slate-50">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-800">{booking.sub_service_name}</p>
                          <p className="text-sm text-slate-500">
                            {booking.customer_name} → {booking.provider_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">{booking.booking_date}</span>
                          <span className="text-slate-600">{booking.city}</span>
                          <span className="font-medium text-[#1E3A8A]">₹{booking.base_price}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid gap-6">
              {/* Categories */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                    Service Categories
                  </h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="btn-primary" data-testid="add-category-btn">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="e.g., Home Services"
                            data-testid="new-category-name"
                          />
                        </div>
                        <div>
                          <Label>Icon (Lucide icon name)</Label>
                          <Input
                            value={newCategory.icon}
                            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                            placeholder="e.g., Home, Wrench, Car"
                            data-testid="new-category-icon"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            placeholder="Brief description"
                            data-testid="new-category-desc"
                          />
                        </div>
                        <Button
                          className="w-full btn-primary"
                          onClick={handleAddCategory}
                          disabled={addingCategory}
                          data-testid="submit-category"
                        >
                          {addingCategory ? 'Adding...' : 'Add Category'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{cat.name}</p>
                        <p className="text-sm text-slate-500">{cat.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-600 hover:bg-red-50"
                        data-testid={`delete-cat-${cat.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-services */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Poppins' }}>
                    Sub-Services
                  </h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="btn-primary" data-testid="add-sub-service-btn">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Sub-Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Sub-Service</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={newSubService.category_id}
                            onValueChange={(v) => setNewSubService({ ...newSubService, category_id: v })}
                          >
                            <SelectTrigger data-testid="new-sub-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={newSubService.name}
                            onChange={(e) => setNewSubService({ ...newSubService, name: e.target.value })}
                            placeholder="e.g., Plumber"
                            data-testid="new-sub-name"
                          />
                        </div>
                        <div>
                          <Label>Icon</Label>
                          <Input
                            value={newSubService.icon}
                            onChange={(e) => setNewSubService({ ...newSubService, icon: e.target.value })}
                            placeholder="e.g., Wrench"
                            data-testid="new-sub-icon"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={newSubService.description}
                            onChange={(e) => setNewSubService({ ...newSubService, description: e.target.value })}
                            placeholder="Brief description"
                            data-testid="new-sub-desc"
                          />
                        </div>
                        <Button
                          className="w-full btn-primary"
                          onClick={handleAddSubService}
                          disabled={addingSubService}
                          data-testid="submit-sub-service"
                        >
                          {addingSubService ? 'Adding...' : 'Add Sub-Service'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {subServices.map((sub) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{sub.name}</p>
                        <p className="text-sm text-slate-500">{sub.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSubService(sub.id)}
                        className="text-red-600 hover:bg-red-50"
                        data-testid={`delete-sub-${sub.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-[#0F172A] mb-6" style={{ fontFamily: 'Poppins' }}>
                Platform Settings
              </h2>
              
              <div className="max-w-md space-y-6">
                {/* Commission Settings */}
                <div className="space-y-2">
                  <Label>Commission Percentage (%)</Label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      value={commission}
                      onChange={(e) => setCommission(parseFloat(e.target.value))}
                      min="0"
                      max="100"
                      className="w-32"
                      data-testid="commission-input"
                    />
                    <Button
                      onClick={handleUpdateCommission}
                      disabled={savingCommission}
                      className="btn-primary"
                      data-testid="save-commission"
                    >
                      {savingCommission ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">
                    This percentage will be deducted from each completed booking.
                  </p>
                </div>

                {/* Analytics Summary */}
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="font-medium text-slate-800 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-500">Pending Approvals</p>
                      <p className="text-2xl font-bold text-[#F97316]">{analytics?.pending_providers || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-500">Pending Bookings</p>
                      <p className="text-2xl font-bold text-yellow-600">{analytics?.pending_bookings || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-500">Completed Bookings</p>
                      <p className="text-2xl font-bold text-green-600">{analytics?.completed_bookings || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-500">Total Customers</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics?.total_customers || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
