import { MapWorkspace } from "@/features/map/map-workspace";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ incident?: string }>;
}): Promise<React.JSX.Element> {
  const { incident } = await searchParams;
  return (
    <MapWorkspace
      initialIncident={
        incident && /^[a-f0-9]{24}$/.test(incident) ? incident : undefined
      }
    />
  );
}
