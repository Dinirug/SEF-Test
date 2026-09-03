import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './views/LoginPage';
import { StudentCatalogView } from './views/StudentCatalogView';
import { MyReservationsView } from './views/MyReservationsView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminEquipmentView } from './views/AdminEquipmentView';
import { AdminReservationsView } from './views/AdminReservationsView';
import { Laptop, Database, Server, Code2 } from 'lucide-react';

const MainApp = () => {
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('catalog');

  // Automatically adjust initial view based on role
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('catalog');
      }
    }
  }, [isAuthenticated, isAdmin]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: '#94a3b8',
          fontSize: '1.1rem'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '12px', color: '#818cf8', fontWeight: 700 }}>UniReserve</div>
          <div>Loading system resources...</div>
        </div>
      </div>
    );
  }

  // If not logged in, show dedicated standalone Login Page first
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated Application
  return (
    <div className="app-layout">
      {/* Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Container */}
      <main className="main-content">
        {currentView === 'catalog' && (
          <StudentCatalogView onViewMyBookings={() => setCurrentView('my-reservations')} />
        )}

        {currentView === 'my-reservations' && (
          <MyReservationsView onBrowseCatalog={() => setCurrentView('catalog')} />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboardView onNavigate={(view) => setCurrentView(view)} />
        )}

        {currentView === 'admin-equipment' && (
          <AdminEquipmentView />
        )}

        {currentView === 'admin-reservations' && (
          <AdminReservationsView />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(11, 15, 25, 0.95)',
          padding: '30px 20px',
          marginTop: 'auto',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}
      >
        <div
          style={{
            maxWidth: '1380px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Laptop size={15} />
            </div>
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>UniReserve Campus Platform</span>
            <span>• University Equipment & Laboratory Resource Management</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8' }}>
              <Server size={14} /> C# ASP.NET Core 8
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06b6d4' }}>
              <Database size={14} /> PostgreSQL 18
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
              <Code2 size={14} /> React.js + Vite
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
