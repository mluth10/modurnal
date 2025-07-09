# Custom Theme System

This directory contains a comprehensive theme system for React Native Paper that supports both light and dark modes with custom properties.

## Files Structure

```
src/theme/
├── index.ts              # Main theme exports and configuration
├── colors.ts             # Custom color palettes for light/dark modes
├── typography.ts         # Typography configuration
├── spacing.ts            # Spacing scale and component spacing
├── useAppTheme.ts        # Custom hooks for theme access
├── ThemeProvider.tsx     # Theme provider component
└── README.md            # This documentation
```

## Usage

### 1. Setup Theme Provider

Wrap your app with the `AppThemeProvider`:

```tsx
import React from 'react';
import { AppThemeProvider } from './src/theme/ThemeProvider';
import App from './App';

export default function Main() {
  return (
    <AppThemeProvider initialTheme="system">
      <App />
    </AppThemeProvider>
  );
}
```

### 2. Using the Theme in Components

#### Basic theme access:
```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from './src/theme/useAppTheme';

export default function MyComponent() {
  const theme = useAppTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.primary }}>
        Hello World
      </Text>
    </View>
  );
}
```

#### Using custom colors:
```tsx
import React from 'react';
import { View } from 'react-native';
import { useCustomColors } from './src/theme/useAppTheme';

export default function MyComponent() {
  const colors = useCustomColors();
  
  return (
    <View style={{ backgroundColor: colors.brandPrimary }}>
      {/* Your content */}
    </View>
  );
}
```

#### Using custom theme properties:
```tsx
import React from 'react';
import { View } from 'react-native';
import { useCustomTheme } from './src/theme/useAppTheme';

export default function MyComponent() {
  const customTheme = useCustomTheme();
  
  return (
    <View style={[
      { 
        borderRadius: customTheme.borderRadius.medium,
        ...customTheme.shadows.medium 
      }
    ]}>
      {/* Your content */}
    </View>
  );
}
```

### 3. Theme Switching

```tsx
import React from 'react';
import { Button } from 'react-native-paper';
import { useThemeContext } from './src/theme/ThemeProvider';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  return (
    <Button onPress={toggleTheme}>
      {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
    </Button>
  );
}
```

## Custom Properties

### Colors
The theme includes custom colors beyond the standard React Native Paper colors:

- `brandPrimary`, `brandSecondary`, `brandTertiary` - Brand colors
- `accent`, `accentLight`, `accentDark` - Accent colors
- `surfaceLight`, `surfaceMedium`, `surfaceDark` - Surface colors
- `textPrimary`, `textSecondary`, `textTertiary` - Text colors
- `success`, `warning`, `info` - Status colors
- `backgroundLight`, `backgroundMedium`, `backgroundDark` - Background colors

### Typography
Custom typography configuration with:
- Font families for different platforms
- Font sizes and line heights
- Font weights and letter spacing
- Predefined text styles

### Spacing
Consistent spacing scale with:
- Base spacing units
- Component-specific spacing
- Layout spacing
- Grid spacing

### Custom Properties
Additional custom properties in `theme.custom`:
- `borderRadius` - Border radius values
- `shadows` - Shadow configurations for different elevations

## TypeScript Support

The theme system provides full TypeScript support. The `AppTheme` type includes all custom properties, and the custom hooks provide proper typing for theme access.

## Migration from Tamagui

If you're migrating from Tamagui, this theme system provides a similar structure but is specifically designed for React Native Paper. The custom properties and hooks follow React Native Paper's patterns while providing the flexibility you need for custom theming. 