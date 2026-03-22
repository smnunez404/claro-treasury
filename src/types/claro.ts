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
  contact_email: string | null;
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
  hypercert_tx_hash: string | null;
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

export interface TreasuryData {
  balanceWei: bigint;
  balanceAvax: number;
  balanceUsd: string;
  employeeCount: number;
  grantCount: number;
}

export interface EmployeeOnChain {
  wallet: string;
  name: string;
  salaryCents: number;
  salaryUsd: string;
  active: boolean;
}

export interface GrantOnChain {
  projectId: string;
  name: string;
  depositedAvax: number;
  depositedUsd: string;
  disbursedAvax: number;
  disbursedUsd: string;
  availableAvax: number;
  availableUsd: string;
  active: boolean;
}

export interface DashboardQFRound {
  roundId: number;
  matchingPoolAvax: number;
  matchingPoolUsd: string;
  hoursRemaining: number;
  isActive: boolean;
  projectCount: number;
}

export type DonationStep = "idle" | "selecting" | "confirming" | "success" | "error";

export interface DonationTarget {
  projectId: string | null;
  projectName: string;
  orgContract: string;
  orgName: string;
}

export interface ActiveGrant {
  projectId: string;
  name: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  category: string;
  status: "active" | "completed" | "on_hold" | "cancelled";
  target_usd: string;
  start_date: string;
  end_date: string;
  website_url: string;
}

export interface MilestoneFormData {
  project_id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "delayed";
  target_date: string;
  completed_date: string;
  evidence_url: string;
  evidence_type: string;
}

export interface MetricFormData {
  project_id: string;
  metric_name: string;
  metric_value: string;
  metric_unit: string;
  period_start: string;
  period_end: string;
  evidence_url: string;
}

export interface TeamMemberFormData {
  name: string;
  role: string;
  bio: string;
  avatar_url: string;
  wallet_address: string;
}

export interface ImpactMetric {
  id: string;
  project_id: string | null;
  metric_name: string;
  metric_value: number;
  metric_unit: string | null;
  period_start: string | null;
  period_end: string | null;
  evidence_url: string | null;
  verified: boolean;
}

export type PayrollStep = "idle" | "confirming" | "success" | "error";

export interface PayrollTx {
  txHash: string;
  employeeName: string;
  amountUsd: string;
  amountAvax: number;
}

export interface GrantFull extends GrantOnChain {
  projectName: string;
  supabaseProjectId: string | null;
}

export interface QFProjectStat {
  projectId: string;
  projectName: string;
  totalContribAvax: number;
  totalContribUsd: string;
  uniqueDonors: number;
  projectedMatchingAvax: number;
  projectedMatchingUsd: string;
}

export interface QFRoundFull {
  roundId: number;
  endTime: number;
  hoursRemaining: number;
  minutesRemaining: number;
  matchingPoolAvax: number;
  matchingPoolUsd: string;
  isActive: boolean;
  distributed: boolean;
  projects: QFProjectStat[];
}

export type DisburseStep = "idle" | "confirming" | "success" | "error";

export type CreateGrantStep = "idle" | "confirming" | "success" | "error";

export interface AdminOrgRow {
  contract_address: string;
  owner_address: string;
  name: string;
  country: string;
  description: string | null;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
  transparency_score: number;
  total_received_usd: number;
  total_donors: number;
}

export interface ProtocolGlobalStats {
  totalOrgs: number;
  verifiedOrgs: number;
  pendingOrgs: number;
  totalTransactions: number;
  totalRaisedUsd: number;
  totalDonors: number;
}

export type VerifyStep = "idle" | "confirming" | "success" | "error";

export type RegisterStep =
  | "form"
  | "balance"
  | "deploying"
  | "success"
  | "error";

export interface RegisterFormData {
  name: string;
  country: string;
  description: string;
  contact_email: string;
  website: string;
}

export interface DeployResult {
  contractAddress: string;
  txHash: string;
  orgName: string;
}
