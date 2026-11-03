export type ChatDistrict = {
  id: string;
  district: string;
  province: string;
  messages: number;
  updated_at: string;
};
export function districtChatPath(
  id: string,
  district: string,
  province: string,
): string {
  const slug = `${district}-${province}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `/distritos/${slug}-${id}`;
}
