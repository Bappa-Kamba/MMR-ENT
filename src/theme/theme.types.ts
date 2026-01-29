export interface AppTheme {
  // Brand Colors
  primary: string; // Main brand color (buttons, links)
  secondary: string; // Accent color

  // Sidebar Colors
  sidebarGradientStart: string;
  sidebarGradientEnd: string;
  sidebarText: string;
  sidebarTextHover: string;
  sidebarActiveItem: string;

  // Text Colors
  textMain: string; // Main content text
  textSecondary: string; // Muted/secondary text
  textMenu: string; // Header menu text

  // Background Colors
  bgMain: string; // Main content background
  bgCard: string; // Card background
  bgHeader: string; // Header background

  // Status Colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // UI Elements
  border: string;
  borderRadius: number;
}

export const defaultTheme: AppTheme = {
  // Brand Colors (from invoice INV-01349)
  primary: "#8B2F39", // Burgundy
  secondary: "#2C5F7C", // Deep Blue

  // Sidebar Colors
  sidebarGradientStart: "#1a1a2e", // Dark navy
  sidebarGradientEnd: "#16213e", // Darker blue
  sidebarText: "#a0aec0", // Light gray
  sidebarTextHover: "#ffffff", // White on hover
  sidebarActiveItem: "#8B2F39", // Primary color

  // Text Colors
  textMain: "#1a202c", // Almost black
  textSecondary: "#64748B", // Gray
  textMenu: "#374151", // Dark gray

  // Background Colors
  bgMain: "#f8fafc", // Light gray
  bgCard: "#ffffff", // White
  bgHeader: "#ffffff", // White

  // Status Colors
  success: "#10B981", // Green
  warning: "#F59E0B", // Amber
  error: "#EF4444", // Red
  info: "#2C5F7C", // Deep Blue

  // UI Elements
  border: "#e2e8f0",
  borderRadius: 8,
};
