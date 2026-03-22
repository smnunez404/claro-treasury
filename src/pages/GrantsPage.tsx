import { Gift } from "lucide-react";

export default function GrantsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Grants</h1>
      <p className="text-sm text-muted-foreground">Transparent funding rounds for your projects</p>
      <div className="flex flex-col items-center py-16 text-center">
        <Gift className="text-gray-300" style={{ width: 48, height: 48 }} />
        <p className="text-sm font-semibold text-foreground mt-4">No grants created yet</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Create a grant to start receiving transparent funding from donors worldwide.
        </p>
        <button className="bg-primary text-primary-foreground mt-6 px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          Create Grant
        </button>
      </div>
    </div>
  );
}
