import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
      <Loader2 className="animate-spin text-primary" style={{ width: 32, height: 32 }} />
      <p className="text-muted-foreground text-sm mt-3">Loading...</p>
    </div>
  );
}
