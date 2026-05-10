export default function Badge({ recipe, size = 44, radius = 12 }) {
  if (!recipe) return null;
  const fs = size * 0.42;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: recipe.badge.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative', overflow: 'hidden',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
        <defs>
          <pattern id={`pat-${recipe.id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={recipe.badge.fg} strokeWidth="1.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pat-${recipe.id})`}/>
      </svg>
      <span style={{
        position: 'relative', color: recipe.badge.fg,
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontWeight: 600, fontSize: fs, letterSpacing: -0.5,
      }}>{recipe.badge.glyph}</span>
    </div>
  );
}
