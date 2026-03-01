/**
 * BOSS BRAWL - Professional UI Components
 * Reusable, composable UI primitives for game interfaces
 */

import React from 'react';

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  disabled = false,
  onClick,
  style = {}
}) {
  const baseStyles = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    overflow: 'hidden',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.5 : 1,
  };

  const variants = {
    default: {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    primary: {
      background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
      border: '2px solid #fbbf24',
      boxShadow: '0 4px 0 #92400e, 0 6px 12px rgba(217,119,6,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    },
    secondary: {
      background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)',
      border: '2px solid #a78bfa',
      boxShadow: '0 4px 0 #5b21b6, 0 6px 12px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    },
    danger: {
      background: 'linear-gradient(180deg, #e63946 0%, #c1121f 100%)',
      border: '2px solid #f87171',
      boxShadow: '0 4px 0 #991b1b, 0 6px 12px rgba(230,57,70,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    },
    success: {
      background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
      border: '2px solid #86efac',
      boxShadow: '0 4px 0 #166534, 0 6px 12px rgba(74,222,128,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.15)',
    },
  };

  const sizes = {
    default: { padding: '12px 20px', fontSize: '14px' },
    sm: { padding: '8px 14px', fontSize: '12px' },
    lg: { padding: '16px 28px', fontSize: '18px', letterSpacing: '0.1em' },
    icon: { padding: '12px', aspectRatio: '1' },
  };

  const hoverStyles = !disabled ? {
    onMouseEnter: (e) => {
      if (variant === 'primary') {
        e.currentTarget.style.background = 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)';
        e.currentTarget.style.boxShadow = '0 4px 0 #92400e, 0 8px 16px rgba(217,119,6,0.5), inset 0 1px 0 rgba(255,255,255,0.4)';
      } else if (variant === 'secondary') {
        e.currentTarget.style.background = 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)';
        e.currentTarget.style.boxShadow = '0 4px 0 #5b21b6, 0 8px 16px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.4)';
      } else {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
      }
      e.currentTarget.style.transform = 'translateY(-1px)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.background = variants[variant].background;
      e.currentTarget.style.borderColor = variants[variant].border?.split(' ')[2] || 'rgba(255,255,255,0.12)';
      e.currentTarget.style.boxShadow = variants[variant].boxShadow || '0 2px 4px rgba(0,0,0,0.3)';
      e.currentTarget.style.transform = 'translateY(0)';
    },
    onMouseDown: (e) => {
      if (['primary', 'secondary', 'danger', 'success'].includes(variant)) {
        e.currentTarget.style.transform = 'translateY(3px)';
        e.currentTarget.style.boxShadow = `0 1px 0 ${variants[variant].boxShadow?.split(',')[0].split(' ')[3]}, inset 0 1px 0 rgba(255,255,255,0.2)`;
      } else {
        e.currentTarget.style.transform = 'translateY(1px)';
      }
    },
    onMouseUp: (e) => {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = variants[variant].boxShadow;
    },
  } : {};

  return (
    <button
      style={{ ...baseStyles, ...variants[variant], ...sizes[size], ...style }}
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...hoverStyles}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export function Card({ 
  children, 
  variant = 'default',
  className = '',
  style = {},
  glowColor,
  onClick
}) {
  const baseStyles = {
    background: 'rgba(26, 31, 53, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const variants = {
    default: {},
    elevated: {
      background: 'linear-gradient(135deg, rgba(36, 42, 69, 0.9) 0%, rgba(26, 31, 53, 0.95) 100%)',
      border: '1px solid rgba(255, 215, 0, 0.15)',
    },
    interactive: {
      cursor: 'pointer',
    },
    glow: {
      boxShadow: glowColor ? `0 0 30px ${glowColor}, inset 0 0 20px ${glowColor.replace(')', ', 0.1)')}` : baseStyles.boxShadow,
    },
  };

  const hoverStyles = variant === 'interactive' || onClick ? {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = glowColor ? `0 0 30px ${glowColor}, 0 4px 12px rgba(0,0,0,0.4)` : baseStyles.boxShadow;
      e.currentTarget.style.borderColor = variants[variant]?.border?.split(' ').slice(2).join(' ') || 'rgba(255, 255, 255, 0.08)';
    },
  } : {};

  return (
    <div
      style={{ ...baseStyles, ...variants[variant], ...style }}
      className={className}
      onClick={onClick}
      {...hoverStyles}
    >
      {children}
    </div>
  );
}

// ============================================================================
// PROGRESS BAR COMPONENTS
// ============================================================================

