import type { Incident, Category, Area } from "@/lib/contracts";
export function csvCell(value: string): string {
  const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function reportCSV(
  items: Incident[],
  categories: Category[],
  partial: boolean,
  area: Area,
): string {
  const rows = [
    [
      "Harkai · Reportes comunitarios",
      "Consulta",
      partial
        ? "Parcial: quedan páginas por cargar"
        : "Páginas de consulta cargadas",
      `Centro ${area.latitude},${area.longitude}`,
      `Radio ${area.radius} m`,
      area.after || "Sin filtro de fecha",
    ],
    [
      "ID",
      "Categoría",
      "Descripción",
      "Estado",
      "Confirmación",
      "Fecha UTC",
      "Distrito",
      "Ciudad",
      "Latitud",
      "Longitud",
    ],
    ...items.map((i) => [
      i.id,
      categories.find((c) => c.id === i.type)?.label || i.type,
      i.description,
      i.status,
      i.verified ? "Confirmado por la comunidad" : "No verificado",
      i.created_at,
      i.district || "",
      i.city || "",
      String(i.latitude),
      String(i.longitude),
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
export function exportReports(
  items: Incident[],
  categories: Category[],
  partial: boolean,
  area: Area,
): boolean {
  const url = URL.createObjectURL(
    new Blob([reportCSV(items, categories, partial, area)], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `harkai-reportes-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}
