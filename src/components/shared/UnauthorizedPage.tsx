import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted text-center px-4">
      <ShieldX className="text-destructive/60" style={{ width: 64, height: 64 }} />
      <h1 className="text-xl font-semibold text-foreground mt-4">Access Denied</h1>
      <p className="text-sm text-muted-foreground mt-2">
        You don&apos;t have permission to view this page.
      </p>
      <Link
        to="/explore"
        className="mt-6 inline-flex items-center border border-border bg-card text-foreground hover:bg-muted rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        Go to Explore
      </Link>
    </div>
  );
}
