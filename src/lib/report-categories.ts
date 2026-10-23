import type { Category } from "./contracts";

export const crimeTypes = ["theft", "extortion", "kidnapping", "violence", "homicide"];

export function reportFilterCategories(categories: Category[]): Category[] {
  const crime = categories.filter((category) => crimeTypes.includes(category.id));
  return [
    ...(crime.length ? [{ id: "crime", label: "Crimen · todos", group: "crime", critical: true, advice: [] },
      ...crime.map((category) => ({ ...category, label: `Crimen · ${category.label}` }))] : []),
    ...categories.filter((category) => !crimeTypes.includes(category.id)),
  ];
}

export function reportTypeLabel(type: string, categories: Category[]): string {
  const label = categories.find((category) => category.id === type)?.label || type;
  return crimeTypes.includes(type) ? `Crimen · ${label}` : label;
}
