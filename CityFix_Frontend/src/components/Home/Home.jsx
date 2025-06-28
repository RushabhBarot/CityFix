import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import Button from '../UI/Button';
import { MapPin, Users, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import './Home.css';

const API_BASE = 'http://localhost:8080';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    activeWorkers: 0,
    totalDepartments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/stats/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalReports: data.totalReports || 0,
            resolvedReports: data.resolvedReports || 0,
            activeWorkers: data.activeWorkers || 0,
            totalDepartments: data.totalDepartments || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use fallback values if API fails
        setStats({
          totalReports: 0,
          resolvedReports: 0,
          activeWorkers: 0,
          totalDepartments: 6
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: MapPin,
      title: 'Report Issues',
      description: 'Easily report city issues with photos and location details'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Work together with your community to improve the city'
    },
    {
      icon: Shield,
      title: 'Track Progress',
      description: 'Monitor the status of your reports in real-time'
    },
    {
      icon: TrendingUp,
      title: 'City Improvement',
      description: 'Help make your city better for everyone'
    }
  ];

  const statsData = [
    { number: `${stats.totalReports}+`, label: 'Reports Filed' },
    { number: `${stats.resolvedReports}+`, label: 'Issues Resolved' },
    { number: `${stats.activeWorkers}+`, label: 'Active Workers' },
    { number: `${stats.totalDepartments}+`, label: 'Departments' }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">CityFix</span>
          </h1>
          <p className="hero-subtitle">
            Your platform for reporting and tracking city issues. Help make our community better, one report at a time.
          </p>
          <div className="hero-actions">
            {user ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                size="large"
                className="hero-btn primary"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/register')}
                  size="large"
                  className="hero-btn primary"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  size="large"
                  variant="outline"
                  className="hero-btn secondary"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">
            <MapPin className="w-24 h-24 text-blue-500" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose CityFix?</h2>
          <p>Everything you need to make your city better</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-number">{loading ? '...' : stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to make a difference?</h2>
          <p>Join thousands of citizens who are already improving their communities</p>
          {!user && (
            <Button 
              onClick={() => navigate('/register')}
              size="large"
              className="cta-btn"
            >
              Start Reporting Today
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 