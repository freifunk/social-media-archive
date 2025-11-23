// Config loader that merges default config with optional custom.config.mjs
// This allows forks to customize without modifying astro.config.mjs

// Default configuration (Freifunk defaults - Light Mode)
const defaultConfig = {
  colors: {
    // Light Mode colors (Freifunk defaults - original design)
    light: {
      // Primary colors
      primary: '#DF3A6C',
      primaryHover: '#553C9A',
      secondary: '#ff9776',
      secondaryHover: '#e6855a',
      accent: '#00539F',
      accentHover: '#0066cc',
      
      // Text colors
      textPrimary: '#1E1E1E', // Dark text for light backgrounds (normal text)
      textSecondary: '#DF6C3A',
      textMuted: '#C4A1B4',
      textInverse: '#FFFFFF', // White for inverse elements
      
      // Background colors
      bgPrimary: '#f1f5f9',
      bgSecondary: '#fff',
      bgTertiary: '#F8FCFD',
      bgDark: '#4c1d95',
      
      // Border colors
      borderLight: '#eee',
      borderMedium: '#dee2e6',
      borderDotted: '#a1a1a1',
      
      // Icon colors
      iconHeart: '#e91e63',
      iconRetweet: '#00bcd4',
      iconComment: '#2196f3',
      iconQuote: '#9c27b0',
      iconTwitter: '#1da1f2',
      iconGithub: '#333',
      iconYoutube: '#ff0000'
    },
    // Dark Mode colors (optional - if not provided, will use light mode)
    // Recommended Freifunk Dark Mode - warm gray background complements magenta
    dark: {
      // Primary colors - keep Freifunk brand colors
      primary: '#DF3A6C', // Freifunk Magenta
      primaryHover: '#E85A8A', // Lighter magenta for hover
      secondary: '#ff9776', // Keep original orange
      secondaryHover: '#ffB399', // Lighter orange for hover
      accent: '#DF3A6C', // Freifunk Magenta for links (matches brand)
      accentHover: '#E85A8A', // Lighter magenta for hover
      
      // Text colors - light text for dark backgrounds
      textPrimary: '#F5F5F5', // Almost white for primary text
      textSecondary: '#E8E8E8', // Light gray for secondary text
      textMuted: '#B8B8B8', // Medium gray for muted text
      textInverse: '#1E1E1E', // Dark for inverse (e.g., buttons)
      
      // Background colors - warm gray tones that complement magenta
      bgPrimary: '#2a2a2a', // Warm dark gray (neutral, works with magenta)
      bgSecondary: '#333333', // Slightly lighter warm gray
      bgTertiary: '#3a3a3a', // Even lighter for cards/sections
      bgDark: '#1a1a1a', // Very dark for contrast elements
      
      // Border colors - warm gray borders
      borderLight: '#404040', // Subtle warm border
      borderMedium: '#4a4a4a', // Medium warm border
      borderDotted: '#5a5a5a', // More visible for dotted borders
      
      // Icon colors - keep original for brand consistency
      iconHeart: '#e91e63',
      iconRetweet: '#00bcd4',
      iconComment: '#2196f3',
      iconQuote: '#9c27b0',
      iconTwitter: '#1da1f2',
      iconGithub: '#f5f5f5', // Light gray for GitHub icon on dark
      iconYoutube: '#ff0000'
    }
  },
  
  logo: {
    alt: 'Freifunk Logo',
    possibleNames: [
      'logo_freifunknet.png', // fallback to original logo
    ]
  },
  
  favicons: {
    favicon32x32: '/favicon.ico',
    appleTouchIcon: '/apple-touch-icon.png'
  }
};

// Try to load custom config (optional, for forks)
let customConfig = {};
try {
  // Check if file exists before importing
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath, pathToFileURL } = await import('node:url');
  
  // Get the directory of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const customConfigPath = path.join(__dirname, 'custom.config.mjs');
  
  if (fs.existsSync(customConfigPath)) {
    // Use dynamic import with file:// URL to prevent static analysis by Vite/Rollup
    const customConfigUrl = pathToFileURL(customConfigPath).href;
    const customModule = await import(customConfigUrl);
    customConfig = customModule.default || customModule || {};
  }
} catch (error) {
  // custom.config.mjs doesn't exist or couldn't be loaded, use defaults only
  // This is expected for the default repository or when file is missing
}

// Deep merge function for nested objects
// Empty objects don't override defaults - only actual values are merged
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // Check if source object is empty - don't override defaults with empty objects
      const sourceKeys = Object.keys(source[key]);
      if (sourceKeys.length === 0) {
        // Empty object - don't override, keep target value
        continue;
      }
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      // Only override if value is not undefined
      result[key] = source[key];
    }
  }
  return result;
}

// Merge: custom overrides default
export const siteConfig = deepMerge(defaultConfig, customConfig);
