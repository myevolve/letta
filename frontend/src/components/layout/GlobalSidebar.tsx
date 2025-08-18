import Link from "next/link";
import {
  LayoutGrid,
  Database,
  BrainCircuit,
  KeyRound,
  Server,
  Shield,
  User,
  CreditCard,
  Settings,
  Bot,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";

const mainNavLinks = [
  { href: "/projects", icon: LayoutGrid, label: "Projects" },
  { href: "/data-sources", icon: Database, label: "Data sources" },
  { href: "/models", icon: BrainCircuit, label: "Models" },
  { href: "/api-keys", icon: KeyRound, label: "API keys" },
  { href: "/self-hosted", icon: Server, label: "Self-hosted" },
];

const adminNavLinks = [
  { href: "/admin", icon: Shield, label: "Admin" },
];

const userNavLinks = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/billing", icon: CreditCard, label: "Billing and usage" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function GlobalSidebar() {
  const { user } = useAuthStore();

  return (
    <TooltipProvider>
      <nav className="w-20 flex flex-col items-center gap-4 py-4 border-r dark:border-white/10 bg-black/10 backdrop-blur-lg">
        <Link href="/" className="mb-4">
          <Bot size={32} />
          <span className="sr-only">Letta AI</span>
        </Link>

        <div className="flex flex-col items-center gap-2">
          {mainNavLinks.map((link) => (
            <SidebarLink key={link.href} {...link} />
          ))}
        </div>

        <hr className="w-10/12 my-2 border-t dark:border-white/10" />

        {user?.role === "Admin" && (
          <div className="flex flex-col items-center gap-2">
            {adminNavLinks.map((link) => (
              <SidebarLink key={link.href} {...link} />
            ))}
            <hr className="w-10/12 my-2 border-t dark:border-white/10" />
          </div>
        )}

        <div className="mt-auto flex flex-col items-center gap-2">
          {userNavLinks.map((link) => (
            <SidebarLink key={link.href} {...link} />
          ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon className="h-6 w-6" />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
