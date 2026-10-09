import { Access } from "@/components/access";
import { ReportForm } from "@/features/reports/report-form";
export default function Page(): React.JSX.Element {
  return (
    <Access>
      <ReportForm />
    </Access>
  );
}
