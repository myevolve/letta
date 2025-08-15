"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Database,
  Cpu,
  KeyRound,
  Server,
  Shield,
  User,
  Settings,
  CreditCard,
  LucideIcon,
} from "lucide-react";
import useAuthStore from "@/lib/stores/useAuthStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const Logo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="40" height="40" rx="8" fill="rgba(255, 255, 255, 0.1)" />
    <path
      d="M20 10L28 15V25L20 30L12 25V15L20 10Z"
      stroke="rgba(255, 255, 255, 0.8)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15L20 20L28 15"
      stroke="rgba(255, 255, 255, 0.8)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 30V20"
      stroke="rgba(255, 255, 255, 0.8)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NavItem: React.FC<NavItemProps> = ({ href, label, icon: Icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center justify-center h-12 w-12 rounded-lg transition-colors",
              isActive
                ? "bg-white/20 text-white"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-6 h-6" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const mainNavItems: NavItemProps[] = [
    { href: "/projects", label: "Projects", icon: Briefcase },
    { href: "/data-sources", label: "Data sources", icon: Database },
    { href: "/models", label: "Models", icon: Cpu },
    { href: "/api-keys", label: "API keys", icon: KeyRound },
    { href: "/self-hosted", label: "Self-hosted", icon: Server },
];

const bottomNavItems: NavItemProps[] = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/billing", label: "Billing and usage", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
];

export const GlobalSidebar = () => {
  const { user } = useAuthStore();

  return (
    <nav aria-label="Global Sidebar" className="fixed top-0 left-0 h-full w-20 bg-black/30 border-r border-white/20 backdrop-blur-lg flex flex-col items-center justify-between py-4 z-50">
      <div className="flex flex-col items-center gap-4">
        <Link href="/dashboard" className="mb-4">
          <Logo />
        </Link>
        <div className="flex flex-col gap-2">
            {mainNavItems.map((item) => <NavItem key={item.href} {...item} />)}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        {user?.role === "Admin" && (
            <>
                <div className="w-10 border-t border-white/20 my-2" />
                <NavItem href="/admin/users" label="Admin" icon={Shield} />
            </>
        )}
        <div className="w-10 border-t border-white/20 my-2" />
        {bottomNavItems.map((item) => <NavItem key={item.href} {...item} />)}
      </div>
    </nav>
  );
};
