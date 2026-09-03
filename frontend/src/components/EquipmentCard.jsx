import React from 'react';
import { 
  MapPin, 
  Clock, 
  Package, 
  Info, 
  ArrowRight, 
  Laptop, 
  Camera, 
  Tv, 
  Cpu, 
  Headphones,
  AlertCircle
} from 'lucide-react';

const iconMap = {
  Laptop: Laptop,
  Camera: Camera,
  Tv: Tv,
  Cpu: Cpu,
  Headphones: Headphones,
};

export const EquipmentCard = ({ equipment, onSelect, onBookNow }) => {
  const isAvailable = equipment.status === 'Available' && equipment.availableQuantity > 0;
  const CategoryIcon = iconMap[equipment.categoryIcon] || Laptop;

  return (
    <div className="equipment-card">
      <div className="card-image-wrap" onClick={() => onSelect(equipment)} style={{ cursor: 'pointer' }}>
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          className="card-img"
          loading="lazy"
        />

        <div className="card-category-tag">
          <CategoryIcon size={13} color="#818cf8" />
          <span>{equipment.categoryName}</span>
        </div>

        <div className={`status-badge status-${equipment.status}`}>
          {equipment.status === 'Available' && (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }}></span>
              Available ({equipment.availableQuantity}/{equipment.totalQuantity})
            </>
          )}
          {equipment.status === 'Reserved' && 'Fully Reserved'}
          {equipment.status === 'Maintenance' && 'Under Maintenance'}
          {equipment.status === 'Retired' && 'Retired'}
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', fontFamily: 'monospace' }}>
            {equipment.assetTag}
          </span>
          {equipment.modelNumber && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              • {equipment.modelNumber}
            </span>
          )}
        </div>

        <h3
          className="card-title"
          onClick={() => onSelect(equipment)}
          style={{ cursor: 'pointer' }}
          title={equipment.name}
        >
          {equipment.name}
        </h3>

        <p className="card-desc">{equipment.description}</p>

        <div className="card-meta">
          <div className="card-meta-item">
            <MapPin size={14} color="#06b6d4" />
            <span>{equipment.location}</span>
          </div>

          <div className="card-meta-item">
            <Clock size={14} color="#a855f7" />
            <span>Max {equipment.maxBorrowDays} days</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button
          className="btn-secondary btn-sm"
          style={{ flex: 1 }}
          onClick={() => onSelect(equipment)}
        >
          <Info size={14} />
          Details
        </button>

        <button
          className="btn-primary btn-sm"
          style={{ flex: 1.2 }}
          disabled={!isAvailable}
          onClick={() => onBookNow(equipment)}
        >
          {isAvailable ? (
            <>
              Reserve
              <ArrowRight size={14} />
            </>
          ) : (
            'Unavailable'
          )}
        </button>
      </div>
    </div>
  );
};
