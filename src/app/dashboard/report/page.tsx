import { redirect } from "next/navigation";
export default function Page(): never {
  return redirect("/dashboard/profile#app-movil");
}
