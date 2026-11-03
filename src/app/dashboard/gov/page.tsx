import { ReportBrowser } from "@/features/reports/report-browser";
export default function Page(): React.JSX.Element {
  return (
    <ReportBrowser title="Gestión municipal" institutional mode="directory" />
  );
}
