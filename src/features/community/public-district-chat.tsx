"use client";
import { useRouter } from "next/navigation";
import { ForumCard } from "./forum-card";
import { ForumCompose } from "./forum-compose";
import type { ForumThread } from "./forum-contracts";
export function PublicDistrictChat({
  items,
  districtId,
  district,
}: {
  items: ForumThread[];
  districtId: string;
  district: string;
}): React.JSX.Element {
  const router = useRouter();
  const refresh = async () => {
    router.refresh();
  };
  return (
    <>
      <div className="public-chat-messages">
        {items.map((thread) => (
          <div key={thread.id} id={`mensaje-${thread.id}`}>
            <ForumCard thread={thread} onRemoved={refresh} />
          </div>
        ))}
      </div>
      <div>
        <ForumCompose
          districtId={districtId}
          district={district}
          onPublished={refresh}
        />
      </div>
    </>
  );
}
