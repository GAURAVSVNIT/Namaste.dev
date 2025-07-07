'use client';
import Spline from '@splinetool/react-spline/next';
import '../static/SplineModel.css';

export default function SplineModel() {
  return (
    <div className="spline-container">
      <Spline
        scene="https://prod.spline.design/Vh2gJbGMWtmjUgfI/scene.splinecode" 
      />
    </div>
  );
}
