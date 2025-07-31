'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  trend = 'up',
  delay = 0 
}) {
  const trendStyles = {
    up: {
      bg: { backgroundColor: '#f0fdf4' },
      text: { color: '#16a34a' },
      icon: <ArrowUp style={{ width: '12px', height: '12px' }} />
    },
    down: {
      bg: { backgroundColor: '#fef2f2' },
      text: { color: '#dc2626' },
      icon: <ArrowDown style={{ width: '12px', height: '12px' }} />
    },
    neutral: {
      bg: { backgroundColor: '#f9fafb' },
      text: { color: '#6b7280' },
      icon: <div style={{ width: '12px', height: '12px', backgroundColor: '#9ca3af', borderRadius: '50%' }} />
    }
  };

  const color = trendStyles[trend] || trendStyles.neutral;
  const iconStyles = {
    'Total Visitors': { backgroundColor: '#dbeafe', color: '#2563eb' },
    'Page Views': { backgroundColor: '#f3e8ff', color: '#9333ea' },
    'Conversion Rate': { backgroundColor: '#fef3c7', color: '#d97706' },
    'Avg Order Value': { backgroundColor: '#dcfce7', color: '#16a34a' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
whileHover={{ y: -4 }}
      style={{ height: '100%' }}
    >
      <div style={{
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #f3f4f6',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>{title}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{value}</p>
              {change && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  ...color.bg,
                  ...color.text,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {color.icon}
                  <span style={{ marginLeft: '0.25rem' }}>{change}</span>
                </div>
              )}
            </div>
            <div style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              ...iconStyles[title],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon style={{ width: '20px', height: '20px' }} />
            </div>
          </div>
          <div style={{
            marginTop: '1rem',
            width: '100%',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.75rem',
            height: '0.375rem',
            overflow: 'hidden'
          }}>
            <motion.div 
              style={{
                height: '100%',
                borderRadius: '0.75rem',
                backgroundColor: trend === 'up' ? '#10b981' : trend === 'down' ? '#f87171' : '#9ca3af'
              }}
              initial={{ width: 0 }}
              animate={{ width: 
                trend === 'up' ? '75%' : 
                trend === 'down' ? '40%' : 
                '60%'
              }}
              transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div style={{
          height: '4px',
          backgroundColor: '#6366f1',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }} />
      </div>
    </motion.div>
  );
}