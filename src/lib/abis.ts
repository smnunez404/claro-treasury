export const CLARO_FACTORY_ABI = [
  "function protocolOwner() external view returns (address)",
  "function getOrganizationByOwner(address owner) external view returns (address)",
  "function getAllOrganizations() external view returns (address[])",
] as const;

export const CLARO_MATCHING_ABI = [
  "function currentRoundId() external view returns (uint256)",
  "function getRound(uint256 roundId) external view returns (uint256 matchingPool, uint256 startTime, uint256 endTime, bool active, bool distributed)",
  "function getProjectContributions(uint256 roundId, string projectId) external view returns (uint256 totalContributions, uint256 uniqueDonors)",
  "function matchingPool() external view returns (uint256)",
] as const;
