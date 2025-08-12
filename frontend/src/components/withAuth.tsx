"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/stores/useAuthStore";
import React from "react";
import { MainLayout } from "./layout/MainLayout";

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper: React.FC<P> = (props) => {
    const router = useRouter();
    const { token } = useAuthStore();

    useEffect(() => {
      if (!token) {
        router.push("/login");
      }
    }, [token, router]);

    if (!token) {
      // Return null or a loading spinner while redirecting
      return null;
    }

    return (
      <MainLayout>
        <WrappedComponent {...props} />
      </MainLayout>
    );
  };

  // Assign a display name for better debugging
  Wrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};

export default withAuth;
