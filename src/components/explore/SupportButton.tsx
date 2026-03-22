import { useAuth } from "@/contexts/AuthContext";
import { usePrivy } from "@privy-io/react-auth";

interface Props {
  orgContract: string;
}

export default function SupportButton({ orgContract }: Props) {
  const { role } = useAuth();
  const { login } = usePrivy();

  const isVisitor = role === "visitor";
  const label = isVisitor ? "Support" : "Donate";

  const handleClick = () => {
    if (isVisitor) {
      login();
      return;
    }
    alert(`Donation flow coming in Sprint 3.\nContract: ${orgContract}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex-1 bg-[#1A56DB] text-white rounded-md py-2 px-4 text-xs font-medium hover:bg-[#1A56DB]/90 active:scale-[0.97] transition-all"
    >
      {label}
    </button>
  );
}
