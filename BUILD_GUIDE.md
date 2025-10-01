# 📦 Building FlashCards Pro APK

## ✅ Configuration Complete

Your app is ready to build! Here's what's been set up:

- ✅ EAS configuration (`eas.json`)
- ✅ App name: **FlashCards Pro**
- ✅ Package: `com.flashcardspro.app`
- ✅ Version: 1.0.0
- ✅ Build type: APK (for easy installation)

## 🚀 Build Steps

### 1. Login to Expo (if not already logged in)

```bash
npx eas-cli login
```

Enter your Expo account credentials (or create account at expo.dev)

### 2. Build the APK

```bash
npx eas-cli build --platform android --profile preview
```

This will:
- Upload your code to EAS servers
- Build the APK in the cloud
- Provide a download link when done

**Build time:** ~10-15 minutes

### 3. Download & Install

Once build completes:
1. Click the download link in terminal
2. Transfer APK to your Android phone
3. Install (you may need to enable "Install from unknown sources")
4. Done! 🎉

## 📱 What You'll Get

**App Name:** FlashCards Pro
**Package:** com.flashcardspro.app
**Size:** ~30-40 MB
**Min Android:** 6.0 (API 23)

## 🎯 All Features Included

✅ Spaced repetition algorithm
✅ Multiple study modes (Flashcard, Multiple Choice, Typing)
✅ Text-to-Speech
✅ CSV import/export
✅ Deck settings & customization
✅ Hints system
✅ Statistics tracking
✅ Offline functionality
✅ Responsive design
✅ Geist UI design system

## 🔧 Build Profiles

We have 3 build profiles in `eas.json`:

**Preview** (recommended for testing):
```bash
npx eas-cli build --platform android --profile preview
```
- Builds APK (easy to install)
- Internal distribution
- Perfect for testing

**Production** (for Play Store):
```bash
npx eas-cli build --platform android --profile production
```
- Builds AAB (Android App Bundle)
- Optimized for Play Store
- Use when ready to publish

**Development**:
```bash
npx eas-cli build --platform android --profile development
```
- Includes dev tools
- For debugging

## 📝 Notes

- **First build?** You'll be asked to generate Android keystore (say yes)
- **Build queue:** Free tier has limited builds per month
- **Download link:** Valid for 30 days
- **Updates:** Increment `versionCode` in app.json for updates

## 🆘 Troubleshooting

**"Not logged in"**
```bash
npx eas-cli login
```

**"Project not configured"**
```bash
npx eas-cli build:configure
```

**"Build failed"**
- Check terminal for errors
- Usually dependency or configuration issues
- Contact support at expo.dev

## 🎊 Ready to Build!

Run this command now:

```bash
npx eas-cli build --platform android --profile preview
```

Then wait for the download link! ⏳

---

**Questions?** Check https://docs.expo.dev/build/introduction/
