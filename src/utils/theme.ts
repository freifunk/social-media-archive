// Utility to generate CSS variables from site configuration
import { siteConfig } from '../config/site';

/**
 * Generates CSS custom properties from siteConfig.theme
 * @returns CSS string with :root variables
 */
export function generateThemeCSS(): string {
  const theme = siteConfig.theme;
  
  return `
    :root {
      /* Primary colors */
      --color-primary: ${theme.primary};
      --color-primary-hover: ${theme.primaryHover};
      --color-secondary: ${theme.secondary};
      --color-secondary-hover: ${theme.secondaryHover};
      --color-accent: ${theme.accent};
      --color-accent-hover: ${theme.accentHover};
      
      /* Text colors */
      --color-text-primary: ${theme.textPrimary};
      --color-text-secondary: ${theme.textSecondary};
      --color-text-muted: ${theme.textMuted};
      --color-text-inverse: ${theme.textInverse};
      
      /* Background colors */
      --color-bg-primary: ${theme.bgPrimary};
      --color-bg-secondary: ${theme.bgSecondary};
      --color-bg-tertiary: ${theme.bgTertiary};
      --color-bg-dark: ${theme.bgDark};
      
      /* Border colors */
      --color-border-light: ${theme.borderLight};
      --color-border-medium: ${theme.borderMedium};
      --color-border-dotted: ${theme.borderDotted};
      
      /* Icon colors */
      --icon-heart: ${theme.iconHeart};
      --icon-retweet: ${theme.iconRetweet};
      --icon-comment: ${theme.iconComment};
      --icon-quote: ${theme.iconQuote};
      --icon-twitter: ${theme.iconTwitter};
      --icon-github: ${theme.iconGithub};
      --icon-youtube: ${theme.iconYoutube};
    }
  `;
}

