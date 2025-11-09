// Site configuration
// @ts-ignore - custom properties not in Astro's types
import astroConfig from '../../astro.config.mjs';

export const siteConfig = {
  // Logo size configuration (logo itself comes from astro.config.mjs)
  logo: {
    // Size configuration
    desktop: {
      height: '80px',
      width: 'auto'
    },
    mobile: {
      height: '60px',
      width: 'auto'
    }
  },
  
  // Site information
  title: 'Search Tweets - Freifunk Social Media Archive',
  description: 'A customizable Astro site',
  siteName: 'Social Media Archive',
  
  // Navigation configuration
  navigation: {
    search: 'SEARCH',
    tweets: 'TWEETS',
    about: 'ABOUT'
  }
};

// Helper function to get the logo path
export function getLogoPath(): string {
  const config = astroConfig as any;
  // Returns the first preferred logo from config
  // Falls back to browser's 404 handling if not found
  return `/${config.logo?.possibleNames?.[0] || 'logo.png'}`;
}

// Helper function to get logo alt text
export function getLogoAlt(): string {
  const config = astroConfig as any;
  return config.logo?.alt || 'Site Logo';
}

// Helper function to get colors from config
export function getColors() {
  const config = astroConfig as any;
  return config.colors || { light: {}, dark: undefined };
}

// Helper function to get favicons from config
export function getFavicons() {
  const config = astroConfig as any;
  return config.favicons || {
    favicon32x32: '/favicon-32x32.png',
    favicon192x192: '/favicon-192x192.png',
    appleTouchIcon: '/apple-touch-icon.png'
  };
}

// Helper function to get logo sizes
export function getLogoSizes() {
  return {
    desktop: siteConfig.logo.desktop,
    mobile: siteConfig.logo.mobile
  };
}