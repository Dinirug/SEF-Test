import React from 'react';
import { Search, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const HeroBanner = ({ searchTerm, setSearchTerm, onSearchSubmit, totalAvailable }) => {
  return (
    <div className="hero-section">
      <div className="hero-glow"></div>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-badge">
          <Sparkles size={14} color="#818cf8" />
          <span>Official University Equipment Reservation System</span>
        </div>

        <h1 className="hero-title">
          Reserve High-End Tech & Lab Equipment for Your Coursework
        </h1>

        <p className="hero-subtitle">
          Access laptops, 4K cinema cameras, digital oscilloscopes, VR headsets, and laboratory sensors with instant availability checks and hassle-free pickup.
        </p>

        <form
          className="hero-search-box"
          onSubmit={(e) => {
            e.preventDefault();
            if (onSearchSubmit) onSearchSubmit();
          }}
        >
          <Search size={20} color="#94a3b8" style={{ alignSelf: 'center', marginLeft: '6px' }} />
          <input
            type="text"
            className="hero-search-input"
            placeholder="Search by equipment name, model, asset tag, or specs (e.g. MacBook, Sony A7, Oscilloscope)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </button>
          )}
          <button type="submit" className="btn-primary">
            Search
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px', fontSize: '0.88rem', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Instant Availability Checking</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#06b6d4" />
            <span>Authenticated Student Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
