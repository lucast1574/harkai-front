export function selectPosition(
  trigger: HTMLButtonElement,
  count: number,
): { left: number; top: number; width: number; maxHeight: number } {
  const rect = trigger.getBoundingClientRect();
  const height = Math.min(280, count * 44 + 16, window.innerHeight - 24);
  const below = window.innerHeight - rect.bottom - 16;
  const above = rect.top - 16;
  const upward = below < height && above > below;
  return {
    left: Math.max(
      12,
      Math.min(rect.left, window.innerWidth - Math.max(rect.width, 160) - 12),
    ),
    top: upward
      ? Math.max(12, rect.top - Math.min(height, above) - 8)
      : rect.bottom + 8,
    width: Math.min(Math.max(rect.width, 160), window.innerWidth - 24),
    maxHeight: Math.max(44, Math.min(height, upward ? above : below)),
  };
}
