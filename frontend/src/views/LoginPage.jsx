import React, { useState } from 'react';
import { 
  Laptop, 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Zap, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, register, quickLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    phoneNumber: '',
    role: 'Student'
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(loginEmail, loginPassword);
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await register(registerData);
    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Glows */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          top: '-150px',
          left: '-150px',
          pointerEvents: 'none'
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
          bottom: '-150px',
          right: '-150px',
          pointerEvents: 'none'
        }}
      ></div>

      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '36px 32px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)'
            }}
          >
            <Laptop size={28} />
          </div>

          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px'
            }}
          >
            UniReserve
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            University Equipment & Laboratory Resource Reservation System
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-row" style={{ marginBottom: '24px' }}>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            <LogIn size={15} style={{ display: 'inline', marginRight: '6px' }} />
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <UserPlus size={15} style={{ display: 'inline', marginRight: '6px' }} />
            Register Account
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">University Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. student@university.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '0.95rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to Campus Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jordan Smith"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">University Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="jordan@university.edu"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student ID Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. STU-2026-9041"
                  value={registerData.studentId}
                  onChange={(e) => setRegisterData({ ...registerData, studentId: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Faculty</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science & Eng"
                  value={registerData.department}
                  onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={registerData.phoneNumber}
                  onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password (min 6 chars) *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create a strong password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account & Sign In'}
            </button>
          </form>
        )}

        {/* 1-Click Quick Demo Switchers for Hackathon */}
        <div className="demo-credentials-box" style={{ marginTop: '24px' }}>
          <div className="demo-title">
            <Zap size={14} /> 1-Click Demo Login (Hackathon Demo)
          </div>
          <div className="demo-btn-group">
            <button
              type="button"
              className="demo-quick-btn"
              onClick={() => quickLogin('Student')}
            >
              <div style={{ fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <GraduationCap size={14} /> Student Login
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>student@university.edu</div>
            </button>

            <button
              type="button"
              className="demo-quick-btn"
              onClick={() => quickLogin('Administrator')}
            >
              <div style={{ fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={14} /> Admin Login
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>admin@university.edu</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
