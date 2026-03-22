import React, { Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageLoader from "@/components/layout/PageLoader";
import { useAuth } from "@/contexts/AuthContext";

const ExplorePage = React.lazy(() => import("@/pages/ExplorePage"));
const RegisterPage = React.lazy(() => import("@/pages/RegisterPage"));
const OrgProfilePage = React.lazy(() => import("@/pages/OrgProfilePage"));

function SmartRedirect() {
  const { role, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (role === "org_owner") return <Navigate to="/dashboard" replace />;
  if (role === "protocol_admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/explore" replace />;
}

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <SmartRedirect /> },
      {
        path: "explore",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ExplorePage />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<PageLoader />}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
];
