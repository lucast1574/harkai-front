import { ReportBrowser } from "@/features/reports/report-browser";
export default function Page(): React.JSX.Element {
  return <ReportBrowser title="Lo que compartimos" mode="feed" map={false} />;
}
