'use client';

import { useState } from 'react';
import { Ticket, X, Check, AlertCircle, Gift } from 'lucide-react';
import useCartStore from '../../store/cart-store';
import useCheckoutStore from '../../store/checkout-store';
import { formatCurrency } from '../../lib/utils';

const CouponInput = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error'
  
  const { 
    appliedCoupon, 
    couponDiscount, 
    applyCoupon, 
    removeCoupon, 
    availableCoupons,
    getCartTotal,
    getFinalTotal
  } = useCartStore();
  
  const { updateCouponDiscount } = useCheckoutStore();

  const cartTotal = getCartTotal();
  const finalTotal = getFinalTotal();

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setMessage('Please enter a coupon code');
      setMessageType('error');
      return;
    }

    const result = applyCoupon(couponCode.trim());
    
    if (result.success) {
      setMessage(`Coupon applied! You saved ${formatCurrency(result.discount)}`);
      setMessageType('success');
      setCouponCode('');
      
      // Sync with checkout store
      updateCouponDiscount();
    } else {
      setMessage(result.error);
      setMessageType('error');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setMessage('Coupon removed');
    setMessageType('error');
    
    // Sync with checkout store
    updateCouponDiscount();
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="coupon-section" style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      margin: '16px 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
    }}>
      {/* Header */}
      <div 
        className="coupon-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: isExpanded ? '16px' : '0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ticket size={18} style={{ color: '#10b981' }} />
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151' 
          }}>
            Have a Coupon?
          </span>
          {appliedCoupon && (
            <span style={{
              fontSize: '12px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: '500'
            }}>
              {appliedCoupon.code}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {couponDiscount > 0 && (
            <span style={{ 
              fontSize: '12px', 
              color: '#16a34a', 
              fontWeight: '600' 
            }}>
              -{formatCurrency(couponDiscount)}
            </span>
          )}
          <div 
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            ▼
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="coupon-content">
          {!appliedCoupon ? (
            <>
              {/* Coupon Input */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '16px' 
              }}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: couponCode.trim() ? '#10b981' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: couponCode.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (couponCode.trim()) {
                      e.target.style.backgroundColor = '#059669';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (couponCode.trim()) {
                      e.target.style.backgroundColor = '#10b981';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  Apply
                </button>
              </div>

              {/* Available Coupons */}
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  Available Coupons
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableCoupons.filter(c => c.isActive).map((coupon) => (
                    <div
                      key={coupon.code}
                      onClick={() => {
                        setCouponCode(coupon.code);
                        const result = applyCoupon(coupon.code);
                        
                        if (result.success) {
                          setMessage(`Coupon applied! You saved ${formatCurrency(result.discount)}`);
                          setMessageType('success');
                          setCouponCode('');
                          
                          // Sync with checkout store
                          updateCouponDiscount();
                        } else {
                          setMessage(result.error);
                          setMessageType('error');
                        }
                        
                        // Clear message after 3 seconds
                        setTimeout(() => {
                          setMessage('');
                          setMessageType('');
                        }, 3000);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: '#f9fafb',
                        border: '1px dashed #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.borderColor = '#10b981';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Gift size={14} style={{ color: '#10b981' }} />
                        <div>
                          <div style={{ 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            color: '#374151' 
                          }}>
                            {coupon.code}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#6b7280' 
                          }}>
                            {coupon.description}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: '#10b981' 
                      }}>
                        {coupon.type === 'percentage' 
                          ? `${coupon.value}% OFF` 
                          : `${formatCurrency(coupon.value)} OFF`
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Applied Coupon Display */
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#dcfce7',
              border: '1px solid #16a34a',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#166534' 
                  }}>
                    {appliedCoupon.code} Applied
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#166534' 
                  }}>
                    You saved {formatCurrency(couponDiscount)}
                  </div>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: messageType === 'success' ? '#dcfce7' : '#fef2f2',
              border: `1px solid ${messageType === 'success' ? '#16a34a' : '#dc2626'}`,
              borderRadius: '6px',
              fontSize: '13px',
              color: messageType === 'success' ? '#166534' : '#dc2626'
            }}>
              {messageType === 'success' ? (
                <Check size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              {message}
            </div>
          )}

          {/* Cart Summary with Discount */}
          {cartTotal > 0 && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: '#16a34a',
                  marginBottom: '4px'
                }}>
                  <span>Coupon Discount:</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <hr style={{ 
                margin: '8px 0', 
                border: 'none', 
                borderTop: '1px solid #e5e7eb' 
              }} />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                <span>Final Total:</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponInput;
