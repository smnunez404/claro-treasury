import { useEffect } from "react";

export function useAppInit() {
  useEffect(() => {
    const sync = async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-organizations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
      } catch {
        // silent — app works with cached Supabase data
      }
    };
    sync();
  }, []);
}
