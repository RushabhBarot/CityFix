import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import apiService from '../../services/apiService';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { Mail, Lock, Building2, Users, Shield, MapPin } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseJwt = (token) => {
    if (!token) return {};
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await apiService.login(formData);
      login(response);
      // Role-based redirect using the role from the response
      const jwtPayload = parseJwt(response.accessToken);
      console.log('Login - JWT payload:', jwtPayload);
      let role = null;
      
      // Try different ways to extract role from JWT
      if (jwtPayload.roles && Array.isArray(jwtPayload.roles) && jwtPayload.roles.length > 0) {
        role = jwtPayload.roles[0];
        console.log('Login - Found role in roles array:', role);
      } else if (typeof jwtPayload.roles === 'string') {
        role = jwtPayload.roles;
        console.log('Login - Found role as string:', role);
      } else if (typeof jwtPayload.role === 'string') {
        role = jwtPayload.role;
        console.log('Login - Found role in role field:', role);
      } else {
        console.warn('Login - No role found in JWT payload');
      }
      
      // Remove ROLE_ prefix if present (Spring Security adds this)
      if (role && role.startsWith('ROLE_')) {
        role = role.substring(5);
        console.log('Login - Removed ROLE_ prefix, role is now:', role);
      }
      
      if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (role === 'WORKER') {
        navigate('/worker-dashboard');
      } else if (role === 'USER' || role === 'CITIZEN') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard'); // Default fallback
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Report Issues",
      description: "Easily report city issues with location tracking"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Track Progress",
      description: "Monitor the status of your reported issues"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community",
      description: "Connect with your local community"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure",
      description: "Your data is protected with enterprise security"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 text-white">
        <div className="max-w-md mx-auto flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              Welcome to CityFix
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Your platform for making our city better, one report at a time.
            </p>
          </div>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CityFix</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your CityFix account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Create account
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

export default Login;