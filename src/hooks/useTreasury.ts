import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { YAIS_TREASURY_ABI, CLARO_MATCHING_ABI } from "@/lib/abis";
import { RPC_URL, AVAX_TO_USD, MATCHING_ADDRESS, avaxToUsd } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type {
  TreasuryData,
  EmployeeOnChain,
  GrantOnChain,
  DashboardQFRound,
  Transaction,
} from "@/types/claro";

export function useTreasury() {
  const { orgContractAddress } = useAuth();
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const {
    data: treasuryData,
    isLoading: isTreasuryLoading,
    isError: isTreasuryError,
    refetch: refetchTreasury,
  } = useQuery({
    queryKey: ["treasury-data", orgContractAddress],
    enabled: !!orgContractAddress,
    staleTime: 30 * 1000,
    queryFn: async (): Promise<TreasuryData> => {
      const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, provider);
      const [balanceWei, employeeCount, grantCount] = await Promise.all([
        contract.getBalance(),
        contract.getEmployeeCount(),
        contract.getGrantCount(),
      ]);
      const balanceAvax = Number(ethers.formatEther(balanceWei));
      return {
        balanceWei,
        balanceAvax,
        balanceUsd: avaxToUsd(balanceAvax),
        employeeCount: Number(employeeCount),
        grantCount: Number(grantCount),
      };
    },
  });

  const {
    data: employees,
    isLoading: isEmployeesLoading,
  } = useQuery({
    queryKey: ["treasury-employees", orgContractAddress],
    enabled: !!orgContractAddress && (treasuryData?.employeeCount ?? 0) > 0,
    queryFn: async (): Promise<EmployeeOnChain[]> => {
      const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, provider);
      const count = Number(await contract.getEmployeeCount());
      if (count === 0) return [];

      const addresses: string[] = await Promise.all(
        Array.from({ length: count }, (_, i) => contract.employeeList(i))
      );

      const result: EmployeeOnChain[] = await Promise.all(
        addresses.map(async (wallet) => {
          const [name, salaryCents, active] = await contract.getEmployee(wallet);
          const cents = Number(salaryCents);
          return {
            wallet: wallet.toLowerCase(),
            name,
            salaryCents: cents,
            salaryUsd: "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "/mo",
            active,
          };
        })
      );

      return result.filter((e) => e.active);
    },
  });

  const {
    data: grants,
    isLoading: isGrantsLoading,
  } = useQuery({
    queryKey: ["treasury-grants", orgContractAddress],
    enabled: !!orgContractAddress && (treasuryData?.grantCount ?? 0) > 0,
    queryFn: async (): Promise<GrantOnChain[]> => {
      const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, provider);
      const count = Number(await contract.getGrantCount());
      if (count === 0) return [];

      const projectIds: string[] = await Promise.all(
        Array.from({ length: count }, (_, i) => contract.grantList(i))
      );

      const result: GrantOnChain[] = await Promise.all(
        projectIds.map(async (projectId) => {
          const [name, deposited, disbursed, active] = await contract.getGrant(projectId);
          const depositedAvax = Number(ethers.formatEther(deposited));
          const disbursedAvax = Number(ethers.formatEther(disbursed));
          const availableAvax = depositedAvax - disbursedAvax;
          return {
            projectId,
            name,
            depositedAvax,
            depositedUsd: avaxToUsd(depositedAvax),
            disbursedAvax,
            disbursedUsd: avaxToUsd(disbursedAvax),
            availableAvax,
            availableUsd: avaxToUsd(availableAvax),
            active,
          };
        })
      );

      return result.filter((g) => g.active);
    },
  });

  const { data: qfRound } = useQuery({
    queryKey: ["dashboard-qf"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<DashboardQFRound | null> => {
      try {
        const matchingContract = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, provider);
        const roundCount = Number(await matchingContract.roundCount());
        if (roundCount === 0) return null;

        const round = await matchingContract.getRound(roundCount);
        const [matchingPool, , endTime, active, distributed] = round;
        const hoursRemaining = Math.max(0, Math.floor((Number(endTime) - Date.now() / 1000) / 3600));
        const isActive = active && !distributed && hoursRemaining > 0;
        if (!isActive) return null;

        const projects = await matchingContract.getRoundProjects(roundCount);
        const poolAvax = Number(ethers.formatEther(matchingPool));

        return {
          roundId: roundCount,
          matchingPoolAvax: poolAvax,
          matchingPoolUsd: avaxToUsd(poolAvax),
          hoursRemaining,
          isActive: true,
          projectCount: projects.length,
        };
      } catch {
        return null;
      }
    },
  });

  const {
    data: recentActivity,
    isLoading: isActivityLoading,
    isError: isActivityError,
  } = useQuery({
    queryKey: ["dashboard-activity", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("claro_transactions")
        .select("id, tx_hash, tx_type, from_address, to_address, amount_avax, amount_usd, block_timestamp, employee_name, onchain_project_id, network")
        .eq("org_contract", orgContractAddress!)
        .order("block_timestamp", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as Transaction[];
    },
  });

  const { data: financials } = useQuery({
    queryKey: ["dashboard-financials", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_org_transparency")
        .select("contract_address, total_received_usd, total_disbursed_usd, total_donors")
        .eq("contract_address", orgContractAddress!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return {
    treasuryData,
    employees: employees ?? [],
    grants: grants ?? [],
    qfRound,
    recentActivity: recentActivity ?? [],
    financials,
    isTreasuryLoading,
    isEmployeesLoading,
    isGrantsLoading,
    isActivityLoading,
    isActivityError,
    isTreasuryError,
    refetchTreasury,
  };
}
