/*
 * 🏷️ Type Definitions
 */

type ThemeIcons = {
  light: string;
  dark: string;
};

type TechnologyIconDefinition =
  | {
      icon: string;
      icons?: never;
    }
  | {
      icon?: never;
      icons: ThemeIcons;
    };

type BaseTechnologyDefinition = TechnologyIconDefinition & {
  id: string;
  name: string;
};

type LanguageTechnologyDefinition = BaseTechnologyDefinition & {
  metric: "language";
  language: string;
};

type AdoptionTechnologyDefinition = BaseTechnologyDefinition & {
  metric: "adoption";
  rule: string;
};

type CuratedTechnologyDefinition = BaseTechnologyDefinition & {
  metric: "curated";
  label: string;
};

type TechnologyDefinition =
  | LanguageTechnologyDefinition
  | AdoptionTechnologyDefinition
  | CuratedTechnologyDefinition;

type StatisticsDefinition = {
  id: string;
  title: string;
  technologies: TechnologyDefinition[];
};

export type {
  ThemeIcons,
  TechnologyIconDefinition,
  BaseTechnologyDefinition,
  LanguageTechnologyDefinition,
  AdoptionTechnologyDefinition,
  CuratedTechnologyDefinition,
  TechnologyDefinition,
  StatisticsDefinition,
};
