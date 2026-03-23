export const CLARO_FACTORY_ABI = [
  "function protocolOwner() external view returns (address)",
  "function getOrganizationByOwner(address owner) external view returns (address)",
  "function getAllOrganizations() external view returns (address[])",
  "function verifyOrganization(address contractAddress) external",
  "function getOrganization(address contractAddress) external view returns (address owner, string memory name, string memory country, string memory description, string memory website, bool verified, uint256 createdAt)",
  "function registerOrganization(string memory name, string memory country, string memory description, string memory website) external payable returns (address)",
  "event OrganizationRegistered(address indexed contractAddress, address indexed owner, string name, string country, uint256 timestamp)",
] as const;

export const CLARO_MATCHING_ABI = [
  "function currentRoundId() external view returns (uint256)",
  "function getRound(uint256 roundId) external view returns (uint256 id, uint256 startTime, uint256 endTime, uint256 matchingPool, bool distributed, bool active)",
  "function getProjectContributions(uint256 roundId, string projectId) external view returns (uint256 totalContributions, uint256 uniqueDonors)",
  "function matchingPool() external view returns (uint256)",
  "function roundCount() external view returns (uint256)",
  "function getRoundProjects(uint256 roundId) external view returns (string[] memory)",
  "function getProjectStats(uint256 roundId, string memory projectId) external view returns (uint256 totalAmount, uint256 uniqueDonors)",
  "function calculateMatching(uint256 roundId) external view returns (string[] memory projectIds, uint256[] memory amounts)",
  "function getTimeRemaining(uint256 roundId) external view returns (uint256)",
  "function createRound(string[] memory projectIds, uint256 durationSeconds) external payable",
  "function contribute(string memory projectId) external payable",
  "function getRound() external view returns (string[] memory projectIds, uint256 startTime, uint256 endTime, uint256 matchingPool, bool active)",
  "function getProjectContributions(string memory projectId) external view returns (uint256 total, uint256 uniqueDonors)",
  "function getTimeRemaining() external view returns (uint256)",
  "function calculateMatching(string memory projectId) external view returns (uint256)",
  "function distributeMatching() external",
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
  "function createGrant(string memory projectId, string memory projectName) external",
  "function disburseGrant(string memory projectId, address payable recipient, uint256 amount) external",
  "function addEmployee(address wallet, string memory name, uint256 salaryCents) external",
  "function removeEmployee(address wallet) external",
  "function executePayroll(address payable wallet, uint256 amount) external",
] as const;

export const HYPERCERTS_ABI = [
  "function mintClaim(address account, uint256 units, string memory uri, uint8 restrictions) external",
] as const;
