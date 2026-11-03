import { redirect } from "next/navigation";
export default function Page(): never {
  redirect("/dashboard/admin?section=revenue");
}
