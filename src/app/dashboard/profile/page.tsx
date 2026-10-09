import { Access } from "@/components/access";
import { Profile } from "@/features/account/profile";
export default function Page(): React.JSX.Element {
  return (
    <Access>
      <Profile />
    </Access>
  );
}
