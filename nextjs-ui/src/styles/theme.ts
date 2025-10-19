import { Theme } from "@/app/types/theme";

export const lightTheme: Theme = {
  colors: {
    primary: "#000000", // Black for light mode
    secondary: "#333333", // Dark gray
    background: "#ffffff", // Pure white
    surface: "#f5f5f5", // Light gray for cards
    text: "#000000", // Black text
    textSecondary: "#666666", // Gray text
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    border: "#e0e0e0",
    glassBg: "rgba(245, 245, 245, 0.8)",
    glassBorder: "rgba(224, 224, 224, 0.5)",
    info: "#3b82f6", // Add this - blue for info
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: "#ffffff", // White for dark mode
    secondary: "#cccccc", // Light gray
    background: "#000000", // Pure black
    surface: "#1a1a1a", // Dark gray for cards
    text: "#ffffff", // White text
    textSecondary: "#999999", // Gray text
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    border: "#333333",
    glassBg: "rgba(26, 26, 26, 0.8)",
    glassBorder: "rgba(51, 51, 51, 0.5)",
    info: "#60a5fa", // Add this - lighter blue for dark mode
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    sm: "0 1px 2px 0 rgba(255, 255, 255, 0.05)",
    md: "0 4px 6px -1px rgba(255, 255, 255, 0.1)",
    lg: "0 10px 15px -3px rgba(255, 255, 255, 0.1)",
  },
};
