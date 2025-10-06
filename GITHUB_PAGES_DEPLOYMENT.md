# 🚀 GitHub Pages Deployment Guide

## ⚠️ Important Notice

**FlashCards Pro is primarily a mobile application** built with React Native and uses SQLite for data storage. SQLite requires additional WASM configuration to work in web browsers, which is not currently implemented.

### Current Status:
- ✅ **Mobile (Android/iOS)**: Fully functional with all features
- ⚠️ **Web**: Requires web-compatible storage implementation

### Recommended Deployment Options:

1. **Mobile App Stores** (Recommended)
   - Google Play Store (Android)
   - Apple App Store (iOS)
   - See `DEPLOYMENT_SUMMARY.md` for mobile deployment guide

2. **Expo Web Preview** (Demo/Testing)
   - Limited functionality without database
   - Good for UI preview and testing

3. **GitHub Pages with Web Storage** (Requires Implementation)
   - Replace SQLite with IndexedDB or localStorage
   - See "Web Compatibility Implementation" section below

---

## Prerequisites

- Git repository pushed to GitHub
- GitHub account with access to repository settings
- Node.js and npm installed locally

---

## Deployment Methods

### Method 1: Automated Deployment (GitHub Actions) ⚡ **RECOMMENDED**

This method automatically deploys your app whenever you push to the main branch.

#### Setup Steps:

1. **Enable GitHub Pages in Repository Settings:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Click **Save**

2. **Push Your Code:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Monitor Deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow
   - Once complete (green checkmark), your app is live!

4. **Access Your App:**
   - Visit: `https://zendevve.github.io/react-native-flashcards/`
   - Or check the deployment URL in the Actions workflow output

#### How It Works:

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
- Installs dependencies
- Builds the web version using Expo
- Deploys to GitHub Pages
- Runs on every push to `main` branch

---

### Method 2: Manual Deployment (Local) 🛠️

Deploy manually from your local machine.

#### Setup Steps:

1. **Build and Deploy:**
   ```bash
   npm run deploy
   ```

   This command:
   - Runs `expo export --platform web` to build the app
   - Deploys the `dist` folder to the `gh-pages` branch
   - Pushes to GitHub

2. **Enable GitHub Pages:**
   - Go to **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Select branch: **gh-pages**
   - Select folder: **/ (root)**
   - Click **Save**

3. **Wait for Deployment:**
   - GitHub will process the deployment (1-2 minutes)
   - Check the Pages section for the live URL

4. **Access Your App:**
   - Visit: `https://zendevve.github.io/react-native-flashcards/`

---

## Configuration Details

### Package.json Scripts

```json
{
  "scripts": {
    "build:web": "expo export --platform web",
    "predeploy": "npm run build:web",
    "deploy": "gh-pages -d dist"
  }
}
```

- **build:web**: Exports Expo app as static web files
- **predeploy**: Automatically runs before deploy
- **deploy**: Publishes `dist` folder to `gh-pages` branch

### App.json Configuration

```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "output": "static"
    }
  }
}
```

- **bundler**: Uses Metro bundler for web
- **output**: Generates static files for hosting

---

## Troubleshooting

### Issue: 404 Error on GitHub Pages

**Solution:**
- Ensure GitHub Pages is enabled in repository settings
- Check that the source is set correctly (GitHub Actions or gh-pages branch)
- Wait 1-2 minutes for deployment to complete
- Clear browser cache and try again

### Issue: Build Fails in GitHub Actions

**Solution:**
- Check the Actions tab for error logs
- Ensure `package-lock.json` is committed
- Verify all dependencies are listed in `package.json`
- Check Node.js version compatibility (using Node 20)

### Issue: App Loads but Features Don't Work

**Possible Causes:**
- **SQLite**: Not supported in web browsers
  - **Solution**: Implement web-compatible storage (localStorage, IndexedDB)
- **File System**: `expo-file-system` doesn't work on web
  - **Solution**: Use Web APIs (File API, Blob)
- **Native Modules**: Some Expo modules are mobile-only

**Note:** This app uses SQLite which requires adaptation for web deployment. See "Web Compatibility" section below.

### Issue: Blank Page After Deployment

**Solution:**
- Check browser console for errors (F12)
- Verify base path configuration
- Ensure all assets are properly bundled
- Check that `index.html` exists in `dist` folder

---

## Web Compatibility Considerations

### Current Limitations:

This app was built for mobile (Android/iOS) and uses features that need adaptation for web:

1. **SQLite Database** (`expo-sqlite`)
   - Not available in browsers
   - **Alternative**: Use `@react-native-async-storage/async-storage` or IndexedDB

2. **File System** (`expo-file-system`)
   - Limited on web
   - **Alternative**: Use Web File API

3. **Document Picker** (`expo-document-picker`)
   - Works differently on web
   - **Alternative**: Use HTML `<input type="file">`

### Recommended Approach:

For full web functionality, consider:

1. **Create Platform-Specific Database Layer:**
   ```typescript
   // database/webDb.ts - for web
   // database/mobileDb.ts - for mobile
   // database/index.ts - platform selector
   ```

2. **Use Platform Detection:**
   ```typescript
   import { Platform } from 'react-native';
   
   if (Platform.OS === 'web') {
     // Use web-compatible storage
   } else {
     // Use SQLite
   }
   ```

3. **Test Web Build Locally:**
   ```bash
   npm run build:web
   npx serve dist
   ```

---

## Web Compatibility Implementation Guide

### Option 1: Quick Demo Build (UI Preview Only)

If you just want to showcase the UI without full functionality:

