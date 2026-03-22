import { ethers } from "ethers";
import { FACTORY_ADDRESS, RPC_URL } from "@/lib/constants";
import { CLARO_FACTORY_ABI } from "@/lib/abis";
import type { UserRole } from "@/types/claro";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function detectRole(walletAddress: string): Promise<{
  role: UserRole;
  orgContractAddress: string | null;
}> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const factory = new ethers.Contract(FACTORY_ADDRESS, CLARO_FACTORY_ABI, provider);

    const protocolOwner: string = await factory.protocolOwner();
    if (walletAddress.toLowerCase() === protocolOwner.toLowerCase()) {
      return { role: "protocol_admin", orgContractAddress: null };
    }

    const orgAddress: string = await factory.getOrganizationByOwner(walletAddress);
    if (orgAddress && orgAddress !== ZERO_ADDRESS) {
      return { role: "org_owner", orgContractAddress: orgAddress.toLowerCase() };
    }

    return { role: "donor", orgContractAddress: null };
  } catch {
    return { role: "visitor", orgContractAddress: null };
  }
}
