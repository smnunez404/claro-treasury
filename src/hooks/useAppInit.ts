import { useEffect } from "react";

const SYNC_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes
const SYNC_KEY = "claro_last_sync";

export function useAppInit() {
  useEffect(() => {
    const lastSync = Number(localStorage.getItem(SYNC_KEY) || 0);
    if (Date.now() - lastSync < SYNC_THROTTLE_MS) return;

    // Fire-and-forget — never blocks rendering
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-organizations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      }
    )
      .then(() => localStorage.setItem(SYNC_KEY, String(Date.now())))
      .catch(() => {});
  }, []);
}
