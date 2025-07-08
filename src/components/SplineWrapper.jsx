'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SplineModel with no SSR
const SplineModel = dynamic(() => import('./SplineModel'), {
  ssr: false,
  loading: () => <div>Loading 3D model...</div>
});

export default function SplineWrapper() {
  return (
    <div>
      <SplineModel />
    </div>
  );
}