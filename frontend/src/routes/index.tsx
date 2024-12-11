import { lazy, Suspense } from "react";
import React from "react";
import { Outlet, Navigate } from "react-router";
import { Box, LinearProgress, linearProgressClasses } from '@mui/material';
import { Layout } from "../layouts";
import ProductDetail from '../pages/ProductDetail';
import { useAuth } from "../context/AuthContext";
import LoadingFallback from "../components/LoadingFallBack";
import { createBrowserRouter } from "react-router-dom/dist";

// Lazy load the pages
const SignInPage = lazy(() => import("../pages/Login/SignInSide"));
const SignUpPage = lazy(() => import("../pages/SignUp"));
const PackagesPage = lazy(() => import("../pages/Packages"));
const CreatePackagePage = lazy(() => import("../pages/Packages/CreatePackage"));
const PackageDetail = lazy(() => import("../pages/Packages/PackageDetail"));

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f5f5f5' : '#303030'),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// Protected Route Wrapper for General Authenticated Routes
const ProtectedRouteWrapper: React.FC = () => {
  const {isLoggedIn} = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <Layout  isLoggedIn={isLoggedIn}>
      <Suspense fallback={renderFallback}>
        <Outlet />
      </Suspense>
    </Layout>
  );
};

// Define Routes with Protected and Admin Wrappers
export const router = createBrowserRouter([
  {
    element: <ProtectedRouteWrapper />,
    children: [
      { path: '/', element: <PackagesPage />, index: true },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'packages/create', element: <CreatePackagePage /> },
      { path: 'packages/:id', element: <PackageDetail /> },
    ],
  },
  {
    path: 'signup',
    element: (
      <Suspense fallback={renderFallback}>
        <SignUpPage />
      </Suspense>
    ),
  },
  {
    path: 'login',
    element: (
      <Suspense fallback={renderFallback}>
        <SignInPage />
      </Suspense>
    ),
  },
]);
