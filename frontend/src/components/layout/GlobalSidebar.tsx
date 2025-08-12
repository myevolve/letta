"use client";

import Link from "next/link";
import {
  Home,
  Database,
  Cpu,
  KeyRound,
  Server,
  Shield,
  User,
  Settings,
  CreditCard,
} from "lucide-react";
import useAuthStore from "@/lib/stores/useAuthStore";

export default function GlobalSidebar() {
  const { user } = useAuthStore();

  return (
    <aside className="fixed top-0 left-0 h-full w-20 bg-black bg-opacity-30 border-r border-gray-700 backdrop-blur-lg flex flex-col items-center py-4">
      <div className="mb-8">
        {/* Letta Logo */}
        <Link href="/dashboard">
          <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
        </Link>
      </div>
      <nav className="flex flex-col gap-4">
        <Link href="#" className="text-gray-400 hover:text-white">
          <Home className="w-6 h-6" />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-white">
          <Database className="w-6 h-6" />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-white">
          <Cpu className="w-6 h-6" />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-white">
          <KeyRound className="w-6 h-6" />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-white">
          <Server className="w-6 h-6" />
        </Link>
        <div className="border-t border-gray-700 w-10 my-2"></div>
        {user?.role === "Admin" && (
          <Link href="/admin" className="text-gray-400 hover:text-white">
            <Shield className="w-6 h-6" />
          </Link>
        )}
        <div className="border-t border-gray-700 w-10 my-2"></div>
        <Link href="#" className="text-gray-400 hover:text-white">
          <User className="w-6 h-6" />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-white">
          <CreditCard className="w-6 h-6" />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-white">
          <Settings className="w-6 h-6" />
        </Link>
      </nav>
    </aside>
  );
}
