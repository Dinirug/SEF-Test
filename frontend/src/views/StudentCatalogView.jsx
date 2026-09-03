import React, { useState, useEffect, useCallback } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryFilter } from '../components/CategoryFilter';
import { EquipmentCard } from '../components/EquipmentCard';
import { EquipmentDetailModal } from '../components/EquipmentDetailModal';
import { BookingSuccessModal } from '../components/BookingSuccessModal';
import { PackageSearch, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export const StudentCatalogView = ({ onViewMyBookings }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const { error } = useToast();

  const fetchCategories = async () => {
    try {
      const res = await api.get('/equipment/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchEquipment = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: 40,
        sortBy: sortBy,
        sortDescending: sortBy === 'date',
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/equipment', { params });
      setEquipmentList(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      error('Failed to load equipment catalog.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy, statusFilter, error]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  return (
    <div>
      {/* Hero Banner with search */}
      <HeroBanner
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchSubmit={fetchEquipment}
        totalAvailable={totalCount}
      />

      {/* Category Chips */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalCount={totalCount}
      />

      {/* Filter & Sort Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name || 'Equipment Catalog'
              : 'All Equipment'}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>({totalCount} items)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status filter */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available Now</option>
            <option value="Reserved">Currently Reserved</option>
            <option value="Maintenance">In Maintenance</option>
          </select>

          {/* Sort By */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name (A-Z)</option>
            <option value="popular">Sort by Popularity</option>
            <option value="date">Sort by Newest</option>
          </select>

          <button
            className="btn-secondary btn-sm"
            onClick={fetchEquipment}
            title="Refresh list"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Equipment List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Loading Equipment Catalog...</div>
          <p style={{ fontSize: '0.85rem' }}>Fetching real-time inventory from PostgreSQL backend</p>
        </div>
      ) : equipmentList.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            margin: '20px 0'
          }}
        >
          <PackageSearch size={48} color="#64748b" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Equipment Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 16px auto' }}>
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            className="btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory(null);
              setStatusFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="equipment-grid">
          {equipmentList.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onSelect={setSelectedEquipment}
              onBookNow={setSelectedEquipment}
            />
          ))}
        </div>
      )}

      {/* Equipment Detail & Booking Modal */}
      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onBookingSuccess={(res) => {
            setConfirmedReservation(res);
            fetchEquipment();
          }}
        />
      )}

      {/* Booking Success Celebration Pass Modal */}
      {confirmedReservation && (
        <BookingSuccessModal
          reservation={confirmedReservation}
          onClose={() => setConfirmedReservation(null)}
          onViewMyBookings={onViewMyBookings}
        />
      )}
    </div>
  );
};