export function ProgressBar({ 
  value, 
  max = 100, 
  variant = 'default',
  size = 'default',
  animated = true,
  segments = 0,
  className = '',
  style = {}
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const baseStyles = {
    position: 'relative',
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '9999px',
    overflow: 'hidden',
  };

  const sizes = {
    sm: { height: '4px' },
    default: { height: '8px' },
    lg: { height: '12px' },
  };

  const variants = {
    default: { background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' },
    hp: { 
      background: percentage > 50 
        ? 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)'
        : percentage > 25
        ? 'linear-gradient(90deg, #f59e0b 0%, #eab308 100%)'
        : 'linear-gradient(90deg, #e63946 0%, #dc2626 100%)'
    },
    xp: { background: 'linear-gradient(90deg, #ffd700 0%, #f4a261 100%)' },
    rage: { background: 'linear-gradient(90deg, #f59e0b 0%, #e63946 100%)' },
    stamina: { background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' },
    mana: { background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)' },
  };

  const fillStyle = {
    height: '100%',
    borderRadius: '9999px',
    transition: animated ? 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    width: `${percentage}%`,
    ...variants[variant],
  };

  // Segmented bar
  if (segments > 0) {
    const segmentWidth = 100 / segments;
    const filledSegments = Math.ceil((percentage / 100) * segments);
    
    return (
      <div style={{ ...baseStyles, ...sizes[size], display: 'flex', gap: '2px', padding: '3px', ...style }} className={className}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '100%',
              background: i < filledSegments ? variants[variant].background : 'rgba(255,255,255,0.05)',
              borderRadius: '2px',
              transition: 'background 0.3s ease',
              boxShadow: i < filledSegments ? `0 0 6px ${variants[variant].background.split(' ')[1]}` : 'none',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ ...baseStyles, ...sizes[size], ...style }} className={className}>
      <div style={fillStyle} />
    </div>
  );
}

// ============================================================================
// BADGE & STAT COMPONENTS
// ============================================================================

export function Badge({ 
  children, 
  variant = 'default',
  size = 'default',
  icon,
  className = '',
  style = {}
}) {
  const variants = {
    default: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.12)', color: '#fff' },
    gold: { bg: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.3)', color: '#ffd700' },
    primary: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', color: '#a78bfa' },
    success: { bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)', color: '#4ade80' },
    danger: { bg: 'rgba(230,57,70,0.15)', border: 'rgba(230,57,70,0.3)', color: '#e63946' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  };

  const sizes = {
    sm: { padding: '2px 8px', fontSize: '10px' },
    default: { padding: '4px 10px', fontSize: '11px' },
    lg: { padding: '6px 14px', fontSize: '13px' },
  };

  const v = variants[variant];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        borderRadius: '6px',
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.color,
        ...sizes[size],
        ...style,
      }}
      className={className}
    >
      {icon && <span>{icon}</span>}
      {children}
    </div>
  );
}

export function Stat({ 
  label, 
  value, 
  icon,
  trend,
  className = '',
  style = {}
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        ...style,
      }}
      className={className}
    >
      {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
      <div>
        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffd700', fontFamily: 'var(--font-mono, monospace)' }}>
          {value}
          {trend && <span style={{ marginLeft: '4px', fontSize: '11px', color: trend > 0 ? '#4ade80' : '#e63946' }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL & OVERLAY COMPONENTS
// ============================================================================

export function Modal({ 
  isOpen, 
  onClose, 
  children,
  title,
  size = 'default',
  className = ''
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: { maxWidth: '280px' },
    default: { maxWidth: '340px' },
    lg: { maxWidth: '420px' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        animation: 'fadeIn 0.2s ease-out',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <Card
        variant="elevated"
        style={{
          width: '100%',
          ...sizes[size],
          animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(230,57,70,0.2) 0%, rgba(230,57,70,0.1) 100%)',
            borderRadius: '14px 14px 0 0',
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#fff',
              textAlign: 'center',
            }}>{title}</h3>
          </div>
        )}
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// LOADING & SPINNER COMPONENTS
// ============================================================================

export function Spinner({ size = 'default', color = '#f4a261' }) {
  const sizes = {
    sm: { width: '16px', height: '16px', borderWidth: '2px' },
    default: { width: '24px', height: '24px', borderWidth: '2px' },
    lg: { width: '40px', height: '40px', borderWidth: '3px' },
  };

  return (
    <div
      style={{
        ...sizes[size],
        border: `${sizes[size].borderWidth} solid rgba(255,255,255,0.1)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}

export function Skeleton({ width = '100%', height = '20px', circle = false }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        borderRadius: circle ? '50%' : '4px',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// ============================================================================
// ANIMATION WRAPPER
// ============================================================================

export function Animated({ 
  children, 
  animation = 'fadeIn',
  delay = 0,
  duration = 0.4,
  className = '',
  style = {}
}) {
  const animations = {
    fadeIn: 'fadeIn',
    fadeInUp: 'fadeInUp',
    scaleIn: 'scaleIn',
    slideInLeft: 'slideInLeft',
    slideInRight: 'slideInRight',
  };

  return (
    <div
      style={{
        animation: `${animations[animation]} ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s both`,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const roleColors = {
  attacker: { color: '#e63946', glow: 'rgba(230, 57, 70, 0.4)' },
  tank: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  support: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
};

export const rankColors = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  diamond: '#b9f2ff',
};
