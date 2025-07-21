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
  const trendColors = {
    up: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: <ArrowUp className="w-3 h-3" />
    },
    down: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: <ArrowDown className="w-3 h-3" />
    }
  };

  const color = trendColors[trend];
  const iconColors = {
    'Total Visitors': 'bg-blue-100 text-blue-600',
    'Page Views': 'bg-purple-100 text-purple-600',
    'Conversion Rate': 'bg-amber-100 text-amber-600',
    'Avg Order Value': 'bg-emerald-100 text-emerald-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <div className="h-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-200 flex flex-col">
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
              
              {change && (
                <div className={`inline-flex items-center ${color.bg} ${color.text} px-2 py-1 rounded-md text-xs font-medium`}>
                  {color.icon}
                  <span className="ml-1">{change}</span>
                </div>
              )}
            </div>
            
            <div className={`p-2 rounded-lg ${iconColors[title] || 'bg-gray-100 text-gray-600'}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          
          {/* Animated progress bar */}
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: trend === 'up' ? '75%' : '40%' }}
              transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        
        {/* Subtle gradient accent */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
}