1. **Create a mock database layer:**
   ```typescript
   // src/database/mockDb.ts
   export const getDatabase = async () => ({ mock: true });
   ```

2. **Update App.tsx to skip database init on web:**
   ```typescript
   if (Platform.OS !== 'web') {
     // Initialize database only on mobile
   }
   ```

3. **Add sample data in components:**
   - Hardcode sample decks and cards for demo
   - Disable create/edit/delete operations

### Option 2: Full Web Implementation (IndexedDB)

For a fully functional web version:

1. **Install Dexie.js (IndexedDB wrapper):**
   ```bash
   npm install dexie
   ```

2. **Create web database layer:**
   ```typescript
   // src/database/webDb.ts
   import Dexie from 'dexie';
   
   class FlashcardsDB extends Dexie {
     decks: Dexie.Table<Deck, string>;
     cards: Dexie.Table<Card, string>;
     sessions: Dexie.Table<StudySession, string>;
     
     constructor() {
       super('FlashcardsDB');
       this.version(1).stores({
         decks: 'id, name, createdAt, updatedAt',
         cards: 'id, deckId, nextReviewDate, state',
         sessions: 'id, deckId, startTime'
       });
     }
   }
   
   export const webDb = new FlashcardsDB();
   ```

3. **Create platform selector:**
   ```typescript
   // src/database/index.ts
   import { Platform } from 'react-native';
   
   export const getDatabase = async () => {
     if (Platform.OS === 'web') {
       const { webDb } = await import('./webDb');
       return webDb;
     } else {
       const { getDatabase } = await import('./db');
       return getDatabase();
     }
   };
   ```

4. **Update repositories to use platform-agnostic queries:**
   - Modify `deckRepository.ts` and `cardRepository.ts`
   - Use conditional logic for SQLite vs IndexedDB queries

### Option 3: Use Expo SQLite Web Support

Expo SQLite has experimental web support using WASM:

1. **Install required dependencies:**
   ```bash
   npm install @sqlite.org/sqlite-wasm
   ```

2. **Configure Metro bundler for WASM:**
   Create `metro.config.js`:
   ```javascript
   const { getDefaultConfig } = require('expo/metro-config');
   
   const config = getDefaultConfig(__dirname);
   
   config.resolver.assetExts.push('wasm');
   
   module.exports = config;
   ```

3. **Update app.json:**
   ```json
   {
     "expo": {
       "web": {
         "bundler": "metro"
       }
     }
   }
   ```

4. **Test the build:**
   ```bash
   npm run build:web
   ```

**Note:** This approach is experimental and may have limitations.

---

## Updating Your Deployment

### Automated (GitHub Actions):
Simply push changes to main:
```bash
git add .
git commit -m "Update app"
git push origin main
```

### Manual:
Run the deploy command:
```bash
npm run deploy
```

---

## Custom Domain (Optional)

To use a custom domain like `flashcards.yourdomain.com`:

1. **Add CNAME File:**
   Create `public/CNAME` with your domain:
   ```
   flashcards.yourdomain.com
   ```

2. **Configure DNS:**
   Add CNAME record pointing to: `zendevve.github.io`

3. **Update GitHub Settings:**
   - Go to **Settings** → **Pages**
   - Enter your custom domain
   - Enable **Enforce HTTPS**

---

## Performance Optimization

### For Production Deployment:

1. **Enable Compression:**
   - GitHub Pages automatically serves gzip
   - No additional configuration needed

2. **Optimize Assets:**
   - Compress images before deployment
   - Use WebP format for better compression
   - Minimize icon sizes

3. **Bundle Size:**
   - Current build size: ~2-5 MB (typical for Expo web)
   - Consider code splitting for larger apps

---

## Monitoring

### Check Deployment Status:

1. **GitHub Actions:**
   - Repository → Actions tab
   - View workflow runs and logs

2. **GitHub Pages:**
   - Repository → Settings → Pages
   - Shows deployment status and URL

3. **Browser Console:**
   - F12 → Console tab
   - Check for runtime errors

---

## Security Notes

- GitHub Pages serves static files only (no server-side code)
- All data processing happens client-side
- No API keys should be committed to the repository
- Use environment variables for sensitive data (if needed)

---

## Next Steps

After successful deployment:

1. **Test All Features:**
   - Create decks
   - Add cards
   - Study sessions
   - Import/Export (if adapted for web)

2. **Share Your App:**
   - Add link to README.md
   - Share on social media
   - Add to portfolio

3. **Monitor Usage:**
   - Use GitHub repository insights
   - Consider adding analytics (Google Analytics, Plausible)

---

## Useful Commands

```bash
# Build web version locally
npm run build:web

# Test built version locally
npx serve dist

# Deploy manually
npm run deploy

# Check for build errors
npm run build:web -- --clear

# View deployment logs
# (GitHub Actions tab in repository)
```

---

## Resources

- **Expo Web Docs**: https://docs.expo.dev/workflow/web/
- **GitHub Pages Docs**: https://docs.github.com/pages
- **GitHub Actions Docs**: https://docs.github.com/actions
- **React Native Web**: https://necolas.github.io/react-native-web/

---

## Summary

✅ **Automated deployment configured**  
✅ **Manual deployment option available**  
✅ **GitHub Actions workflow created**  
✅ **Build scripts configured**  

**Your app will be live at:**  
🌐 `https://zendevve.github.io/react-native-flashcards/`

**Deployment Time:** ~2-3 minutes per deployment  
**Cost:** Free (GitHub Pages is free for public repositories)

---

**Need Help?**  
Check the Actions tab for deployment logs or review the troubleshooting section above.
