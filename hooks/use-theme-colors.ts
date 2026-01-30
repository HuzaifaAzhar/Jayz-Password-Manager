import { AppColors, ThemeColors } from "@/constants/colors";
import { useTheme } from "@/contexts/theme-context";

export const useThemeColors = (): ThemeColors => {
  const { actualTheme } = useTheme();
  return AppColors[actualTheme];
};
