import { Access } from "@/components/access";
import { Users } from "@/features/admin/users";
export default function Page(): React.JSX.Element {
  return (
    <Access roles={["admin"]}>
      <Users />
    </Access>
  );
}
