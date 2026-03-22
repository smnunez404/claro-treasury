export const AVAX_TO_USD = Number(import.meta.env.VITE_AVAX_TO_USD ?? "18");
export const FACTORY_ADDRESS = import.meta.env.VITE_CLARO_FACTORY_ADDRESS as string;
export const MATCHING_ADDRESS = import.meta.env.VITE_CLARO_MATCHING_ADDRESS as string;
export const LEGACY_TREASURY = import.meta.env.VITE_CONTRACT_ADDRESS as string;
export const HYPERCERTS_CONTRACT = import.meta.env.VITE_HYPERCERTS_CONTRACT as string;
export const RPC_URL = import.meta.env.VITE_RPC_URL as string;
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? "43113");
export const SNOWTRACE_URL = import.meta.env.VITE_SNOWTRACE_URL as string;
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const avaxToUsd = (avax: number): string =>
  "$" + (avax * AVAX_TO_USD).toFixed(2);
export const usdToAvax = (usd: number): number => usd / AVAX_TO_USD;
export const formatUsd = (amount: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
export const truncateAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;
