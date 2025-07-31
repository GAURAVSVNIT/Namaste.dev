"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page redirects to the looks section by default
const SocialProfilePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to looks by default
    router.replace('/social/profile/looks');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #667eea',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>Redirecting to your profile...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SocialProfilePage;
