export type ThemeName = 'Dark Arena' | 'Neon Night' | 'Daytime Stadium';

export const THEMES: ThemeName[] = ['Dark Arena', 'Neon Night', 'Daytime Stadium'];

type Vars = Record<string, string>;

export const THEME_VARS: Record<ThemeName, Vars> = {
  'Dark Arena': {
    '--bg': '#0b0e14', '--bg2': '#161c28', '--bg3': '#1e2636', '--text': '#f4f7fb',
    '--muted': '#8a94a8', '--line': 'rgba(255,255,255,.10)', '--red': '#ff3d45',
    '--blue': '#2f80ff', '--gold': '#ffd23f', '--redSoft': 'rgba(255,61,69,.14)',
    '--blueSoft': 'rgba(47,128,255,.14)', '--spot': 'rgba(255,210,63,.12)',
    '--ink': '#0b0e14',
  },
  'Neon Night': {
    '--bg': '#0a0612', '--bg2': '#160d22', '--bg3': '#211531', '--text': '#f6f0ff',
    '--muted': '#9b86c4', '--line': 'rgba(180,140,255,.18)', '--red': '#ff2e7e',
    '--blue': '#19d4ff', '--gold': '#c6ff3d', '--redSoft': 'rgba(255,46,126,.16)',
    '--blueSoft': 'rgba(25,212,255,.14)', '--spot': 'rgba(198,255,61,.16)',
    '--ink': '#0a0612',
  },
  'Daytime Stadium': {
    '--bg': '#eceff4', '--bg2': '#ffffff', '--bg3': '#eef1f6', '--text': '#131722',
    '--muted': '#5a6478', '--line': 'rgba(20,30,50,.13)', '--red': '#e23a44',
    '--blue': '#2563eb', '--gold': '#e0a400', '--redSoft': 'rgba(226,58,68,.10)',
    '--blueSoft': 'rgba(37,99,235,.10)', '--spot': 'rgba(224,164,0,.16)',
    '--ink': '#ffffff',
  },
};

export function applyTheme(name: ThemeName) {
  const vars = THEME_VARS[name];
  const root = document.documentElement;
  for (const k of Object.keys(vars)) root.style.setProperty(k, vars[k]);
  root.style.setProperty('color-scheme', name === 'Daytime Stadium' ? 'light' : 'dark');
}
