import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Wrench, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Layers, 
  MapPin, 
  Package 
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export const AdminEquipmentView = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    assetTag: '',
    modelNumber: '',
    serialNumber: '',
    description: '',
    specifications: '{"Processor": "", "RAM": "", "Storage": ""}',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    location: 'Main Campus Tech Hub',
    status: 'Available',
    totalQuantity: 1,
    maxBorrowDays: 7,
    termsAndConditions: 'Student ID required upon pickup. Must be returned in clean, undamaged condition.'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error, warning } = useToast();

  const fetchCategories = async () => {
    try {
      const res = await api.get('/equipment/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEquipment = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: 100,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await api.get('/equipment', { params });
      setEquipmentList(res.data.items);
    } catch (err) {
      error('Failed to load equipment inventory.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, error]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      assetTag: `EQ-NEW-${Math.floor(100 + Math.random() * 900)}`,
      modelNumber: '',
      serialNumber: '',
      description: '',
      specifications: '{"Specs": "Standard campus configuration"}',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      location: 'Main Campus Tech Hub',
      status: 'Available',
      totalQuantity: 1,
      maxBorrowDays: 7,
      termsAndConditions: 'Student ID required upon pickup.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      assetTag: item.assetTag,
      modelNumber: item.modelNumber || '',
      serialNumber: item.serialNumber || '',
      description: item.description,
      specifications: item.specifications,
      imageUrl: item.imageUrl,
      location: item.location,
      status: item.status,
      totalQuantity: item.totalQuantity,
      maxBorrowDays: item.maxBorrowDays,
      termsAndConditions: item.termsAndConditions || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingItem) {
        await api.put(`/equipment/${editingItem.id}`, formData);
        success(`Equipment "${formData.name}" updated successfully.`);
      } else {
        await api.post('/equipment', formData);
        success(`Equipment "${formData.name}" added to inventory.`);
      }
      setIsModalOpen(false);
      fetchEquipment();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save equipment.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to remove "${item.name}" (${item.assetTag}) from active inventory?`)) {
      return;
    }

    try {
      await api.delete(`/equipment/${item.id}`);
      success(`Removed "${item.name}" from inventory.`);
      fetchEquipment();
    } catch (err) {
      error('Failed to remove equipment.');
    }
  };

  const handleToggleMaintenance = async (item) => {
    const newStatus = item.status === 'Maintenance' ? 'Available' : 'Maintenance';
    try {
      await api.put(`/equipment/${item.id}`, {
        ...item,
        status: newStatus
      });
      success(`Equipment status updated to ${newStatus}.`);
      fetchEquipment();
    } catch (err) {
      error('Failed to update maintenance status.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Equipment Inventory Management</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Add, update specifications, track asset tags, and manage campus devices.
          </p>
        </div>

        <button className="btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          Add New Equipment
        </button>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by asset tag, name, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="btn-secondary btn-sm" onClick={fetchEquipment} title="Refresh inventory">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Inventory Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment / Asset</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Total / Available</th>
              <th>Max Loan</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Loading equipment inventory...
                </td>
              </tr>
            ) : equipmentList.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No equipment matching your criteria.
                </td>
              </tr>
            ) : (
              equipmentList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: '48px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace' }}>
                          {item.assetTag} {item.modelNumber && `• ${item.modelNumber}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ color: '#cbd5e1' }}>{item.categoryName}</span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#94a3b8' }}>
                      <MapPin size={13} color="#06b6d4" />
                      <span>{item.location}</span>
                    </div>
                  </td>

                  <td>
                    <span className={`status-badge status-${item.status}`} style={{ position: 'static', padding: '3px 8px', fontSize: '0.72rem' }}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <strong>{item.availableQuantity}</strong> / {item.totalQuantity} units
                  </td>

                  <td>
                    {item.maxBorrowDays} days
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => handleToggleMaintenance(item)}
                        title={item.status === 'Maintenance' ? 'Mark Available' : 'Set to Maintenance'}
                      >
                        <Wrench size={13} color={item.status === 'Maintenance' ? '#10b981' : '#f59e0b'} />
                      </button>

                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => handleOpenEditModal(item)}
                        title="Edit equipment"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        className="btn-danger btn-sm"
                        onClick={() => handleDelete(item)}
                        title="Delete equipment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingItem ? <Edit3 size={18} /> : <Plus size={18} />}
                {editingItem ? `Edit Equipment: ${editingItem.name}` : 'Add New Campus Equipment'}
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Equipment Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sony FX3 Cinema Camera Kit"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Asset Tag Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. EQ-CAM-005"
                      value={formData.assetTag}
                      onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ILME-FX3"
                      value={formData.modelNumber}
                      onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Quantity in Fleet</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-input"
                      value={formData.totalQuantity}
                      onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value, 10) || 1 })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max Borrow Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      className="form-input"
                      value={formData.maxBorrowDays}
                      onChange={(e) => setFormData({ ...formData, maxBorrowDays: parseInt(e.target.value, 10) || 7 })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Campus Location</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Media Center - Room 204"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Under Maintenance</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (Unsplash or direct image link)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Detailed summary of equipment condition, included cables, and recommended use..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Specifications (JSON Format or Key-Value text)</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder='{"Sensor": "Full-Frame 12.1MP", "Mount": "Sony E"}'
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Terms & Return Conditions</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Must be returned in carrying case with all lens caps."
                    value={formData.termsAndConditions}
                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Equipment...' : editingItem ? 'Update Equipment' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
