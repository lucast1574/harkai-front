"use client";
import { useEffect, useState } from "react";
import { api } from "./api";
import type { TicketPage } from "./types";
export function useTickets(
  admin: boolean,
  state: string,
  page: number,
  revision: number,
) {
  const key = `${admin}:${state}:${page}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    data: TicketPage | null;
    error: string;
  }>({ key: "", data: null, error: "" });
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ page: String(page) });
    if (state) query.set("state", state);
    api<TicketPage>(
      `/api/backend/${admin ? "admin/" : ""}support/tickets?${query}`,
    )
      .then((data) => {
        if (active) setResult({ key, data, error: "" });
      })
      .catch((err) => {
        if (active) setResult({ key, data: null, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [admin, state, page, key]);
  const current = result.key === key;
  return {
    data: current ? result.data : null,
    loading: !current,
    error: current ? result.error : "",
  };
}
