import { useState } from "react";
import DonationModal from "@/components/donation/DonationModal";

interface Props {
  orgContract: string;
  orgName: string;
}

export default function SupportButton({ orgContract, orgName }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex-1 bg-[#1A56DB] text-white rounded-md py-2 px-4 text-xs font-medium hover:bg-[#1A56DB]/90 active:scale-[0.97] transition-all"
      >
        Support
      </button>
      <DonationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        orgContract={orgContract}
        orgName={orgName}
      />
    </>
  );
}
