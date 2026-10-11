import { ReportDetail } from "@/features/reports/report-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  return <ReportDetail id={id} />;
}
