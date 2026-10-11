import { ReportBrowser } from "@/features/reports/report-browser";
export default function Page(): React.JSX.Element {
  return <ReportBrowser title="Alertas vecinales" mode="feed" map={false} />;
}
