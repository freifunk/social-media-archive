// Site configuration for theming and customization
export const siteConfig = {
  // Logo configuration
  logo: {
    // Will look for logo files in public/ directory in this order of preference
    possibleNames: [
      'logo.png',
      'logo.svg', 
      'logo.jpg',
      'logo.jpeg',
      'logo.webp',
      'logo_freifunknet.png', // fallback to current logo
    ],
    alt: 'Site Logo',
    // Size configuration
    desktop: {
      height: '80px', // increased from 60px
      width: 'auto'
    },
    mobile: {
      height: '60px', // increased from 45px  
      width: 'auto'
    }
  },
  
  // Site information
  title: 'Search Tweets - Freifunk Social Media Archive',
  description: 'A customizable Astro site',
  
  // Theme configuration (for future use)
  theme: {
    primary: '#DF3A6C',
    secondary: '#ff9776',
    accent: '#00539F'
  }
};

// Helper function to get the logo path
export function getLogoPath(): string {
  // In a real implementation, you might want to check which files actually exist
  // For now, we'll return the first preferred option and let the browser handle fallbacks
  return `/${siteConfig.logo.possibleNames[5]}`;
}

// Helper function to get logo alt text
export function getLogoAlt(): string {
  return siteConfig.logo.alt;
}

// Helper function to get logo sizes
export function getLogoSizes() {
  return {
    desktop: siteConfig.logo.desktop,
    mobile: siteConfig.logo.mobile
  };
}