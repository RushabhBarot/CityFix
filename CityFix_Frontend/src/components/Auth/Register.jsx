import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import apiService from '../../services/apiService';
import Input from '../UI/Input';
import Button from '../UI/Button';
import FileUpload from '../UI/FileUpload';
import { User, Mail, Lock, Phone, Building2, Shield, CheckCircle } from 'lucide-react';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    role: 'USER',
    department: '',
    profilePhoto: null,
    idCard: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (field) => (file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }
    
    if (formData.role === 'WORKER') {
      if (!formData.department) {
        newErrors.department = 'Department is required for workers';
      }
      if (!formData.idCard) {
        newErrors.idCard = 'ID card is required for workers';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('mobileNumber', formData.mobileNumber);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('profilePhoto', formData.profilePhoto);
      
      if (formData.role === 'WORKER') {
        formDataToSend.append('department', formData.department);
        formDataToSend.append('idCard', formData.idCard);
      }
      
      const response = await apiService.register(formDataToSend);
      login(response);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Report city issues with ease",
    "Track progress of your reports",
    "Connect with local community",
    "Get updates on city improvements"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 p-12 text-white">
        <div className="max-w-md mx-auto flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              Join CityFix Today
            </h1>
            <p className="text-xl text-green-100 leading-relaxed">
              Be part of the solution. Help make our city better for everyone.
            </p>
          </div>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-green-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CityFix</h1>
            <p className="text-gray-600">Create your account</p>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Join CityFix and start making a difference</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                  placeholder="Enter your full name"
                  icon={User}
                  required
                />

                <Input
                  label="Mobile Number"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={handleChange('mobileNumber')}
                  error={errors.mobileNumber}
                  placeholder="Enter your mobile number"
                  icon={Phone}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
                placeholder="Enter your email"
                icon={Mail}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={errors.password}
                  placeholder="Enter your password"
                  icon={Lock}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  icon={Lock}
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={handleChange('role')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="USER">Citizen</option>
                    <option value="WORKER">Worker</option>
                  </select>
                </div>

                {formData.role === 'WORKER' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={handleChange('department')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="WASTE_MANAGEMENT">Waste Management</option>
                      <option value="ROAD_MAINTENANCE">Road Maintenance</option>
                      <option value="WATER_SUPPLY">Water Supply</option>
                      <option value="ELECTRICITY">Electricity</option>
                      <option value="PUBLIC_SAFETY">Public Safety</option>
                      <option value="PARKS_RECREATION">Parks & Recreation</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <FileUpload
                  label="Profile Photo"
                  onChange={handleFileChange('profilePhoto')}
                  accept="image/*"
                  icon={User}
                />

                {formData.role === 'WORKER' && (
                  <FileUpload
                    label="ID Card"
                    onChange={handleFileChange('idCard')}
                    accept="image/*,.pdf"
                    icon={Shield}
                    required
                  />
                )}
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                loading={loading}
                className="w-full"
                size="large"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 CityFix. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;