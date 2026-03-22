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
  "function roundCount() external view returns (uint256)",
  "function getRoundProjects(uint256 roundId) external view returns (string[])",
  "function getProjectStats(uint256 roundId, string memory projectId) external view returns (uint256 totalAmount, uint256 uniqueDonors)",
] as const;

export const YAIS_TREASURY_ABI = [
  "function owner() external view returns (address)",
  "function getBalance() external view returns (uint256)",
  "function getEmployeeCount() external view returns (uint256)",
  "function getGrantCount() external view returns (uint256)",
  "function employeeList(uint256 index) external view returns (address)",
  "function grantList(uint256 index) external view returns (string)",
  "function getEmployee(address wallet) external view returns (string name, uint256 salaryCents, bool active)",
  "function getGrant(string projectId) external view returns (string name, uint256 deposited, uint256 disbursed, bool active)",
  "function depositToGrant(string memory projectId) external payable",
] as const;
