const themes = [
  {
    id: '', name: 'True Dark', color: '#ffffff', desc: 'Pure black & white',
    vars: {
      '--bg-primary': '#000000', '--bg-surface': '#000000', '--bg-surface-alt': '#000000',
      '--bg-glass': 'rgba(0, 0, 0, 0.9)', '--bg-card': '#000000',
      '--border-subtle': 'rgba(255, 255, 255, 0.04)', '--border-accent': 'rgba(255, 255, 255, 0.15)',
      '--text-primary': '#ffffff', '--text-secondary': '#ffffff', '--text-muted': '#ffffff', '--text-dim': '#666666',
      '--accent': '#ffffff', '--accent-light': '#e0e0e0', '--accent-dark': '#b0b0b0',
      '--accent-glow': 'rgba(255, 255, 255, 0.15)',
      '--success': '#22c55e', '--warning': '#ffffff', '--danger': '#ef4444',
      '--shadow-glow': '0 0 20px rgba(255, 255, 255, 0.1)', '--card-hover-border': 'rgba(255, 255, 255, 0.15)',
    },
  },
  {
    id: 'obsidian', name: 'Obsidian', color: '#555555', desc: 'Dark grey & white',
    vars: {
      '--bg-primary': '#0a0a0a', '--bg-surface': '#141414', '--bg-surface-alt': '#1e1e1e',
      '--bg-glass': 'rgba(20, 20, 20, 0.8)', '--bg-card': 'linear-gradient(135deg, rgba(30, 30, 30, 0.5), rgba(20, 20, 20, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.06)', '--border-accent': 'rgba(255, 255, 255, 0.12)',
      '--text-primary': '#e0e0e0', '--text-secondary': '#a0a0a0', '--text-muted': '#707070', '--text-dim': '#444444',
      '--accent': '#ffffff', '--accent-light': '#e0e0e0', '--accent-dark': '#b0b0b0',
      '--accent-glow': 'rgba(255, 255, 255, 0.08)',
      '--success': '#4ade80', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(255, 255, 255, 0.05)', '--card-hover-border': 'rgba(255, 255, 255, 0.12)',
    },
  },
  {
    id: 'dark', name: 'Dark', color: '#7c6aef', desc: 'Classic purple',
    vars: {
      '--bg-primary': '#0a0a0f', '--bg-surface': '#1a1a2e', '--bg-surface-alt': '#2a2a3e',
      '--bg-glass': 'rgba(26, 26, 46, 0.6)', '--bg-card': 'linear-gradient(135deg, rgba(42, 42, 62, 0.5), rgba(26, 26, 46, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.06)', '--border-accent': 'rgba(124, 106, 239, 0.3)',
      '--text-primary': '#e4e4ed', '--text-secondary': '#a8a8bc', '--text-muted': '#7a7a96', '--text-dim': '#55556e',
      '--accent': '#7c6aef', '--accent-light': '#a594ff', '--accent-dark': '#5a4ad0',
      '--accent-glow': 'rgba(124, 106, 239, 0.15)',
      '--success': '#4ade80', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(124, 106, 239, 0.2)', '--card-hover-border': 'rgba(124, 106, 239, 0.3)',
    },
  },
  {
    id: 'midnight', name: 'Midnight', color: '#3b82f6', desc: 'Deep navy blue',
    vars: {
      '--bg-primary': '#0a0d14', '--bg-surface': '#111827', '--bg-surface-alt': '#1e293b',
      '--bg-glass': 'rgba(17, 24, 39, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(17, 24, 39, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(59, 130, 246, 0.3)',
      '--text-primary': '#e2e8f0', '--text-secondary': '#94a3b8', '--text-muted': '#64748b', '--text-dim': '#475569',
      '--accent': '#3b82f6', '--accent-light': '#60a5fa', '--accent-dark': '#2563eb',
      '--accent-glow': 'rgba(59, 130, 246, 0.15)',
      '--success': '#34d399', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(59, 130, 246, 0.2)', '--card-hover-border': 'rgba(59, 130, 246, 0.3)',
    },
  },
  {
    id: 'crimson', name: 'Crimson', color: '#ef4444', desc: 'Dark red',
    vars: {
      '--bg-primary': '#0f0a0a', '--bg-surface': '#1c1212', '--bg-surface-alt': '#2d1c1c',
      '--bg-glass': 'rgba(28, 18, 18, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(45, 28, 28, 0.5), rgba(28, 18, 18, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(239, 68, 68, 0.3)',
      '--text-primary': '#f0e0e0', '--text-secondary': '#bca8a8', '--text-muted': '#8a7070', '--text-dim': '#5c4a4a',
      '--accent': '#ef4444', '--accent-light': '#f87171', '--accent-dark': '#dc2626',
      '--accent-glow': 'rgba(239, 68, 68, 0.15)',
      '--success': '#4ade80', '--warning': '#fbbf24', '--danger': '#ef4444',
      '--shadow-glow': '0 0 20px rgba(239, 68, 68, 0.2)', '--card-hover-border': 'rgba(239, 68, 68, 0.3)',
    },
  },
  {
    id: 'forest', name: 'Forest', color: '#22c55e', desc: 'Deep green',
    vars: {
      '--bg-primary': '#0a0f0a', '--bg-surface': '#121a12', '--bg-surface-alt': '#1c2d1c',
      '--bg-glass': 'rgba(18, 26, 18, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(28, 45, 28, 0.5), rgba(18, 26, 18, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(34, 197, 94, 0.3)',
      '--text-primary': '#e0f0e0', '--text-secondary': '#a8bca8', '--text-muted': '#708a70', '--text-dim': '#4a5c4a',
      '--accent': '#22c55e', '--accent-light': '#4ade80', '--accent-dark': '#16a34a',
      '--accent-glow': 'rgba(34, 197, 94, 0.15)',
      '--success': '#22c55e', '--warning': '#eab308', '--danger': '#ef4444',
      '--shadow-glow': '0 0 20px rgba(34, 197, 94, 0.2)', '--card-hover-border': 'rgba(34, 197, 94, 0.3)',
    },
  },
  {
    id: 'arctic', name: 'Arctic', color: '#6366f1', desc: 'Light cool mode',
    vars: {
      '--bg-primary': '#f1f5f9', '--bg-surface': '#e2e8f0', '--bg-surface-alt': '#cbd5e1',
      '--bg-glass': 'rgba(226, 232, 240, 0.8)', '--bg-card': 'linear-gradient(135deg, rgba(203, 213, 225, 0.4), rgba(226, 232, 240, 0.4))',
      '--border-subtle': 'rgba(0, 0, 0, 0.08)', '--border-accent': 'rgba(99, 102, 241, 0.3)',
      '--text-primary': '#1e293b', '--text-secondary': '#475569', '--text-muted': '#64748b', '--text-dim': '#94a3b8',
      '--accent': '#6366f1', '--accent-light': '#818cf8', '--accent-dark': '#4f46e5',
      '--accent-glow': 'rgba(99, 102, 241, 0.1)',
      '--success': '#16a34a', '--warning': '#d97706', '--danger': '#dc2626',
      '--shadow-glow': '0 0 20px rgba(99, 102, 241, 0.15)', '--card-hover-border': 'rgba(99, 102, 241, 0.3)',
    },
  },
  {
    id: 'midnight-purple', name: 'Midnight Purple', color: '#a855f7', desc: 'Rich violet',
    vars: {
      '--bg-primary': '#0d0a14', '--bg-surface': '#151020', '--bg-surface-alt': '#1f1830',
      '--bg-glass': 'rgba(21, 16, 32, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(31, 24, 48, 0.5), rgba(21, 16, 32, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(168, 85, 247, 0.3)',
      '--text-primary': '#e8e0f0', '--text-secondary': '#b0a0c0', '--text-muted': '#7a6a90', '--text-dim': '#504560',
      '--accent': '#a855f7', '--accent-light': '#c084fc', '--accent-dark': '#9333ea',
      '--accent-glow': 'rgba(168, 85, 247, 0.15)',
      '--success': '#4ade80', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(168, 85, 247, 0.2)', '--card-hover-border': 'rgba(168, 85, 247, 0.3)',
    },
  },
  {
    id: 'sunset', name: 'Sunset', color: '#fb923c', desc: 'Warm orange glow',
    vars: {
      '--bg-primary': '#1a0a0e', '--bg-surface': '#2a1418', '--bg-surface-alt': '#3a1e22',
      '--bg-glass': 'rgba(42, 20, 24, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(58, 30, 34, 0.5), rgba(42, 20, 24, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(251, 146, 60, 0.3)',
      '--text-primary': '#f5e0d8', '--text-secondary': '#c4a098', '--text-muted': '#8a6a62', '--text-dim': '#5a4440',
      '--accent': '#fb923c', '--accent-light': '#fdba74', '--accent-dark': '#ea580c',
      '--accent-glow': 'rgba(251, 146, 60, 0.15)',
      '--success': '#4ade80', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(251, 146, 60, 0.2)', '--card-hover-border': 'rgba(251, 146, 60, 0.3)',
    },
  },
  {
    id: 'ocean', name: 'Ocean', color: '#06b6d4', desc: 'Deep sea cyan',
    vars: {
      '--bg-primary': '#0a0e1a', '--bg-surface': '#0f1a2e', '--bg-surface-alt': '#162a44',
      '--bg-glass': 'rgba(15, 26, 46, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(22, 42, 68, 0.5), rgba(15, 26, 46, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(6, 182, 212, 0.3)',
      '--text-primary': '#e0f0f5', '--text-secondary': '#94c4d4', '--text-muted': '#5a8a9a', '--text-dim': '#3a5a6a',
      '--accent': '#06b6d4', '--accent-light': '#22d3ee', '--accent-dark': '#0891b2',
      '--accent-glow': 'rgba(6, 182, 212, 0.15)',
      '--success': '#34d399', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(6, 182, 212, 0.2)', '--card-hover-border': 'rgba(6, 182, 212, 0.3)',
    },
  },
  {
    id: 'sakura', name: 'Sakura', color: '#f472b6', desc: 'Cherry blossom pink',
    vars: {
      '--bg-primary': '#1a0a14', '--bg-surface': '#2a1424', '--bg-surface-alt': '#3a1e34',
      '--bg-glass': 'rgba(42, 20, 36, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(58, 30, 52, 0.5), rgba(42, 20, 36, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(244, 114, 182, 0.3)',
      '--text-primary': '#f5e0ee', '--text-secondary': '#c4a0b8', '--text-muted': '#8a6a80', '--text-dim': '#5a4450',
      '--accent': '#f472b6', '--accent-light': '#f9a8d4', '--accent-dark': '#db2777',
      '--accent-glow': 'rgba(244, 114, 182, 0.15)',
      '--success': '#4ade80', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(244, 114, 182, 0.2)', '--card-hover-border': 'rgba(244, 114, 182, 0.3)',
    },
  },
  {
    id: 'ember', name: 'Ember', color: '#f97316', desc: 'Burning orange',
    vars: {
      '--bg-primary': '#120a06', '--bg-surface': '#221410', '--bg-surface-alt': '#321e18',
      '--bg-glass': 'rgba(34, 20, 16, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(50, 30, 24, 0.5), rgba(34, 20, 16, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(239, 68, 68, 0.3)',
      '--text-primary': '#f5e0d0', '--text-secondary': '#c4a088', '--text-muted': '#8a6a50', '--text-dim': '#5a4430',
      '--accent': '#f97316', '--accent-light': '#fb923c', '--accent-dark': '#ea580c',
      '--accent-glow': 'rgba(249, 115, 22, 0.15)',
      '--success': '#4ade80', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(249, 115, 22, 0.2)', '--card-hover-border': 'rgba(249, 115, 22, 0.3)',
    },
  },
  {
    id: 'cyberpunk', name: 'Cyberpunk', color: '#ec4899', desc: 'Neon pink',
    vars: {
      '--bg-primary': '#0a0a12', '--bg-surface': '#14142a', '--bg-surface-alt': '#1e1e3e',
      '--bg-glass': 'rgba(20, 20, 42, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(30, 30, 62, 0.5), rgba(20, 20, 42, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(236, 72, 153, 0.3)',
      '--text-primary': '#f0e0ff', '--text-secondary': '#b0a0d0', '--text-muted': '#7a6a9a', '--text-dim': '#4a3a6a',
      '--accent': '#ec4899', '--accent-light': '#f472b6', '--accent-dark': '#db2777',
      '--accent-glow': 'rgba(236, 72, 153, 0.15)',
      '--success': '#22d3ee', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(236, 72, 153, 0.2)', '--card-hover-border': 'rgba(236, 72, 153, 0.3)',
    },
  },
  {
    id: 'aurora', name: 'Aurora', color: '#34d399', desc: 'Northern lights green',
    vars: {
      '--bg-primary': '#060d12', '--bg-surface': '#0c1a24', '--bg-surface-alt': '#122838',
      '--bg-glass': 'rgba(12, 26, 36, 0.7)', '--bg-card': 'linear-gradient(135deg, rgba(18, 40, 56, 0.5), rgba(12, 26, 36, 0.5))',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)', '--border-accent': 'rgba(52, 211, 153, 0.3)',
      '--text-primary': '#e0f5f0', '--text-secondary': '#94c4b8', '--text-muted': '#5a8a7a', '--text-dim': '#3a5a4a',
      '--accent': '#34d399', '--accent-light': '#6ee7b7', '--accent-dark': '#059669',
      '--accent-glow': 'rgba(52, 211, 153, 0.15)',
      '--success': '#34d399', '--warning': '#fbbf24', '--danger': '#f87171',
      '--shadow-glow': '0 0 20px rgba(52, 211, 153, 0.2)', '--card-hover-border': 'rgba(52, 211, 153, 0.3)',
    },
  },
];

const themeMap = Object.fromEntries(themes.map((t) => [t.id, t]));

const defaultVars = themeMap[''].vars;

function applyTheme(themeId) {
  const theme = themeMap[themeId] || themeMap[''];
  const root = document.documentElement;
  const vars = theme.vars;
  Object.keys(vars).forEach((key) => root.style.setProperty(key, vars[key]));
}

export { themes, themeMap, defaultVars, applyTheme };
export default themes;
