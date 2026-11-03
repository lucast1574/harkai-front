import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { backend } from "./backend";
import type { ChatDistrict } from "../district-chat";
import type { ForumThread } from "@/features/community/forum-contracts";
import type { Page } from "../contracts";
export const chatDistricts = cache(async (): Promise<ChatDistrict[]> => {
  const response = await backend("forum/districts");
  if (!response.ok)
    throw new Error("No se pudieron cargar los chats por distrito");
  return (await response.json()).items;
});
export const districtMessages = cache(
  async (id: string, cursor = ""): Promise<Page<ForumThread>> => {
    if (!/^\d{6}$/.test(id) || (cursor && !/^[a-f0-9]{24}$/.test(cursor)))
      notFound();
    const response = await backend(
      `forum?ubigeo=${id}&scope=district${cursor ? `&cursor=${cursor}` : ""}`,
    );
    if (response.status === 400 || response.status === 404) notFound();
    if (!response.ok) throw new Error("No se pudo cargar la conversación");
    const page: Page<ForumThread> = await response.json();
    if (!page.items.length) notFound();
    return page;
  },
);
