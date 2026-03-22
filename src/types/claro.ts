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

export interface OrgCard {
  contract_address: string;
  name: string;
  country: string;
  description: string | null;
  org_type: string | null;
  verified: boolean;
  transparency_score: number;
  projects: number;
  transactions: number;
  milestones_done: number;
  total_received_usd: number;
  total_donors: number;
  logo_url: string | null;
}

export interface QFRound {
  matchingPoolAvax: number;
  matchingPoolUsd: string;
  endTime: number;
  hoursRemaining: number;
  isActive: boolean;
}

export interface ProtocolStats {
  totalOrgs: number;
  verifiedOrgs: number;
  totalTransactions: number;
}

export interface OrgFull {
  contract_address: string;
  name: string;
  country: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  org_type: string | null;
  verified: boolean;
  verified_at: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
}

export interface OrgFinancials {
  total_received_usd: number;
  total_disbursed_usd: number;
  total_donors: number;
  total_transactions: number;
  active_projects: number;
  milestones_completed: number;
  milestones_total: number;
  last_transaction_at: string | null;
}

export interface ScoreBreakdown {
  transparency_score: number;
  projects: number;
  transactions: number;
  milestones_done: number;
  documents: number;
  impact_metrics: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: "active" | "completed" | "on_hold" | "cancelled";
  target_usd: number | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  website_url: string | null;
  onchain_project_id: string | null;
}

export interface Transaction {
  id: string;
  tx_hash: string;
  tx_type: string;
  from_address: string | null;
  to_address: string | null;
  amount_avax: number | null;
  amount_usd: number | null;
  block_timestamp: string | null;
  onchain_project_id: string | null;
  employee_name: string | null;
  network: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "delayed";
  target_date: string | null;
  completed_date: string | null;
  evidence_url: string | null;
  evidence_type: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  sort_order: number;
}

export interface OrgDocument {
  id: string;
  doc_type: string | null;
  title: string;
  description: string | null;
  file_url: string;
  created_at: string;
}

export interface AIReport {
  id: string;
  report_text: string;
  generated_at: string;
  model_used: string;
  total_usd: number | null;
  tx_count: number;
}
