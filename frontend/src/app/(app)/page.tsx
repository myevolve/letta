"use client"

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
      <p className="text-lg text-gray-600">You are logged in as a {user?.role}.</p>
      <Button onClick={handleLogout} className="mt-4">
        Logout
      </Button>
    </div>
  );
}
