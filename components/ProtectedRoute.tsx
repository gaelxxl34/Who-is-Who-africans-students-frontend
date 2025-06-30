"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "student" | "employer" | "university_admin")[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check after auth context has loaded
    if (!loading) {
      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, redirecting to login');
        console.log('🔍 Current user state:', user);
        console.log('🔍 isAuthenticated:', isAuthenticated);
        
        // Store current path for redirect after login
        if (typeof window !== "undefined") {
          sessionStorage.setItem("redirectAfterLogin", pathname);
        }
        router.push("/login");
      }
    }
  }, [loading, isAuthenticated, router, pathname]);

  // Show loading only while auth context is loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-700 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Check if user has required role - more flexible approach
  if (allowedRoles.length > 0 && user) {
    // Get user type from either property for backward compatibility
    const userType = user.userType || (user as any).user_type || (user as any).type;
    
    console.log('🔍 Checking user permissions:');
    console.log('  - User type:', userType);
    console.log('  - Required roles:', allowedRoles);
    console.log('  - Has permission:', allowedRoles.includes(userType as any));

    if (userType && !allowedRoles.includes(userType as any)) {
      console.log(
        `❌ Access denied. User role: ${userType}, Required: ${allowedRoles}`
      );

      // Redirect to appropriate dashboard based on user type
      const userDashboard =
        userType === "admin"
          ? "/admin/dashboard"
          : userType === "university_admin"
          ? "/university-admin/dashboard"
          : "/dashboard"; // Both students and employers go to general dashboard

      window.location.href = userDashboard;
      return null;
    }
  }

  // If authenticated and has permission, render children
  return <>{children}</>;
}
