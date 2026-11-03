"use client";
import Image from "next/image";
import { useState } from "react";
import type { User } from "@/lib/contracts";

export function UserAvatar({
  user,
  large = false,
}: {
  user: User | null;
  large?: boolean;
}): React.JSX.Element {
  const [failed, setFailed] = useState("");
  const photo = user?.photo_url;
  return (
    <span className={large ? "account-large-avatar" : "avatar"}>
      {photo && photo !== failed ? (
        <Image
          unoptimized
          src={photo}
          alt=""
          width={large ? 58 : 36}
          height={large ? 58 : 36}
          referrerPolicy="no-referrer"
          onError={() => setFailed(photo)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "inherit",
          }}
        />
      ) : (
        user?.name.slice(0, 1) || "H"
      )}
    </span>
  );
}
