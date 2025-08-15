"use client";

import Link from "next/link";
import {
  ChevronLeft,
  LayoutDashboard,
  Bot,
  FileText,
  Users,
  Settings,
  BarChart,
  List,
} from "lucide-react";

export default function ProjectSidebar() {
  return (
    <aside className="fixed top-0 left-20 h-full w-64 bg-black bg-opacity-10 border-r border-gray-700 backdrop-blur-lg flex flex-col p-4">
      <div className="mb-8">
        <Link href="/projects" className="flex items-center text-gray-400 hover:text-white">
          <ChevronLeft className="w-4 h-4 mr-2" />
          All projects
        </Link>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold">DP</h2>
        <p className="text-sm text-gray-400">Default Project</p>
      </div>
      <nav className="flex flex-col gap-2">
        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700">
          <Bot className="h-4 w-4" />
          Agents
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700">
          <FileText className="h-4 w-4" />
          Templates
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700">
          <Users className="h-4 w-4" />
          Identities
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        {/* Collapsible Observability section */}
        <div>
            <h3 className="mt-4 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Observability</h3>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700">
                <BarChart className="h-4 w-4" />
                Monitoring
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700">
                <List className="h-4 w-4" />
                Responses
            </Link>
        </div>
      </nav>
    </aside>
  );
}
