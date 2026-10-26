import type { Screenshot } from "./types";

export async function prepareScreenshot(file: File): Promise<Screenshot> {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 6 * 1024 * 1024
  )
    throw new Error("Usa capturas PNG, JPEG o WebP de hasta 6 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    if (
      bitmap.width > 6000 ||
      bitmap.height > 6000 ||
      bitmap.width * bitmap.height > 12000000
    )
      throw new Error(
        "La captura es demasiado grande. Recorta la zona del problema.",
      );
    const ratio = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la captura.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/webp", 0.85);
    if ((data.split(",")[1]?.length ?? 0) > 1398104)
      throw new Error(
        "La captura sigue siendo muy pesada. Recórtala e inténtalo otra vez.",
      );
    return { name: file.name, data };
  } finally {
    bitmap.close();
  }
}
