import React from 'react';
import Link from 'next/link';
import { ChevronLeft, LayoutDashboard, Bot, FileText, Fingerprint, Settings, Telescope } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ProjectSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agents', label: 'Agents', icon: Bot },
    { href: '/templates', label: 'Templates', icon: FileText },
    { href: '/identities', label: 'Identities', icon: Fingerprint },
    { href: '/project-settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="h-screen w-64 flex-shrink-0 bg-black/10 p-4 border-r border-white/10 backdrop-blur-lg">
      <div className="flex flex-col h-full">
        {/* Back to Projects */}
        <div className="mb-4 pb-4 border-b border-white/10">
          <Link href="/projects" className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 mr-2" />
            All projects
          </Link>
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-white">DP Default Project</h2>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

            {/* Observability Section */}
            <Accordion type="single" collapsible className="w-full mt-2">
                <AccordionItem value="observability" className="border-none">
                    <AccordionTrigger className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-gray-300 hover:bg-white/5 hover:text-white hover:no-underline">
                         <div className="flex items-center">
                            <Telescope className="w-4 h-4 mr-3" />
                            Observability
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6">
                        <ul className="space-y-1">
                            <li>
                                <Link href="/monitoring" className="flex items-center px-3 py-2 text-xs rounded-md text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                                    Monitoring
                                </Link>
                            </li>
                            <li>
                                <Link href="/responses" className="flex items-center px-3 py-2 text-xs rounded-md text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                                    Responses
                                </Link>
                            </li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </nav>
      </div>
    </aside>
  );
};

export default ProjectSidebar;
