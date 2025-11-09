// Custom configuration for your fork
// Copy this file to custom.config.mjs and customize it
// custom.config.mjs is in .gitignore and won't be committed

// You can override any or all of these values
// Only specify the values you want to change from the defaults

export default {
  // Colors - Separate light and dark mode configurations
  colors: {
    // Light Mode (optional - if not provided, uses Freifunk defaults)
    // light: {
    //   primary: '#YOUR_COLOR',
    //   // ... customize light mode colors
    // },
    
    // Dark Mode (optional - if not provided, light mode will be used for dark mode too)
    dark: {
      // Example: Change primary color for dark mode
      primary: '#0F1C33', // Dark blue
      primaryHover: '#1a2d4d',
      
      // Example: Change accent color
      accent: '#C0C0C0', // Silver
      accentHover: '#E0E0E0',
      
      // Example: Change text colors for dark mode
      textPrimary: '#FFFFFF', // White
      textSecondary: '#E0E0E0',
      textMuted: '#B0B0B0',
      textInverse: '#0F1C33',
      
      // Example: Change background colors
      bgPrimary: '#0F1C33',
      bgSecondary: '#1a2d4d',
      bgTertiary: '#253d5f',
      bgDark: '#0a1526',
      
      // Example: Change border colors
      borderLight: '#3a4d6b',
      borderMedium: '#4a5d7b',
      borderDotted: '#6a7d9b',
      
      // Icon colors (optional - if not provided, uses light mode icons)
      // iconHeart: '#e91e63',
      // iconRetweet: '#00bcd4',
      // iconComment: '#2196f3',
      // iconQuote: '#9c27b0',
      // iconTwitter: '#1da1f2',
      // iconGithub: '#333',
      // iconYoutube: '#ff0000'
    }
  },
  
  // Logo configuration
  logo: {
    alt: 'My Custom Logo', // Alt text for the logo
    possibleNames: [
      'logo.png',
      'logo.svg',
      'logo.jpg',
      'logo.jpeg',
      'logo.webp',
      'logo_freifunknet.png', // fallback
    ]
  },
  
  // Favicon paths
  favicons: {
    favicon32x32: '/favicon-32x32.png',
    favicon192x192: '/favicon-192x192.png',
    appleTouchIcon: '/apple-touch-icon.png'
  }
};
