import React, { Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageLoader from "@/components/layout/PageLoader";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

const DashboardPage = React.lazy(() => import("@/pages/DashboardPage"));
const OrganizationPage = React.lazy(() => import("@/pages/OrganizationPage"));
const PayrollPage = React.lazy(() => import("@/pages/PayrollPage"));
const GrantsPage = React.lazy(() => import("@/pages/GrantsPage"));
const AdminPage = React.lazy(() => import("@/pages/AdminPage"));

function wrap(requiredRole: "org_owner" | "protocol_admin", Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </ProtectedRoute>
  );
}

export const protectedRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "dashboard", element: wrap("org_owner", DashboardPage) },
      { path: "organization", element: wrap("org_owner", OrganizationPage) },
      { path: "payroll", element: wrap("org_owner", PayrollPage) },
      { path: "grants", element: wrap("org_owner", GrantsPage) },
      { path: "admin", element: wrap("protocol_admin", AdminPage) },
    ],
  },
];
