import type { ThemeConfig } from "antd";

export const themeConfig: ThemeConfig = {
  token: {
    // Primary colors from invoice
    colorPrimary: "#8B2F39", // Burgundy
    colorSuccess: "#10B981", // Green
    colorWarning: "#F59E0B", // Amber
    colorError: "#EF4444", // Red
    colorInfo: "#2C5F7C", // Deep Blue

    // Layout
    borderRadius: 8,

    // Typography
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,

    // Spacing
    paddingLG: 24,
    marginLG: 24,
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      headerBg: "#F8FAFC",
      headerColor: "#64748B",
      borderRadius: 8,
    },
    Menu: {
      itemBg: "transparent",
      subMenuItemBg: "transparent",
    },
  },
};
