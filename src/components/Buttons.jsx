import { C } from '../constants.js';
import Icon from './Icon.jsx';

export function PrimaryBtn({ children, onClick, icon, color = C.turk, dim = false, full = false, size = 'md' }) {
  const h = size === 'lg' ? 56 : size === 'sm' ? 38 : 48;
  return (
    <button onClick={onClick} disabled={dim} style={{
      height: h, padding: size === 'lg' ? '0 22px' : '0 18px',
      borderRadius: 14, border: 'none',
      background: dim ? '#D8E1E3' : color,
      color: '#fff', fontWeight: 600, fontSize: size === 'lg' ? 17 : 16,
      letterSpacing: -0.2, cursor: dim ? 'default' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: full ? '100%' : undefined,
      boxShadow: dim ? 'none' : `0 6px 14px ${color}33, 0 1px 0 rgba(255,255,255,0.25) inset`,
      fontFamily: 'inherit', transition: 'transform 80ms ease',
    }}
      onMouseDown={e => !dim && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, icon, color = C.turkDeep, full = false, size = 'md' }) {
  const h = size === 'sm' ? 38 : 44;
  return (
    <button onClick={onClick} style={{
      height: h, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${color}33`,
      background: '#fff', color: color, fontWeight: 600, fontSize: size === 'sm' ? 14 : 15,
      letterSpacing: -0.2, cursor: 'pointer', fontFamily: 'inherit',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      width: full ? '100%' : undefined,
    }}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}
