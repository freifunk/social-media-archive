# Astro Site with Dynamic Theming

A customizable Astro site with dynamic logo support and theme configuration.

## Logo Configuration

This site supports dynamic logo loading for easy theming. Place your logo file in the `public/` directory with one of these names (in order of preference):

1. `logo.png`
2. `logo.svg` 
3. `logo.jpg`
4. `logo.jpeg`
5. `logo.webp`
6. `logo_freifunknet.png` (current fallback)

### Logo Requirements

- **Desktop size**: 80px height (auto width)
- **Mobile size**: 60px height (auto width)
- **Supported formats**: PNG, SVG, JPG, JPEG, WebP
- **Recommended**: SVG for best scalability and performance

## Theme Customization

### Quick Theme Setup

1. **Replace the logo**: Add your `logo.png` (or preferred format) to the `public/` folder
2. **Update site config**: Edit `src/config/site.ts` to customize:
   - Site title and description
   - Logo alt text
   - Logo size preferences
   - Theme colors (for future use)

### Advanced Customization

**CSS Variables**: All design tokens are defined in `src/styles/variables.css`
- Colors: `--color-primary`, `--color-secondary`, etc.
- Typography: `--font-size-*`, `--line-height-*`
- Spacing: `--spacing-*`
- Logo sizes: `--logo-height-desktop`, `--logo-height-mobile`

**Site Configuration**: `src/config/site.ts` contains:
- Logo preferences and sizing
- Site metadata
- Theme color definitions

## File Structure

```
src/
├── config/
│   └── site.ts          # Site configuration
├── styles/
│   ├── variables.css    # CSS custom properties
│   ├── typography.css   # Text styles
│   ├── layout.css       # Layout utilities
│   ├── components.css   # Component styles
│   ├── navigation.css   # Navigation styles
│   └── global.css       # Main stylesheet
├── utils/
│   └── logo.ts          # Logo utility functions
└── layouts/
    └── BaseLayout.astro # Main layout with dynamic logo
```

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## Creating a New Theme

1. Create a new logo file and place it in `public/` as `logo.png`
2. Update `src/config/site.ts` with your site information
3. Modify CSS variables in `src/styles/variables.css` for colors and styling
4. Customize content in your pages and components

The site will automatically use your new logo and styling!