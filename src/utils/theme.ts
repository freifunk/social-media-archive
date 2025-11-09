// Utility to generate CSS variables from astro.config.mjs
import { getColors } from '../config/site';

/**
 * Generates CSS custom properties from astro.config.mjs colors
 * Supports separate light and dark mode configurations
 * Dark mode is optional - if not provided, light mode will be used
 * @returns CSS string with :root and [data-theme] variables
 */
export function generateThemeCSS(): string {
  const colors = getColors();
  
  // Get light mode colors (required)
  const lightColors = colors.light || {};
  
  // Get dark mode colors (optional - fallback to light if not provided)
  const darkColors = colors.dark || lightColors;
  
  // Helper function to get color with fallback
  const getColor = (modeColors: any, key: string, fallback: string) => {
    return modeColors[key] || fallback;
  };
  
  // Light Mode CSS (default)
  const lightMode = {
    primary: getColor(lightColors, 'primary', '#DF3A6C'),
    primaryHover: getColor(lightColors, 'primaryHover', '#553C9A'),
    secondary: getColor(lightColors, 'secondary', '#ff9776'),
    secondaryHover: getColor(lightColors, 'secondaryHover', '#e6855a'),
    accent: getColor(lightColors, 'accent', '#00539F'),
    accentHover: getColor(lightColors, 'accentHover', '#0066cc'),
    textPrimary: getColor(lightColors, 'textPrimary', '#DF3A6C'),
    textSecondary: getColor(lightColors, 'textSecondary', '#DF6C3A'),
    textMuted: getColor(lightColors, 'textMuted', '#C4A1B4'),
    textInverse: getColor(lightColors, 'textInverse', '#1E1E1E'),
    bgPrimary: getColor(lightColors, 'bgPrimary', '#f1f5f9'),
    bgSecondary: getColor(lightColors, 'bgSecondary', '#fff'),
    bgTertiary: getColor(lightColors, 'bgTertiary', '#F8FCFD'),
    bgDark: getColor(lightColors, 'bgDark', '#4c1d95'),
    borderLight: getColor(lightColors, 'borderLight', '#eee'),
    borderMedium: getColor(lightColors, 'borderMedium', '#dee2e6'),
    borderDotted: getColor(lightColors, 'borderDotted', '#a1a1a1'),
    iconHeart: getColor(lightColors, 'iconHeart', '#e91e63'),
    iconRetweet: getColor(lightColors, 'iconRetweet', '#00bcd4'),
    iconComment: getColor(lightColors, 'iconComment', '#2196f3'),
    iconQuote: getColor(lightColors, 'iconQuote', '#9c27b0'),
    iconTwitter: getColor(lightColors, 'iconTwitter', '#1da1f2'),
    iconGithub: getColor(lightColors, 'iconGithub', '#333'),
    iconYoutube: getColor(lightColors, 'iconYoutube', '#ff0000'),
  };
  
  // Dark Mode CSS (optional - uses light mode as fallback)
  const darkMode = {
    primary: getColor(darkColors, 'primary', lightMode.primary),
    primaryHover: getColor(darkColors, 'primaryHover', lightMode.primaryHover),
    secondary: getColor(darkColors, 'secondary', lightMode.secondary),
    secondaryHover: getColor(darkColors, 'secondaryHover', lightMode.secondaryHover),
    accent: getColor(darkColors, 'accent', lightMode.accent),
    accentHover: getColor(darkColors, 'accentHover', lightMode.accentHover),
    textPrimary: getColor(darkColors, 'textPrimary', lightMode.textPrimary),
    textSecondary: getColor(darkColors, 'textSecondary', lightMode.textSecondary),
    textMuted: getColor(darkColors, 'textMuted', lightMode.textMuted),
    textInverse: getColor(darkColors, 'textInverse', lightMode.textInverse),
    bgPrimary: getColor(darkColors, 'bgPrimary', lightMode.bgPrimary),
    bgSecondary: getColor(darkColors, 'bgSecondary', lightMode.bgSecondary),
    bgTertiary: getColor(darkColors, 'bgTertiary', lightMode.bgTertiary),
    bgDark: getColor(darkColors, 'bgDark', lightMode.bgDark),
    borderLight: getColor(darkColors, 'borderLight', lightMode.borderLight),
    borderMedium: getColor(darkColors, 'borderMedium', lightMode.borderMedium),
    borderDotted: getColor(darkColors, 'borderDotted', lightMode.borderDotted),
    iconHeart: getColor(darkColors, 'iconHeart', lightMode.iconHeart),
    iconRetweet: getColor(darkColors, 'iconRetweet', lightMode.iconRetweet),
    iconComment: getColor(darkColors, 'iconComment', lightMode.iconComment),
    iconQuote: getColor(darkColors, 'iconQuote', lightMode.iconQuote),
    iconTwitter: getColor(darkColors, 'iconTwitter', lightMode.iconTwitter),
    iconGithub: getColor(darkColors, 'iconGithub', lightMode.iconGithub),
    iconYoutube: getColor(darkColors, 'iconYoutube', lightMode.iconYoutube),
  };
  
  return `
    :root,
    [data-theme="light"] {
      /* Primary colors */
      --color-primary: ${lightMode.primary};
      --color-primary-hover: ${lightMode.primaryHover};
      --color-secondary: ${lightMode.secondary};
      --color-secondary-hover: ${lightMode.secondaryHover};
      --color-accent: ${lightMode.accent};
      --color-accent-hover: ${lightMode.accentHover};
      
      /* Text colors */
      --color-text-primary: ${lightMode.textPrimary};
      --color-text-secondary: ${lightMode.textSecondary};
      --color-text-muted: ${lightMode.textMuted};
      --color-text-inverse: ${lightMode.textInverse};
      
      /* Background colors */
      --color-bg-primary: ${lightMode.bgPrimary};
      --color-bg-secondary: ${lightMode.bgSecondary};
      --color-bg-tertiary: ${lightMode.bgTertiary};
      --color-bg-dark: ${lightMode.bgDark};
      
      /* Border colors */
      --color-border-light: ${lightMode.borderLight};
      --color-border-medium: ${lightMode.borderMedium};
      --color-border-dotted: ${lightMode.borderDotted};
      
      /* Icon colors */
      --icon-heart: ${lightMode.iconHeart};
      --icon-retweet: ${lightMode.iconRetweet};
      --icon-comment: ${lightMode.iconComment};
      --icon-quote: ${lightMode.iconQuote};
      --icon-twitter: ${lightMode.iconTwitter};
      --icon-github: ${lightMode.iconGithub};
      --icon-youtube: ${lightMode.iconYoutube};
    }
    
    [data-theme="dark"] {
      /* Primary colors */
      --color-primary: ${darkMode.primary};
      --color-primary-hover: ${darkMode.primaryHover};
      --color-secondary: ${darkMode.secondary};
      --color-secondary-hover: ${darkMode.secondaryHover};
      --color-accent: ${darkMode.accent};
      --color-accent-hover: ${darkMode.accentHover};
      
      /* Text colors */
      --color-text-primary: ${darkMode.textPrimary};
      --color-text-secondary: ${darkMode.textSecondary};
      --color-text-muted: ${darkMode.textMuted};
      --color-text-inverse: ${darkMode.textInverse};
      
      /* Background colors */
      --color-bg-primary: ${darkMode.bgPrimary};
      --color-bg-secondary: ${darkMode.bgSecondary};
      --color-bg-tertiary: ${darkMode.bgTertiary};
      --color-bg-dark: ${darkMode.bgDark};
      
      /* Border colors */
      --color-border-light: ${darkMode.borderLight};
      --color-border-medium: ${darkMode.borderMedium};
      --color-border-dotted: ${darkMode.borderDotted};
      
      /* Icon colors */
      --icon-heart: ${darkMode.iconHeart};
      --icon-retweet: ${darkMode.iconRetweet};
      --icon-comment: ${darkMode.iconComment};
      --icon-quote: ${darkMode.iconQuote};
      --icon-twitter: ${darkMode.iconTwitter};
      --icon-github: ${darkMode.iconGithub};
      --icon-youtube: ${darkMode.iconYoutube};
    }
  `;
}
