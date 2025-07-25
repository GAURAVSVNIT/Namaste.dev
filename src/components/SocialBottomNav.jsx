"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Camera, Tv, Search, User, Home } from "lucide-react";

// New import for styled-components if needed
// import styled from 'styled-components';

const SocialBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false); // Start hidden

  const professionalStyles = {
    gradientBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    buttonText: {
      color: '#F3F4F6',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    boxShadows: {
      default: '0 4px 8px rgba(0,0,0,0.2)',
      active: '0 6px 12px rgba(0,0,0,0.3)'
    }
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  const isActive = (path) => {
    if (path === "/social") {
      return pathname === "/social";
    }
    if (path === "/social/look") {
      return pathname === "/social/look" || pathname.startsWith("/social/look/");
    }
    return pathname === path;
  };

  const createButton = (path, icon, label, colors, key) => (
    <button 
      key={key}
      onClick={() => navigateTo(path)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: '14px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '55px',
        background: isActive(path) 
          ? `linear-gradient(135deg, ${colors.bg})` 
          : 'transparent',
        color: isActive(path) ? colors.active : '#9ca3af',
        border: 'none',
        cursor: 'pointer',
        transform: isActive(path) ? 'scale(1.08)' : 'scale(1)',
        boxShadow: isActive(path) ? `0 6px 20px ${colors.shadow}` : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isActive(path)) {
          e.target.style.color = colors.active;
          e.target.style.background = colors.hoverBg;
          e.target.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive(path)) {
          e.target.style.color = '#9ca3af';
          e.target.style.background = 'transparent';
          e.target.style.transform = 'scale(1)';
        }
      }}
    >
      {isActive(path) && (
        <div style={{
          position: 'absolute',
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '36px',
          height: '4px',
          background: colors.indicator,
          borderRadius: '4px',
          boxShadow: `0 0 8px ${colors.active}40`
        }} />
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {React.createElement(icon, {
          style: {
            height: '22px',
            width: '22px',
            transition: 'transform 0.2s ease',
            transform: isActive(path) ? 'scale(1.1)' : 'scale(1)',
            color: isActive(path) ? colors.active : '#9ca3af'
          }
        })}
      </div>
      {isActive(path) && (
        <div style={{
          position: 'absolute',
          inset: '0',
          background: `linear-gradient(135deg, ${colors.glow})`,
          borderRadius: '14px',
          opacity: '0.3',
          border: `2px solid ${professionalStyles.gradientBackground}`,
          animation: 'pulse 2s infinite'
        }} />
      )}
    </button>
  );

  const buttonConfigs = [
    {
      path: "/social",
      icon: Home,
      label: "Feed",
      colors: {
        active: '#9333ea',
        bg: 'rgba(147, 51, 234, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%',
        hoverBg: 'rgba(147, 51, 234, 0.06)',
        shadow: 'rgba(147, 51, 234, 0.2)',
        indicator: 'linear-gradient(to right, #9333ea, #a855f7)',
        glow: 'rgba(147, 51, 234, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%'
      }
    },
    {
      path: "/social/search",
      icon: Search,
      label: "Search",
      colors: {
        active: '#667eea',
        bg: 'rgba(102, 126, 234, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%',
        hoverBg: 'rgba(102, 126, 234, 0.06)',
        shadow: 'rgba(102, 126, 234, 0.2)',
        indicator: 'linear-gradient(to right, #667eea, #9333ea)',
        glow: 'rgba(102, 126, 234, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%'
      }
    },
    {
      path: "/social/look",
      icon: Camera,
      label: "Look",
      colors: {
        active: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%',
        hoverBg: 'rgba(168, 85, 247, 0.06)',
        shadow: 'rgba(168, 85, 247, 0.2)',
        indicator: 'linear-gradient(to right, #a855f7, #9333ea)',
        glow: 'rgba(168, 85, 247, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%'
      }
    },
    {
      path: "/social/fashiontv",
      icon: Tv,
      label: "TV",
      colors: {
        active: '#c084fc',
        bg: 'rgba(192, 132, 252, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%',
        hoverBg: 'rgba(192, 132, 252, 0.06)',
        shadow: 'rgba(192, 132, 252, 0.2)',
        indicator: 'linear-gradient(to right, #c084fc, #a855f7)',
        glow: 'rgba(192, 132, 252, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%'
      }
    },
    {
      path: "/social/profile",
      icon: User,
      label: "Profile",
      colors: {
        active: '#ddd6fe',
        bg: 'rgba(221, 214, 254, 0.12) 0%, rgba(192, 132, 252, 0.12) 100%',
        hoverBg: 'rgba(221, 214, 254, 0.06)',
        shadow: 'rgba(221, 214, 254, 0.2)',
        indicator: 'linear-gradient(to right, #ddd6fe, #c084fc)',
        glow: 'rgba(221, 214, 254, 0.08) 0%, rgba(192, 132, 252, 0.08) 100%'
      }
    }
  ];

  return (
    <>
      {/* Hover Trigger Zone */}
      <div 
        style={{
          position: 'fixed',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '25px',
          zIndex: 49,
          cursor: 'pointer'
        }}
        onMouseEnter={() => setIsVisible(true)}
      >
        {/* Enhanced Semi-circle indicator */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50px',
          height: '25px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '25px 25px 0 0',
          opacity: isVisible ? '0' : '1',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 -6px 20px rgba(102, 126, 234, 0.4)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(15px)'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '50%',
            boxShadow: '0 0 12px rgba(255, 255, 255, 0.8), inset 0 1px 2px rgba(0, 0, 0, 0.1)',
            animation: !isVisible ? 'pulse 2s infinite' : 'none'
          }} />
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '2px'
          }} />
        </div>
      </div>

      {/* Enhanced Navigation Bar */}
      <nav 
        style={{
          position: 'fixed',
          bottom: isVisible ? '0' : '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '20px 20px 0 0',
        padding: '12px 16px 14px 16px',
        zIndex: 50,
          boxShadow: '0 -15px 50px rgba(102, 126, 234, 0.2), 0 -5px 20px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '650px',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          borderBottom: 'none'
        }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '550px',
            gap: '8px'
          }}>
            {buttonConfigs.map((config) => 
              createButton(config.path, config.icon, config.label, config.colors, config.path)
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default SocialBottomNav;
