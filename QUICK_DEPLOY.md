# 🚀 Quick Deploy Reference

## Current Status
✅ GitHub Pages setup complete  
⚠️ Web storage needed (SQLite → IndexedDB/Mock)

---

## Fastest Path to Live App

### Option A: Mobile (10 min) - RECOMMENDED
```bash
npx eas-cli build --platform android --profile preview
```
✅ All features work  
✅ Production ready  
📱 Download APK and install

---

### Option B: Web Demo (15 min)
1. Create `src/database/mockData.ts` with sample data
2. Update `App.tsx` to skip DB on web
3. Run: `npm run deploy`

🌐 Live at: `https://zendevve.github.io/react-native-flashcards/`

---

### Option C: Full Web (2-3 hrs)
1. `npm install dexie`
2. Create `src/database/webDb.ts` (IndexedDB)
3. Update repositories
4. `npm run deploy`

🌐 Fully functional web app

---

## Deploy Commands

```bash
# Test locally
npm run build:web
npx serve dist

# Deploy manually
npm run deploy

# Deploy via GitHub Actions (auto)
git push origin main
```

---

## Enable GitHub Pages

1. Go to repo Settings → Pages
2. Source: "GitHub Actions"
3. Save

---

## Need Help?

📖 **Read these in order:**
1. `WEB_DEPLOYMENT_STATUS.md` - Choose your path
2. `GITHUB_PAGES_DEPLOYMENT.md` - Implementation guide
3. `DEPLOYMENT_SUMMARY.md` - Mobile deployment

---

**Your URL:** `https://zendevve.github.io/react-native-flashcards/`  
**Status:** Infrastructure ready, storage implementation needed
