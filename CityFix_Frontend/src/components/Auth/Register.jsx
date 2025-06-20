import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import apiService from '../../services/apiService';
import Input from '../UI/Input';
import Button from '../UI/Button';
import FileUpload from '../UI/FileUpload';
import { User, Mail, Lock, Phone } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 max-h-screen overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join CityFix</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit}>
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
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            placeholder="Enter your email"
            icon={Mail}
            required
          />

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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={handleChange('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USER">Citizen</option>
              <option value="WORKER">Worker</option>
            </select>
          </div>

          {formData.role === 'WORKER' && (
            <Input
              label="Department"
              value={formData.department}
              onChange={handleChange('department')}
              error={errors.department}
              placeholder="Enter your department"
              required
            />
          )}

          <FileUpload
            label="Profile Photo"
            onChange={handleFileChange('profilePhoto')}
            error={errors.profilePhoto}
            accept="image/*"
            required
          />

          {formData.role === 'WORKER' && (
            <FileUpload
              label="ID Card"
              onChange={handleFileChange('idCard')}
              error={errors.idCard}
              accept="image/*"
              required
            />
          )}

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button type="submit" loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;