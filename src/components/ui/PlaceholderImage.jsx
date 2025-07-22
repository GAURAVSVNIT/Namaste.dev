'use client';

import React from 'react';
import { Camera, Play, Tv } from 'lucide-react';

const PlaceholderImage = ({ 
  type = 'image', // 'image', 'video', 'stream'
  className = '',
  width = 300,
  height = 300,
  alt = 'Placeholder'
}) => {
  const getPlaceholderContent = () => {
    switch (type) {
      case 'video':
        return {
          icon: Play,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-500',
          text: 'Video'
        };
      case 'stream':
        return {
          icon: Tv,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-500',
          text: 'Live Stream'
        };
      default:
        return {
          icon: Camera,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-400',
          text: 'Image'
        };
    }
  };

  const { icon: Icon, bgColor, iconColor, text } = getPlaceholderContent();

  // Generate a simple SVG placeholder
  const generateSVGPlaceholder = () => {
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)"/>
        <circle cx="${width/2}" cy="${height/2 - 20}" r="24" fill="#cbd5e1"/>
        <text x="${width/2}" y="${height/2 + 20}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" text-anchor="middle" fill="#64748b">${text}</text>
        ${type === 'video' ? `<polygon points="${width/2 - 8},${height/2 - 20 - 8} ${width/2 + 8},${height/2 - 20} ${width/2 - 8},${height/2 - 20 + 8}" fill="white"/>` : ''}
        ${type === 'stream' ? `<circle cx="${width/2 - 6}" cy="${height/2 - 20 - 6}" r="3" fill="#ef4444"/><text x="${width/2}" y="${height/2 - 20 + 3}" font-family="system-ui" font-size="8" font-weight="bold" text-anchor="middle" fill="white">LIVE</text>` : ''}
        ${type === 'image' ? `<circle cx="${width/2}" cy="${height/2 - 20}" r="6" fill="white"/><rect x="${width/2 - 8}" y="${height/2 - 20 - 4}" width="16" height="8" rx="2" fill="white"/>` : ''}
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  return (
    <div className={`flex items-center justify-center ${bgColor} ${className}`}>
      <div className="text-center">
        <Icon className={`w-8 h-8 mx-auto mb-2 ${iconColor}`} />
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      </div>
    </div>
  );
};

// Safe base64 encoding for Unicode content
const safeBase64Encode = (str) => {
  try {
    // First try direct btoa
    return btoa(str);
  } catch (e) {
    // If that fails, encode as UTF-8 first
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    }));
  }
};

// Also export as a simple URL generator for img src
export const getPlaceholderImageUrl = (type = 'image', width = 300, height = 300) => {
  const bgColor = type === 'video' ? '%23f3e8ff' : type === 'stream' ? '%23fef2f2' : '%23f8fafc';
  const textColor = type === 'video' ? '%238b5cf6' : type === 'stream' ? '%23ef4444' : '%2364748b';
  const text = type === 'video' ? 'Fashion Video' : type === 'stream' ? 'Live Stream' : 'Fashion Look';
  
  // Use URL encoding for SVG to avoid btoa Unicode issues
  const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%25" height="100%25" fill="${bgColor}"/><text x="50%25" y="50%25" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.max(12, width * 0.04)}" font-weight="500" text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>${type === 'video' ? `<polygon points="${width/2 - width*0.03},${height/2 - height*0.05} ${width/2 + width*0.03},${height/2} ${width/2 - width*0.03},${height/2 + height*0.05}" fill="${textColor}" opacity="0.7"/>` : ''}${type === 'stream' ? `<circle cx="${width/2 - width*0.08}" cy="${height/2 - height*0.08}" r="${width*0.015}" fill="%23ef4444"/><text x="${width/2}" y="${height/2 - height*0.15}" font-family="system-ui" font-size="${Math.max(8, width*0.025)}" font-weight="bold" text-anchor="middle" fill="%23ef4444">LIVE</text>` : ''}</svg>`;
  
  return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgContent)}`;
};

export default PlaceholderImage;
