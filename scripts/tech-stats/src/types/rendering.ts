/*
 * 🏷️ Type Definitions
 */

type LayoutSettings = {
  canvasWidth: number;
  cardWidth: number;
  cardGap: number;
  iconSize: number;
  nameFontSize: number;
  statisticFontSize: number;
  pillWidth: number;
  pillHeight: number;
  outerHorizontalPadding: number;
  outerVerticalPadding: number;
  iconNameGap: number;
  namePillGap: number;
  pillTextBaseline: number;
  maxCardsPerRow: number;
  rowGap: number;
};

type ThemeColors = {
  text: string;
  pill: string;
  statistic: string;
};

type RenderingSettings = {
  layout: LayoutSettings;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
};

export type { LayoutSettings, ThemeColors, RenderingSettings };
