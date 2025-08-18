import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  FileText,
  Fingerprint,
  Settings,
  Monitor,
  MessageSquare,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const projectNavLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/agents", icon: Users, label: "Agents" },
  { href: "/templates", icon: FileText, label: "Templates" },
  { href: "/identities", icon: Fingerprint, label: "Identities" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const observabilityLinks = [
  { href: "/monitoring", icon: Monitor, label: "Monitoring" },
  { href: "/responses", icon: MessageSquare, label: "Responses" },
];

export default function ProjectSidebar() {
  return (
    <aside className="w-64 flex flex-col gap-4 py-4 border-r dark:border-white/10 bg-black/10 backdrop-blur-lg">
      <div className="px-4">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All projects
        </Button>
      </div>

      <div className="px-4">
        <h2 className="text-lg font-semibold">DP Default Project</h2>
      </div>

      <hr className="w-full my-2 border-t dark:border-white/10" />

      <nav className="flex-1 px-4 space-y-1">
        {projectNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="observability" className="border-b-0">
            <AccordionTrigger className="px-3 py-2 text-muted-foreground hover:no-underline hover:text-primary">
              Observability
            </AccordionTrigger>
            <AccordionContent className="pl-8">
              {observabilityLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>
    </aside>
  );
}
