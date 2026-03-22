import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { OrgFull } from "@/types/claro";

interface Props {
  org: OrgFull;
  orgContractAddress: string;
}

const ORG_TYPES = [
  { value: "", label: "Select type..." },
  { value: "ngo", label: "NGO / Non-profit" },
  { value: "research", label: "Research Lab" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "animals", label: "Animal Welfare" },
  { value: "community", label: "Community" },
  { value: "other", label: "Other" },
];

export default function ProfileTab({ org, orgContractAddress }: Props) {
  const { address } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    logo_url: org.logo_url ?? "",
    cover_image_url: org.cover_image_url ?? "",
    contact_email: org.contact_email ?? "",
    org_type: org.org_type ?? "",
    website: org.website ?? "",
    social_twitter: org.social_twitter ?? "",
    social_instagram: org.social_instagram ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setForm({
      logo_url: org.logo_url ?? "",
      cover_image_url: org.cover_image_url ?? "",
      contact_email: org.contact_email ?? "",
      org_type: org.org_type ?? "",
      website: org.website ?? "",
      social_twitter: org.social_twitter ?? "",
      social_instagram: org.social_instagram ?? "",
    });
  }, [org.contract_address]);

  const update = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  async function handleSave() {
    setIsSaving(true);
    setSaveResult("idle");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-org-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            contract_address: orgContractAddress,
            wallet_address: address,
            ...form,
          }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setSaveResult("success");
      queryClient.invalidateQueries({ queryKey: ["org-profile", orgContractAddress] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-org", orgContractAddress] });
      setTimeout(() => setSaveResult("idle"), 3000);
    } catch {
      setSaveResult("error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 mt-4 max-w-2xl">
      {/* Read-only info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Organization Info</h3>
        <p className="text-xs text-gray-400 italic mb-4">
          Name and country are set on-chain and cannot be edited here.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Name</label>
            <div className="bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700 mt-1">{org.name}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Country</label>
            <div className="bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700 mt-1">{org.country}</div>
          </div>
        </div>
      </div>

      {/* Editable profile */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Public Profile</h3>
        <div className="space-y-4">
          <Field label="Organization Type">
            <select
              value={form.org_type}
              onChange={e => update("org_type", e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ORG_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Website">
            <input type="url" placeholder="https://yourorg.org" value={form.website} onChange={e => update("website", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Contact Email">
            <input type="email" placeholder="contact@yourorg.org" value={form.contact_email} onChange={e => update("contact_email", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Logo URL" desc="Direct link to your logo image (square, min 200×200px)">
            <input type="url" placeholder="https://..." value={form.logo_url} onChange={e => update("logo_url", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Cover Image URL" desc="Wide banner image for your public profile page">
            <input type="url" placeholder="https://..." value={form.cover_image_url} onChange={e => update("cover_image_url", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Twitter / X handle">
            <input placeholder="@yourhandle (without URL)" value={form.social_twitter} onChange={e => update("social_twitter", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Instagram handle">
            <input placeholder="@yourhandle (without URL)" value={form.social_instagram} onChange={e => update("social_instagram", e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div>
            {saveResult === "success" && (
              <span className="flex items-center gap-1 text-sm text-[#057A55]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Profile saved
              </span>
            )}
            {saveResult === "error" && (
              <span className="text-sm text-red-600">Save failed. Please try again.</span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#1A56DB] text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      {children}
      {desc && <p className="text-xs text-gray-400 mt-1">{desc}</p>}
    </div>
  );
}
