// Utility functions for logo handling
import { siteConfig } from '../config/site';

/**
 * Checks if a logo file exists in the public directory
 * Note: This is a client-side check and should be used carefully
 */
export async function checkLogoExists(logoPath: string): Promise<boolean> {
  try {
    const response = await fetch(logoPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets the first available logo from the configured list
 * Falls back to the last option if none are found
 */
export async function getAvailableLogo(): Promise<string> {
  const { possibleNames } = siteConfig.logo;
  
  for (const logoName of possibleNames) {
    const logoPath = `/${logoName}`;
    const exists = await checkLogoExists(logoPath);
    if (exists) {
      return logoPath;
    }
  }
  
  // Fallback to the last configured logo
  return `/${possibleNames[possibleNames.length - 1]}`;
}

/**
 * Preloads logo for better performance
 */
export function preloadLogo(logoPath: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = logoPath;
  document.head.appendChild(link);
}