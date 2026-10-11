import { ReportBrowser } from "@/features/reports/report-browser";
export default function Page(): React.JSX.Element {
  return (
    <ReportBrowser title="Lugares de ayuda cerca de ti" fixedType="place" />
  );
}
