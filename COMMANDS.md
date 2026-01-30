# 🚀 SecurePass - Command Reference

Quick reference for all available commands and scripts.

---

## 📦 NPM Commands

### Development

```bash
# Start Expo development server
npm start

# Start with cache cleared
npm start -- --clear

# Start in development mode
npm start -- --dev

# Start in production mode
npm start -- --no-dev
```

### Platform-Specific

```bash
# Run on iOS simulator/device
npm run ios

# Run on Android emulator/device
npm run android

# Run in web browser
npm run web
```

### Build & Deploy

```bash
# Build for production
npx expo build:ios
npx expo build:android

# Preview production build
npx expo start --no-dev --minify
```

### Maintenance

```bash
# Install dependencies
npm install

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Lint code
npm run lint

# Clean install
rm -rf node_modules package-lock.json && npm install
```

---

## 🔧 Expo CLI Commands

### Project Management

```bash
# Initialize new project
npx create-expo-app my-app

# Upgrade Expo SDK
npx expo upgrade

# Doctor - Check project health
npx expo doctor

# Check dependencies
npx expo install --check

# Fix dependencies
npx expo install --fix
```

### Development

```bash
# Start development server
npx expo start

# Start with specific options
npx expo start --clear    # Clear cache
npx expo start --offline  # Work offline
npx expo start --lan      # Use LAN connection
npx expo start --tunnel   # Use tunnel connection
```

### Building

```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Build for web
npx expo build:web

# Export for self-hosting
npx expo export
```

### Publishing

```bash
# Publish to Expo
npx expo publish

# Publish with release channel
npx expo publish --release-channel production
```

---

## 🛠️ Development Tools

### Metro Bundler Commands

When the dev server is running, press:

| Key       | Action                     |
| --------- | -------------------------- |
| `a`       | Open Android               |
| `i`       | Open iOS simulator         |
| `w`       | Open web browser           |
| `r`       | Reload app                 |
| `m`       | Toggle menu                |
| `d`       | Show developer menu        |
| `shift+d` | Toggle performance monitor |

---

## 📱 Device Commands

### iOS

```bash
# List iOS simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot "iPhone 14"

# Install on device
npx expo run:ios --device

# Specify simulator
npx expo run:ios --simulator="iPhone 14"
```

### Android

```bash
# List devices/emulators
adb devices

# Start emulator
emulator -avd Pixel_5_API_31

# Install on device
npx expo run:android --device

# Specify device
npx expo run:android --device <device-id>

# View logs
adb logcat
```

---

## 🧪 Testing Commands

### Type Checking

```bash
# Check TypeScript types
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Testing (if tests added)

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## 🔍 Debugging Commands

### Logs

```bash
# View React Native logs
npx react-native log-ios
npx react-native log-android

# View Metro bundler logs
npx expo start --verbose

# View system logs
# iOS: Console.app
# Android: adb logcat
```

### Debug Menu

- **iOS**: `Cmd+D` (simulator) or shake device
- **Android**: `Cmd+M` (emulator) or shake device
- **Web**: Browser DevTools (`F12`)

### Remote Debugging

```bash
# Enable remote debugging
# 1. Open debug menu
# 2. Select "Debug Remote JS"
# 3. Open Chrome DevTools
```

---

## 📦 Package Management

### Add Dependencies

```bash
# Install Expo-compatible packages
npx expo install <package-name>

# Install specific version
npx expo install <package-name>@version

# Install multiple packages
npx expo install package1 package2 package3
```

### Remove Dependencies

```bash
# Uninstall package
npm uninstall <package-name>

# Remove from dependencies
npm uninstall --save <package-name>

# Remove from devDependencies
npm uninstall --save-dev <package-name>
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update specific package
npm update <package-name>

# Update all packages (careful!)
npm update

# Interactive updater
npx npm-check-updates -i
```

---

## 🔐 Security Commands

### Audit

```bash
# Check vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may break things)
npm audit fix --force

# View detailed report
npm audit --json
```

---

## 🌐 Environment Commands

### Environment Variables

```bash
# Set environment for this session
export EXPO_DEBUG=true

# Create .env file
echo "API_KEY=your-key" > .env

# Use different environments
ENVIRONMENT=production npm start
```

---

## 📊 Performance Commands

### Bundle Analysis

```bash
# Analyze bundle size
npx expo export --dump-sourcemap

# View bundle stats
npx expo start --no-dev --minify --inspect

# Optimize images
npx expo-optimize
```

### Cache Management

```bash
# Clear Metro bundler cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Clear watchman (macOS)
watchman watch-del-all

# Full clean
rm -rf node_modules
rm -rf .expo
rm -rf ios/build
rm -rf android/build
npm install
```

---

## 🎨 Code Generation

### Create Components (manual)

```bash
# Create new screen
mkdir app/my-screen
touch app/my-screen.tsx

# Create new component
mkdir components/my-component
touch components/my-component.tsx

# Create new service
mkdir services/my-service
touch services/my-service.ts
```

---

## 📁 File Operations

### Project Structure

```bash
# View file tree
tree -I 'node_modules|.expo|.git'

# Count lines of code
find . -name '*.tsx' -o -name '*.ts' | xargs wc -l

# Search in files
grep -r "searchTerm" app/
```

---

## 🔄 Git Commands (Version Control)

### Basic Workflow

```bash
# Initialize repo
git init

# Add files
git add .

# Commit changes
git commit -m "Initial commit"

# Push to remote
git push origin main
```

### Branching

```bash
# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Merge branch
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

---

## 🚀 Deployment Commands

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 📚 Documentation

### Generate Docs

```bash
# TypeScript docs (if using TypeDoc)
npx typedoc --out docs src/

# Component docs (if using Storybook)
npm run storybook
```

---

## 🎯 Project-Specific Commands

### SecurePass Specific

```bash
# Start fresh development
npm install && npm start

# Full clean and restart
rm -rf node_modules package-lock.json
npm install
npm start -- --clear

# Test on all platforms
npm run ios &
npm run android &
npm run web
```

---

## 💡 Quick Shortcuts

### Common Workflows

**New Feature Development:**

```bash
git checkout -b feature/name
# Make changes
npm start
# Test changes
git add .
git commit -m "Add feature"
git push origin feature/name
```

**Debug Build Issues:**

```bash
npm start -- --clear
rm -rf node_modules && npm install
npx expo doctor
```

**Prepare for Production:**

```bash
npm run lint
npx tsc --noEmit
npm audit
npm start -- --no-dev --minify
```

---

## ⚡ Power User Tips

### Aliases (add to .bashrc or .zshrc)

```bash
alias expos="npx expo start"
alias expoc="npx expo start --clear"
alias expoi="npx expo run:ios"
alias expoa="npx expo run:android"
alias expow="npx expo run:web"
alias npmclean="rm -rf node_modules package-lock.json && npm install"
```

---

## 🆘 Emergency Commands

### App Won't Start

```bash
# Nuclear option - full clean
watchman watch-del-all
rm -rf node_modules
rm -rf package-lock.json
rm -rf .expo
rm -rf ios/Pods
npm install
cd ios && pod install && cd ..
npm start -- --clear
```

### Build Errors

```bash
# Clean Xcode build (iOS)
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ..

# Clean Gradle build (Android)
cd android
./gradlew clean
cd ..
```

---

## 📞 Help Commands

```bash
# Expo help
npx expo --help

# Specific command help
npx expo start --help
npx expo build --help

# NPM help
npm help

# View package info
npm info <package-name>
```

---

**Keep this reference handy for quick command lookups! 🚀**
