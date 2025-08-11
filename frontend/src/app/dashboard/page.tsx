"use client";

import withAuth from "@/components/withAuth";
import useAuthStore from "@/lib/stores/useAuthStore";

function DashboardPage() {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        window.location.href = "/login";
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl">Welcome, {user?.name}</h1>
      <p>Your role is: {user?.role}</p>
      <button onClick={handleLogout} className="mt-4 p-2 bg-red-500 rounded">Logout</button>
    </div>
  );
}

export default withAuth(DashboardPage);
