'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  MapPin, 
  Plus, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Building,
  User,
  Mail,
  Phone,
  Home,
  Save,
  RefreshCw
} from 'lucide-react';
import styles from './Settings.module.css';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Andaman and Nicobar Islands'
];

function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState('pickup-locations');
  const [pickupLocations, setPickupLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    pickup_location: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    address_2: '',
    city: '',
    state: '',
    country: 'India',
    pin_code: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch pickup locations
  const fetchPickupLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shiprocket/pickup-locations');
      const result = await response.json();

      if (result.success) {
        setPickupLocations(result.data);
      } else {
        showAlert('error', result.error || 'Failed to fetch pickup locations');
      }
    } catch (error) {
      console.error('Error fetching pickup locations:', error);
      showAlert('error', 'Failed to fetch pickup locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pickup-locations') {
      fetchPickupLocations();
    }
  }, [activeTab]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = 'Pickup location name is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Contact name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.pin_code.trim()) {
      newErrors.pin_code = 'PIN code is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pin_code)) {
      newErrors.pin_code = 'Please enter a valid 6-digit PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/shiprocket/pickup-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        showAlert('success', 'Pickup location added successfully');
        setFormData({
          pickup_location: '',
          name: '',
          email: '',
          phone: '',
          address: '',
          address_2: '',
          city: '',
          state: '',
          country: 'India',
          pin_code: ''
        });
        setShowAddForm(false);
        fetchPickupLocations();
      } else {
        showAlert('error', result.error || 'Failed to add pickup location');
      }
    } catch (error) {
      console.error('Error adding pickup location:', error);
      showAlert('error', 'Failed to add pickup location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pickup_location: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      address_2: '',
      city: '',
      state: '',
      country: 'India',
      pin_code: ''
    });
    setErrors({});
    setShowAddForm(false);
  };

  const tabs = [
    {
      id: 'pickup-locations',
      label: 'Pickup Locations',
      icon: <MapPin size={16} />
    },
    {
      id: 'general',
      label: 'General Settings',
      icon: <Settings size={16} />
    }
  ];

  return (
    <div className={styles.settingsContainer}>
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your store settings and configurations</p>
      </motion.header>

      {/* Alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`${styles.alert} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}
          >
            {alert.type === 'success' && <CheckCircle size={16} />}
            {alert.type === 'error' && <AlertCircle size={16} />}
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        <AnimatePresence mode="wait">
          {activeTab === 'pickup-locations' && (
            <motion.div
              key="pickup-locations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Pickup Locations Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>
                      <MapPin size={20} />
                      Pickup Locations
                    </h2>
                    <p className={styles.sectionDescription}>
                      Manage your warehouse and pickup locations for order fulfillment
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={fetchPickupLocations}
                      disabled={isLoading}
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      title="Refresh locations"
                    >
                      <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      <Plus size={16} />
                      Add Location
                    </button>
                  </div>
                </div>

                {/* Add Location Form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            Pickup Location Name <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.pickup_location}
                            onChange={(e) => handleInputChange('pickup_location', e.target.value)}
                            className={`${styles.input} ${errors.pickup_location ? styles.error : ''}`}
                            placeholder="e.g., Main Warehouse"
                          />
                          {errors.pickup_location && (
                            <span className={styles.errorText}>{errors.pickup_location}</span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            Contact Name <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`${styles.input} ${errors.name ? styles.error : ''}`}
                            placeholder="Contact person name"
                          />
                          {errors.name && (
                            <span className={styles.errorText}>{errors.name}</span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            Email <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`${styles.input} ${errors.email ? styles.error : ''}`}
                            placeholder="contact@example.com"
                          />
                          {errors.email && (
                            <span className={styles.errorText}>{errors.email}</span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            Phone Number <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                            placeholder="9876543210"
                          />
                          {errors.phone && (
                            <span className={styles.errorText}>{errors.phone}</span>
                          )}
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                          <label className={styles.label}>
                            Address <span className={styles.required}>*</span>
                          </label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className={`${styles.textarea} ${errors.address ? styles.error : ''}`}
                            placeholder="Enter full address"
                            rows={3}
                          />
                          {errors.address && (
                            <span className={styles.errorText}>{errors.address}</span>
                          )}
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                          <label className={styles.label}>Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            value={formData.address_2}
                            onChange={(e) => handleInputChange('address_2', e.target.value)}
                            className={styles.input}
                            placeholder="Apartment, suite, etc."
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            City <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className={`${styles.input} ${errors.city ? styles.error : ''}`}
                            placeholder="City name"
                          />
                          {errors.city && (
                            <span className={styles.errorText}>{errors.city}</span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            State <span className={styles.required}>*</span>
                          </label>
                          <select
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className={`${styles.select} ${errors.state ? styles.error : ''}`}
                          >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((state) => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          {errors.state && (
                            <span className={styles.errorText}>{errors.state}</span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Country</label>
                          <input
                            type="text"
                            value={formData.country}
                            readOnly
                            className={styles.input}
                            style={{ background: '#f9fafb', color: '#6b7280' }}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            PIN Code <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.pin_code}
                            onChange={(e) => handleInputChange('pin_code', e.target.value)}
                            className={`${styles.input} ${errors.pin_code ? styles.error : ''}`}
                            placeholder="123456"
                          />
                          {errors.pin_code && (
                            <span className={styles.errorText}>{errors.pin_code}</span>
                          )}
                        </div>

                        <div className={`${styles.formActions} ${styles.fullWidth}`}>
                          <button
                            type="button"
                            onClick={resetForm}
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${styles.button} ${styles.buttonPrimary}`}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Add Location
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pickup Locations List */}
                {isLoading ? (
                  <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                  </div>
                ) : pickupLocations.length > 0 ? (
                  <div className={styles.pickupLocationsList}>
                    {pickupLocations.map((location) => (
                      <motion.div
                        key={location.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={styles.pickupLocationCard}
                      >
                        <div className={styles.pickupLocationHeader}>
                          <h3 className={styles.pickupLocationName}>
                            {location.pickup_location}
                          </h3>
                          <span className={`${styles.pickupLocationStatus} ${location.status === 1 ? styles.statusActive : styles.statusInactive}`}>
                            {location.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className={styles.pickupLocationDetails}>
                          <div className={styles.pickupLocationAddress}>
                            <p>{location.address}</p>
                            {location.address_2 && <p>{location.address_2}</p>}
                            <p>{location.city}, {location.state} - {location.pin_code}</p>
                            <p>{location.country}</p>
                          </div>
                          
                          <div className={styles.pickupLocationContact}>
                            <p><User size={12} style={{ display: 'inline', marginRight: '4px' }} /> {location.name}</p>
                            <p><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} /> {location.email}</p>
                            <p><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> {location.phone}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <MapPin className={styles.emptyStateIcon} />
                    <h3 className={styles.emptyStateTitle}>No pickup locations found</h3>
                    <p className={styles.emptyStateDescription}>
                      Add your first pickup location to start fulfilling orders.
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      <Plus size={16} />
                      Add Your First Location
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>
                      <Settings size={20} />
                      General Settings
                    </h2>
                    <p className={styles.sectionDescription}>
                      Configure your store's general settings
                    </p>
                  </div>
                </div>
                
                <div className={styles.emptyState}>
                  <Settings className={styles.emptyStateIcon} />
                  <h3 className={styles.emptyStateTitle}>Coming Soon</h3>
                  <p className={styles.emptyStateDescription}>
                    General settings panel will be available in the next update.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Main component with role protection
export default function SettingsPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.MERCHANT, USER_ROLES.ADMIN]}>
      <SettingsPageContent />
    </RoleProtected>
  );
}
