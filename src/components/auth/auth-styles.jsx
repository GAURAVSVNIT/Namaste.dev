"use client";

import React from 'react';

export function AuthStyles() {
  return (
    <style jsx global>{`
      .auth-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 50%, #faf5ff 100%);
        padding: 1rem;
        overflow: hidden;
        perspective: 1000px;
      }

      .glass-card {
        position: relative;
        z-index: 1;
        backdrop-filter: blur(20px) saturate(200%);
        -webkit-backdrop-filter: blur(20px) saturate(200%);
        background: linear-gradient(
          to right bottom,
          rgba(255, 255, 255, 0.9),
          rgba(255, 255, 255, 0.7),
          rgba(255, 255, 255, 0.4)
        );
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 
          0 8px 32px rgba(31, 38, 135, 0.15),
          0 4px 8px rgba(0, 0, 0, 0.05),
          inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        border-radius: 24px;
        padding: 2.5rem;
        width: 100%;
        max-width: 420px;
        animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
        transform-style: preserve-3d;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .glass-card:hover {
        transform: translateY(-5px) rotateX(2deg) rotateY(2deg);
        box-shadow: 
          0 12px 40px rgba(31, 38, 135, 0.2),
          0 8px 16px rgba(0, 0, 0, 0.07),
          inset 0 0 0 1px rgba(255, 255, 255, 0.7);
      }
      
      .glass-input {
        background: rgba(255, 255, 255, 0.8) !important;
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition: all 0.3s ease !important;
        height: 48px !important;
        padding-left: 48px !important;
        font-size: 0.95rem !important;
        letter-spacing: 0.025em !important;
        border-radius: 12px !important;
      }
      
      .glass-input:focus {
        background: rgba(255, 255, 255, 0.95) !important;
        border-color: rgba(20, 184, 166, 0.8) !important;
        box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.15) !important;
        outline: none !important;
        transform: translateY(-1px);
      }

      .glass-input:hover {
        background: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(20, 184, 166, 0.4) !important;
      }
      
      .gradient-button {
        background: linear-gradient(135deg, #0f766e, #7c3aed) !important;
        border: none !important;
        transition: all 0.3s ease !important;
        color: white !important;
        height: 48px !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.025em !important;
        border-radius: 12px !important;
        position: relative;
        overflow: hidden;
      }
      
      .gradient-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0d5757, #6d28d9);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .gradient-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(15, 118, 110, 0.4) !important;
      }
      
      .gradient-button:hover::before {
        opacity: 1;
      }
      
      .gradient-button > * {
        position: relative;
        z-index: 1;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, #0f766e, #7c3aed);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(40px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `}</style>
  );
}
