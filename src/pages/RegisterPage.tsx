import { Info } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Register Your Organization</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Deploy your own treasury contract on Avalanche and receive transparent funding.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mt-6">
        <Info className="text-blue-600 shrink-0" style={{ width: 20, height: 20 }} />
        <p className="text-sm text-blue-800">
          Requires approximately 0.02 AVAX for contract deployment gas. Connect your wallet to proceed.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mt-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Organization Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Young AI Society Bolivia"
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Country <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Bolivia"
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Description</label>
            <textarea
              placeholder="We build open-source AI tools for social impact..."
              rows={3}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Contact Email</label>
            <input
              type="email"
              placeholder="contact@yourorg.org"
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <button className="bg-primary text-primary-foreground w-full py-3 rounded-md font-medium mt-6 hover:opacity-90 transition-opacity">
          Deploy My Treasury
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Your treasury contract will be deployed on Avalanche Fuji Testnet
      </p>
    </div>
  );
}
