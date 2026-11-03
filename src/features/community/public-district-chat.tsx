"use client";
import { useState } from "react";
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
  const [replyTo, setReplyTo] = useState<ForumThread | null>(null);
  const [replyRevision, setReplyRevision] = useState(0);
  const refresh = async () => {
    router.refresh();
  };
  return (
    <>
      <div className="public-chat-messages">
        {items.map((thread) => (
          <div key={thread.id} id={`mensaje-${thread.id}`}>
            <ForumCard
              thread={thread}
              onReply={setReplyTo}
              replyRevision={replyRevision}
              onRemoved={async () => {
                setReplyTo(null);
                await refresh();
              }}
            />
          </div>
        ))}
      </div>
      <div>
        <ForumCompose
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onReplied={() => {
            setReplyRevision((n) => n + 1);
            setReplyTo(null);
          }}
          districtId={districtId}
          district={district}
          onPublished={refresh}
        />
      </div>
    </>
  );
}
