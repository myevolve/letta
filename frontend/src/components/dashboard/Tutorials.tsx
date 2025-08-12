import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const tutorialLinks = [
    { title: "Building your first agent", href: "#" },
    { title: "Connecting to data sources", href: "#" },
    { title: "Understanding agent memory", href: "#" },
    { title: "Deploying to production", href: "#" },
];

export const Tutorials = () => {
  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <CardTitle>Tutorials & Guides</CardTitle>
        <CardDescription>
            Get started with these helpful resources.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            {tutorialLinks.map((link, index) => (
                <Link href={link.href} key={index} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <p>{link.title}</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
                </Link>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
