// Spacing scale for consistent spacing throughout the app
export const spacing = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Specific spacing values
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Component-specific spacing
  component: {
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginVertical: 8,
    },
    card: {
      padding: 16,
      margin: 8,
    },
    input: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 4,
    },
    list: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    modal: {
      padding: 24,
      margin: 16,
    },
    screen: {
      padding: 16,
    },
  },
  
  // Layout spacing
  layout: {
    header: {
      height: 56,
      paddingHorizontal: 16,
    },
    tabBar: {
      height: 80,
      paddingBottom: 20,
    },
    bottomSheet: {
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
  },
  
  // Grid spacing
  grid: {
    gutter: 16,
    column: 8,
  },
}; 