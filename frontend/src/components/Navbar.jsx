import React from 'react';
import { 
  Laptop, 
  CalendarCheck, 
  LayoutDashboard, 
  Layers, 
  ClipboardList, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, isAdmin, logout, quickLogin, openAuthModal } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <div className="brand-logo" onClick={() => setCurrentView(isAdmin ? 'admin-dashboard' : 'catalog')}>
          <div className="brand-icon">
            <Laptop size={22} />
          </div>
          <div className="brand-title">
            UniReserve
            <span className="brand-badge">Campus Gear</span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="nav-links">
          <button
            className={`nav-btn ${currentView === 'catalog' ? 'active' : ''}`}
            onClick={() => setCurrentView('catalog')}
          >
            <Laptop size={16} />
            Browse Equipment
          </button>

          {isAuthenticated && !isAdmin && (
            <button
              className={`nav-btn ${currentView === 'my-reservations' ? 'active' : ''}`}
              onClick={() => setCurrentView('my-reservations')}
            >
              <CalendarCheck size={16} />
              My Bookings
            </button>
          )}

          {isAdmin && (
            <>
              <button
                className={`nav-btn ${currentView === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin-dashboard')}
              >
                <LayoutDashboard size={16} />
                Admin Dashboard
              </button>
              <button
                className={`nav-btn ${currentView === 'admin-equipment' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin-equipment')}
              >
                <Layers size={16} />
                Inventory
              </button>
              <button
                className={`nav-btn ${currentView === 'admin-reservations' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin-reservations')}
              >
                <ClipboardList size={16} />
                All Reservations
              </button>
            </>
          )}
        </div>

        {/* Auth & Demo switchers */}
        <div className="nav-actions">
          {/* Quick Demo Switchers for hackathon judging convenience */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn-secondary btn-sm"
              onClick={() => {
                quickLogin('Student');
                setCurrentView('catalog');
              }}
              title="Quickly test as University Student"
            >
              <GraduationCap size={14} color="#818cf8" />
              <span>Student Demo</span>
            </button>

            <button
              className="btn-secondary btn-sm"
              onClick={() => {
                quickLogin('Administrator');
                setCurrentView('admin-dashboard');
              }}
              title="Quickly test as IT Administrator"
            >
              <ShieldCheck size={14} color="#34d399" />
              <span>Admin Demo</span>
            </button>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-pill">
                <div className="user-avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.fullName.split(' ')[0]}</span>
                  <span className="user-role-badge">
                    {isAdmin ? '🛡️ Administrator' : '🎓 Student'}
                  </span>
                </div>
              </div>

              <button
                className="btn-secondary btn-sm"
                onClick={logout}
                title="Sign out"
                style={{ padding: '8px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-secondary btn-sm"
                onClick={() => openAuthModal('login')}
              >
                <LogIn size={15} />
                Sign In
              </button>
              <button
                className="btn-primary btn-sm"
                onClick={() => openAuthModal('register')}
              >
                <UserPlus size={15} />
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
