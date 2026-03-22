export const CLARO_FACTORY_ABI = [
  "function protocolOwner() external view returns (address)",
  "function getOrganizationByOwner(address owner) external view returns (address)",
  "function getAllOrganizations() external view returns (address[])",
] as const;
