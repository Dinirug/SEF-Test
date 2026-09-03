import React, { useState } from 'react';
import { X, LogIn, UserPlus, Lock, Mail, User, BookOpen, Building2, Phone, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, login, register, quickLogin } = useAuth();

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

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
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {authModalTab === 'login' ? (
              <>
                <LogIn size={20} color="#818cf8" />
                Sign in to UniReserve
              </>
            ) : (
              <>
                <UserPlus size={20} color="#818cf8" />
                Create University Account
              </>
            )}
          </div>
          <button className="modal-close-btn" onClick={closeAuthModal}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Switcher */}
          <div className="auth-tab-row">
            <button
              className={`auth-tab ${authModalTab === 'login' ? 'active' : ''}`}
              onClick={() => setAuthModalTab('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${authModalTab === 'register' ? 'active' : ''}`}
              onClick={() => setAuthModalTab('register')}
            >
              Register
            </button>
          </div>

          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">University Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@university.edu"
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
                style={{ width: '100%', marginTop: '8px', padding: '12px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
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
                  <label className="form-label">Department / Faculty</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science & Eng"
                    value={registerData.department}
                    onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                  />
                </div>

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
              </div>

              <div className="form-group">
                <label className="form-label">Password (min 6 characters)</label>
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

          {/* Quick Demo Credentials Box */}
          <div className="demo-credentials-box">
            <div className="demo-title">
              <Zap size={14} /> Quick Demo Logins (Hackathon Testing)
            </div>
            <div className="demo-btn-group">
              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => quickLogin('Student')}
              >
                <div style={{ fontWeight: 700, color: '#818cf8' }}>🎓 Student Account</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>student@university.edu</div>
              </button>

              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => quickLogin('Administrator')}
              >
                <div style={{ fontWeight: 700, color: '#34d399' }}>🛡️ Admin Account</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>admin@university.edu</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
