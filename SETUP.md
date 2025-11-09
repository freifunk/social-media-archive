# Setup Guide for Forking and Customizing

This guide explains how to fork this repository and customize it for your own social media archive.

## Table of Contents

1. [Forking the Repository](#forking-the-repository)
2. [Initial Setup](#initial-setup)
3. [Customizing Your Site](#customizing-your-site)
4. [Setting Up Your Database](#setting-up-your-database)
5. [Building the Site](#building-the-site)
6. [Keeping Up with Updates](#keeping-up-with-updates)

## Forking the Repository

1. Click the "Fork" button on GitHub to create your own copy of this repository
2. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/social-media-archive.git
   cd social-media-archive
   ```
3. Add the original repository as an upstream remote (for receiving updates):
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/social-media-archive.git
   ```

## Initial Setup

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Install Python dependencies (for build scripts):
   ```bash
   cd build
   pip install -r requirements.txt
   cd ..
   ```

## Customizing Your Site

All customization is done through configuration files, making it easy to maintain your fork while receiving updates from upstream.

### 1. Visual Customization (Colors, Logo, Favicons)

**Important**: Don't edit `astro.config.mjs` directly! Instead, use `custom.config.mjs` to avoid merge conflicts when updating from upstream.

1. **Copy the example config**:
   ```bash
   cp custom.config.example.mjs custom.config.mjs
   ```

2. **Edit `custom.config.mjs`** to customize your site:

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
  
  // Logo configuration
  logo: {
    alt: 'My Site Logo',
    possibleNames: ['logo.png', 'logo.svg']
  },
  
  // Favicon paths
  favicons: {
    favicon32x32: '/favicon-32x32.png',
    favicon192x192: '/favicon-192x192.png',
    appleTouchIcon: '/apple-touch-icon.png'
  }
};
```

**Note**: 
- Light mode uses Freifunk defaults (original design)
- Dark mode is optional - if you don't provide `colors.dark`, light mode colors will be used for dark mode too
- You can customize both modes separately, or just one

**Why `custom.config.mjs`?**
- ✅ It's in `.gitignore` - your customizations won't be committed
- ✅ No merge conflicts when updating from upstream
- ✅ Only override what you need - defaults are in `config-loader.mjs`

### 2. Adding Your Assets

Place your assets in the `public/` directory:

- **Logo**: `logo.png` (or svg, jpg, webp) - will be used automatically
- **Favicons**: 
  - `favicon-32x32.png` (32x32 pixels)
  - `favicon-192x192.png` (192x192 pixels)
  - `apple-touch-icon.png` (180x180 pixels)

### 3. Customizing About Page Content

Edit `src/config/about.ts` to customize the About page content:

```typescript
export const aboutContent = {
  pageTitle: 'About My Archive',
  sections: {
    website: {
      title: 'About the Website',
      paragraphs: [
        { text: 'Your custom content here...' }
      ]
    }
    // Add more sections as needed
  }
};
```

### 4. Site Configuration

Edit `src/config/site.ts` to customize:

#### Basic Information
- `title`: Site title
- `description`: Site description
- `siteName`: Site name

#### Logo Size Settings
- `logo.desktop.height`: Logo height on desktop
- `logo.mobile.height`: Logo height on mobile

#### Navigation Labels
- `navigation.search`: Label for search link
- `navigation.tweets`: Label for tweets link
- `navigation.about`: Label for about link

### 5. Search Configuration

Edit `src/config/search.ts` to customize search behavior and UI text.

## Setting Up Your Database

### 1. Prepare Your SQLite Database

Ensure your SQLite database has:
- A table containing your tweets (default table name: `tweet`)
- Required columns: `id`, `tweetID`, `text`, and other tweet metadata

### 2. Create Build Configuration

Copy the example configuration file:
```bash
cp build/config.example.json build/config.json
```

Edit `build/config.json` with your database settings:
```json
{
  "database": {
    "path": "path/to/your/database.sqlite3",
    "tweet_table": "tweet",
    "url_table": "resolved_urls"
  },
  "output": {
    "directory": "./src/content/tweets"
  },
  "url_resolution": {
    "enabled": true,
    "timeout_seconds": 10,
    "max_retries": 3
  }
}
```

### 3. Resolve URLs (Optional but Recommended)

If your tweets contain t.co short links, resolve them first:
```bash
cd build
python url_extraction.py --config config.json
```

This will:
- Extract all t.co URLs from your tweets
- Resolve them to their final destinations
- Store the mappings in the `resolved_urls` table

### 4. Extract Tweets to Markdown

Convert your tweets to Markdown files:
```bash
cd build
python sql_extraction.py --config config.json
```

This will:
- Read tweets from your SQLite database
- Replace t.co URLs with resolved URLs (if available)
- Generate Markdown files in `src/content/tweets/`

## Building the Site

### Development

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:4321`

### Production Build

Build the static site:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

The built files will be in the `dist/` directory.

## Deploying with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys your site when you push to the `main` branch.

### Workflow Overview

The deployment workflow:
1. Downloads your SQLite database from a remote server
2. Extracts tweets and converts them to Markdown
3. Builds the static site
4. Deploys the built site to your server

### Setting Up GitHub Secrets

To use the GitHub Actions deployment, you need to configure the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

#### Database Server Secrets (for downloading the SQLite database)

- **`PRIVATE_SERVER_SSH_KEY`**: Private SSH key to access the server where your SQLite database is stored
  - Generate with: `ssh-keygen -t rsa -b 4096 -C "github-actions"`
  - Add the public key to your server's `~/.ssh/authorized_keys`
  - Copy the private key content to this secret

- **`PRIVATE_SERVER_HOST`**: Hostname or IP address of the server with your database
  - Example: `example.com` or `192.168.1.100`

- **`PRIVATE_SERVER_USER`**: Username for SSH access to the database server
  - Example: `deploy` or `ubuntu`

- **`PRIVATE_SERVER_PORT`** (optional): SSH port for the database server
  - Default: `22` if not specified

- **`SQLITE_DB_PATH`**: Full path to your SQLite database file on the server
  - Example: `/home/user/data/tweets.sqlite3` or `/var/db/archive.db`

#### Deployment Server Secrets (for deploying the built site)

- **`DEPLOY_HOST`**: Hostname or IP address of your deployment server
  - Example: `example.com` or `192.168.1.100`

- **`DEPLOY_USER`**: Username for SSH access to the deployment server
  - Example: `www-data` or `deploy`

- **`DEPLOY_SSH_KEY`**: Private SSH key to access the deployment server
  - Generate with: `ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"`
  - Add the public key to your deployment server's `~/.ssh/authorized_keys`
  - Copy the private key content to this secret

- **`DEPLOY_PORT`** (optional): SSH port for the deployment server
  - Default: `22` if not specified

- **`DEPLOY_PATH`**: Target directory on the deployment server where the site will be deployed
  - Example: `/var/www/html` or `/home/user/public_html`

### Alternative: Using Local Database

If your database is stored locally or in a different location, you can modify the workflow:

1. **Option 1**: Upload database to GitHub (not recommended for large databases)
   - Add your database to the repository (consider using Git LFS for large files)
   - Modify the workflow to skip the download step

2. **Option 2**: Use a different database source
   - Modify `.github/workflows/deploy.yml` to download from a different source (S3, cloud storage, etc.)
   - Or use the config file approach with a database stored in the repository

### Customizing the Workflow

You can customize the deployment workflow by editing `.github/workflows/deploy.yml`:

- **Change the trigger branch**: Modify the `on.push.branches` section
- **Use config file**: Update the extraction step to use `--config config.json` instead of command-line arguments
- **Add additional build steps**: Insert steps before or after the build process
- **Change deployment method**: Replace the SCP action with other deployment methods (FTP, rsync, etc.)

Example: Using config file in workflow
```yaml
- name: Extract tweets from SQLite
  run: |
    cd build
    python sql_extraction.py --config config.json
```

### Testing the Workflow

1. Push your changes to the `main` branch
2. Go to the **Actions** tab in your GitHub repository
3. Watch the workflow run
4. Check the logs if any step fails

### Troubleshooting Deployment

- **SSH connection fails**: Verify your SSH keys are correctly configured
- **Database download fails**: Check that the database path and server credentials are correct
- **Deployment fails**: Verify the deployment server has write permissions to the target directory
- **Build fails**: Check the build logs for specific errors

### Security Best Practices

1. **Never commit secrets**: All sensitive information should be in GitHub Secrets, not in code
2. **Use separate SSH keys**: Use different SSH keys for database access and deployment
3. **Limit SSH key permissions**: Create dedicated users with minimal required permissions
4. **Rotate keys regularly**: Update SSH keys periodically for security
5. **Use environment-specific secrets**: Consider using different secrets for different environments (staging, production)

## Keeping Up with Updates

### Automatic Dependency Updates with Renovate

This repository is configured with Renovate Bot for automatic dependency updates. If you've forked the repository:

1. Install Renovate Bot in your GitHub repository (if not already installed)
2. The `renovate.json` configuration will automatically update:
   - npm dependencies (minor and patch versions)
   - Python dependencies
   - Other configured dependencies

### Manual Updates from Upstream

To manually pull updates from the original repository:

1. Fetch updates from upstream:
   ```bash
   git fetch upstream
   ```

2. Merge updates into your main branch:
   ```bash
   git checkout main
   git merge upstream/main
   ```

3. If there are conflicts, resolve them:
   - Configuration files (`src/config/site.ts`, `build/config.json`) are designed to be customized, so conflicts here are expected
   - Resolve conflicts by keeping your customizations
   - For other files, prefer upstream changes unless you have specific customizations

### Handling Merge Conflicts

The project is structured to minimize merge conflicts:

- **Configuration files** (`src/config/site.ts`, `build/config.json`): These are meant to be customized. Keep your customizations when merging.
- **Component files**: If you've customized components, you may need to manually merge changes.
- **Build scripts**: Usually safe to accept upstream changes unless you've made custom modifications.

### Best Practices

1. **Keep customizations in config files**: All design and content customizations should be in `src/config/site.ts` and `build/config.json`
2. **Don't modify core components unnecessarily**: If you need to change component behavior, consider if it can be done via configuration first
3. **Test after updates**: Always test your site after pulling upstream updates
4. **Commit your config**: Keep your `build/config.json` in version control (but add `build/config.json` to `.gitignore` if it contains sensitive paths)

## Troubleshooting

### Build Script Errors

- **Database not found**: Check that the path in `build/config.json` is correct
- **Table not found**: Verify the table name matches your database schema
- **Permission errors**: Ensure the output directory is writable

### CSS Variables Not Updating

- Clear your browser cache
- Restart the development server
- Check that `src/utils/theme.ts` is generating CSS correctly

### Merge Conflicts

- Configuration conflicts: Keep your custom values
- Component conflicts: Review upstream changes and merge manually
- Build script conflicts: Usually safe to accept upstream changes

## Additional Resources

- [Astro Documentation](https://docs.astro.build)
- [Renovate Bot Documentation](https://docs.renovatebot.com)
- Original repository README for project-specific details

