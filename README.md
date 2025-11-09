# Freifunk's Social Media Archive

A customizable Astro site designed for Freifunk as a Social Media Archive explorer

## Customization

This site is designed to be easily customizable. Forks can customize colors, logos, and favicons without modifying files that are tracked in git.

### Quick Customization for Forks

1. **Copy the example config**:
   ```bash
   cp custom.config.example.mjs custom.config.mjs
   ```

2. **Edit `custom.config.mjs`** - Customize:
   - **Colors**: Override only the colors you want to change
   - **Logo**: Logo alt text and possible file names
   - **Favicons**: Paths to your favicon files

3. **Add your assets** - Place your logo and favicons in the `public/` directory:
   - Logo: `logo.png` (or svg, jpg, webp)
   - Favicons: `favicon-32x32.png`, `favicon-192x192.png`, `apple-touch-icon.png`

4. **Customize About page** (optional) - Edit `src/config/about.ts` to customize the About page content

### How It Works

- **`config-loader.mjs`** - Contains default Freifunk configuration
- **`custom.config.mjs`** - Your fork-specific overrides (not tracked in git)
- **`astro.config.mjs`** - Loads and merges both configs

This means:
- ✅ You can update from upstream without merge conflicts
- ✅ Your customizations stay in `custom.config.mjs` (ignored by git)
- ✅ Only override what you need to change

### Example Custom Configuration

```javascript
// custom.config.mjs
export default {
  // Colors - Separate light and dark mode configurations
  colors: {
    // Light Mode (optional - if not provided, uses Freifunk defaults)
    // light: { ... },
    
    // Dark Mode (optional - if not provided, light mode will be used)
    dark: {
      primary: '#0F1C33',
      primaryHover: '#1a2d4d',
      accent: '#C0C0C0',
      textPrimary: '#FFFFFF',
      bgPrimary: '#0F1C33',
      // ... customize dark mode colors
    }
  },
  
  logo: {
    alt: 'My Site Logo',
    possibleNames: ['logo.png', 'logo.svg']
  }
};
```

**Note**: Light mode uses Freifunk defaults (original design). Dark mode is optional - if you don't provide `colors.dark`, the light mode colors will be used for dark mode too.

## Logo Configuration

Place your logo file in the `public/` directory with one of these names (in order of preference):

1. `logo.png`
2. `logo.svg` 
3. `logo.jpg`
4. `logo.jpeg`
5. `logo.webp`
6. `logo_freifunknet.png` (fallback)

### Logo Requirements

- **Desktop size**: 80px height (auto width)
- **Mobile size**: 60px height (auto width)
- **Supported formats**: PNG, SVG, JPG, JPEG, WebP
- **Recommended**: SVG for best scalability and performance

## File Structure

```
├── astro.config.mjs          # Astro config (loads from config-loader)
├── config-loader.mjs         # Default config + custom.config.mjs loader
├── custom.config.example.mjs # Template for forks (copy to custom.config.mjs)
├── custom.config.mjs         # Your custom config (not tracked in git)
└── src/
    ├── config/
    │   ├── site.ts          # Site configuration (logo sizes, navigation)
    │   ├── about.ts         # About page content (optional to customize)
    │   └── search.ts        # Search configuration
    ├── styles/
    │   ├── variables.css    # CSS custom properties (base definitions)
    │   ├── typography.css   # Text styles
    │   ├── layout.css       # Layout utilities
    │   ├── components.css   # Component styles
    │   ├── navigation.css   # Navigation styles
    │   └── global.css       # Main stylesheet
    ├── utils/
    │   └── theme.ts         # CSS generator from config
    └── layouts/
        └── BaseLayout.astro # Main layout
```

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## Dark Mode

The site includes a Dark Mode toggle that respects system preferences. Users can manually switch between light and dark modes, and their preference is saved in localStorage.

The Dark Mode feature works automatically with all color configurations.
