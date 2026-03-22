import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { publicRoutes } from "@/routes/publicRoutes";
import { protectedRoutes } from "@/routes/protectedRoutes";
import NotFound from "@/pages/NotFound";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const privyConfig = {
  loginMethods: ["email", "google", "wallet"] as const,
  appearance: { theme: "light" as const, accentColor: "#1A56DB" },
  embeddedWallets: { createOnLogin: "users-without-wallets" as const },
};

const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
  { path: "*", element: <NotFound /> },
]);

function Root() {
  return (
    <PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
