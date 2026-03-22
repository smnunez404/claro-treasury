import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/contexts/AuthContext";
import { Info, Wallet, CheckCircle2 } from "lucide-react";
import { truncateAddress } from "@/lib/constants";
import type { RegisterFormData } from "@/types/claro";

interface Props {
  onSubmit: (data: RegisterFormData) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegistrationForm({ onSubmit }: Props) {
  const { login } = usePrivy();
  const { address, role } = useAuth();
  const isConnected = role !== "visitor" && !!address;

  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    country: "",
    description: "",
    contact_email: "",
    website: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors: Record<string, string> = {};
  if (form.name.trim().length < 3) errors.name = "Name must be at least 3 characters";
  if (!form.country.trim()) errors.country = "Country is required";
  if (form.description.trim().length < 20) errors.description = "Description must be at least 20 characters";
  if (!emailRegex.test(form.contact_email.trim())) errors.contact_email = "Valid email is required";

  const isValid = Object.keys(errors).length === 0;

  function showError(field: string) {
    return (touched[field] || submitAttempted) && errors[field];
  }

  function handleBlur(field: string) {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  function handleSubmit() {
    setSubmitAttempted(true);
    if (!isValid) return;
    onSubmit(form);
  }

  const inputCls =
    "w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition-shadow";
  const errorCls = "text-xs text-red-600 mt-1";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Organization Details</h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="Young AI Society Bolivia"
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            onBlur={() => handleBlur("name")}
          />
          <div className="flex justify-between mt-1">
            {showError("name") ? <span className={errorCls}>{errors.name}</span> : <span />}
            <span className="text-xs text-gray-400">{form.name.length}/100</span>
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="Bolivia"
            value={form.country}
            onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
            onBlur={() => handleBlur("country")}
          />
          {showError("country") && <p className={errorCls}>{errors.country}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={4}
            placeholder="What does your organization do? Who does it serve?"
            maxLength={500}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            onBlur={() => handleBlur("description")}
          />
          <div className="flex justify-between mt-1">
            {showError("description") ? <span className={errorCls}>{errors.description}</span> : <span />}
            <span className="text-xs text-gray-400">{form.description.length}/500</span>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            type="email"
            placeholder="contact@yourorg.org"
            value={form.contact_email}
            onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
            onBlur={() => handleBlur("contact_email")}
          />
          <p className="text-xs text-gray-400 mt-1">For CLARO Protocol communications only. Not shown publicly.</p>
          {showError("contact_email") && <p className={errorCls}>{errors.contact_email}</p>}
        </div>

        {/* Website */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Website</label>
          <input
            className={inputCls}
            type="url"
            placeholder="https://yourorg.org"
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
          />
          <p className="text-xs text-gray-400 mt-1">Optional — your public website</p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 flex gap-3">
        <Info className="text-blue-500 shrink-0" style={{ width: 16, height: 16, marginTop: 2 }} />
        <p className="text-sm text-blue-700">
          Your organization will be reviewed by CLARO Protocol within 24–48 hours. You can start using your treasury
          immediately after deployment.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6">
        {!isConnected ? (
          <>
            <button
              onClick={() => login()}
              className="bg-[#1A56DB] text-white w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <Wallet style={{ width: 16, height: 16 }} />
              Connect Wallet to Continue
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Use email, Google, or your existing wallet — no crypto knowledge required
            </p>
          </>
        ) : (
          <>
            <button
              onClick={handleSubmit}
              disabled={!isValid && submitAttempted}
              className="bg-[#1A56DB] text-white w-full py-3 rounded-md font-medium hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
              <CheckCircle2 className="text-[#057A55]" style={{ width: 12, height: 12 }} />
              Connected: {truncateAddress(address!)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
