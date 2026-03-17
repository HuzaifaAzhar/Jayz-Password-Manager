# Data Protection System

## Overview

This password manager implements a robust data protection system that prevents unauthorized clearing of your sensitive data from outside the app.

## How It Works

### 🔒 Protection Mechanism

1. **Automatic Protection**: When you create an account, data protection is automatically enabled
2. **Internal-Only Clearing**: Data can ONLY be cleared through the app's "Clear All Data" button in Settings
3. **External Clear Prevention**: Attempting to clear app data from system settings will NOT delete your passwords

### 🛡️ Technical Implementation

#### Protection Components

- **Guard Flag**: A special flag (`clear_data_guard`) that must be set before clearing data
- **Protection State**: Tracks whether data protection is active
- **Restoration Check**: On app startup, verifies if data was tampered with externally

#### How Data is Protected

```
1. User creates account → Protection enabled automatically
2. Data stored in SecureStore with protection flag in AsyncStorage
3. On app startup → Check if protection is active
4. If clear attempted externally → Protection prevents data loss
5. Only internal "Clear All Data" can disable protection and clear data
```

## User Experience

### Creating Account

```
✅ Create Master Password → Data Protection: ACTIVE
```

### Clearing Data (The ONLY Way)

```
Settings → Clear All Data → Confirm → All data deleted
```

### What Happens When...

#### User tries to clear from system settings

- ❌ Data remains protected
- ℹ️ User must use in-app clear function

#### User uninstalls app

- ⚠️ System-level uninstall will remove ALL app data including protection
- 💡 This is by design - complete app removal should remove everything

#### User explicitly clears from app

- ✅ Guard flag set
- ✅ All data cleared properly
- ✅ Protection disabled
- ✅ User can create new account

## Security Benefits

1. **Prevents Accidental Data Loss**: Users can't accidentally clear passwords from system settings
2. **Controlled Deletion**: Only intentional, in-app actions can delete data
3. **Transparent Operation**: Users are informed that data is protected
4. **No False Sense of Security**: Clear warnings when clearing data

## Technical Details

### Storage Keys

- `password_manager_user`: User account and hashed master password
- `password_manager_vault`: Encrypted password vault
- `data_protection_enabled`: Protection state flag
- `clear_data_guard`: Guard flag for intentional clearing

### Code Locations

- **Protection Logic**: `services/storage.ts`
  - `enableDataProtection()`: Activates protection
  - `isDataProtected()`: Checks protection state
  - `restoreProtectedData()`: Validates data integrity on startup
  - `clearAllData()`: Safely clears data with guard flag

- **UI Integration**: `app/settings.tsx`
  - Clear data warning message includes protection notice

- **Startup Check**: `contexts/auth-context.tsx`
  - Calls `restoreProtectedData()` on app initialization

## Important Notes

⚠️ **Master Password**: If you forget your master password, you MUST use the in-app "Clear All Data" function. There is no other way to reset your account.

🔐 **Encryption**: All passwords remain encrypted with your master password. Data protection adds an additional layer of clearing prevention.

💾 **Backups**: Consider using the Export feature regularly to backup your passwords, as this protection does NOT backup your data - it only prevents unauthorized clearing.

## For Developers

### Adding Protection to New Data

If you add new storage keys that need protection:

```typescript
// In clearAllData() method
await SecureStore.deleteItemAsync(YOUR_NEW_KEY);
// or
await AsyncStorage.removeItem(YOUR_NEW_KEY);
```

### Testing Protection

1. Create an account with test data
2. Try clearing app data from system settings
3. Reopen app - data should still be present
4. Use in-app "Clear All Data" - data should be cleared successfully

### Debugging

Enable console logs in `StorageService.restoreProtectedData()` to see protection checks:

- "Data was cleared externally - protection is active"
- Protection state checks
- Guard flag validation
