export default function Icon({ name, size = 20, color = 'currentColor', stroke = 1.8 }) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'sun':    return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>;
    case 'moon':   return <svg {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>;
    case 'dice':   return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8.5" cy="8.5" r=".9" fill={color} stroke="none"/><circle cx="15.5" cy="15.5" r=".9" fill={color} stroke="none"/><circle cx="12" cy="12" r=".9" fill={color} stroke="none"/></svg>;
    case 'check':  return <svg {...p}><path d="M5 12.5l4.5 4.5L19 7"/></svg>;
    case 'x':      return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'plus':   return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'reroll': return <svg {...p}><path d="M21 12a9 9 0 1 1-3.5-7.1"/><path d="M21 4v5h-5"/></svg>;
    case 'home':   return <svg {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></svg>;
    case 'book':   return <svg {...p}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 5v14a2 2 0 0 0 2 2h12"/></svg>;
    case 'clock':  return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'chev':   return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case 'spark':  return <svg {...p}><path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>;
    case 'trash':  return <svg {...p}><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/></svg>;
    case 'flame':  return <svg {...p}><path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-1 5 3 5"/></svg>;
    case 'broom':  return <svg {...p}><path d="M14 4l6 6M5 19l5-5 5 5-5 5z"/><path d="M10 14L20 4"/></svg>;
    case 'users':  return <svg {...p}><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M14 19c0-2 2-4 4-4s3 1 3 3"/></svg>;
    default: return null;
  }
}
