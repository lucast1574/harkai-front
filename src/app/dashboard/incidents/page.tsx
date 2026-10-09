import Link from "next/link";
import { ReportBrowser } from "@/features/reports/report-browser";
export default function Page(): React.JSX.Element {
  return (
    <>
      <div className="community-links">
        <Link href="/dashboard/pets">Mascotas ↗</Link>
        <Link href="/dashboard/places">Lugares de ayuda ↗</Link>
      </div>
      <ReportBrowser title="Lo que compartimos" mode="feed" map={false} />
    </>
  );
}
