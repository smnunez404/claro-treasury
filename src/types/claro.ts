export type UserRole = "protocol_admin" | "org_owner" | "donor" | "visitor";

export interface OrgProfile {
  contract_address: string;
  owner_address: string;
  name: string;
  country: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  org_type: string | null;
  verified: boolean;
  verified_at: string | null;
  is_active: boolean;
}

export interface TransparencyScore {
  contract_address: string;
  name: string;
  transparency_score: number;
  projects: number;
  transactions: number;
  milestones_done: number;
  documents: number;
  impact_metrics: number;
}

export interface AuthState {
  address: string | null;
  role: UserRole;
  orgContractAddress: string | null;
  isLoading: boolean;
}
