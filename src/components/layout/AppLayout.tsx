import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import MobileSidebar from "./MobileSidebar";

export default function AppLayout() {
  const { role } = useAuth();
  const hasSidebar = role === "org_owner" || role === "protocol_admin";

  if (hasSidebar) {
    return (
      <div className="min-h-screen bg-muted">
        <Sidebar />
        <MobileSidebar />
        <main className="lg:pl-64 pt-14 lg:pt-0">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <TopNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
