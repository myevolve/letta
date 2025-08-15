import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, PlusCircle } from "lucide-react";
import Link from "next/link";

const recentAgents = [
  { name: "Sales Support Agent", description: "Answers customer questions about pricing and features.", lastEdited: "2 hours ago" },
  { name: "Onboarding Specialist", description: "Guides new users through the platform.", lastEdited: "1 day ago" },
  { name: "Data Analyst Bot", description: "Processes and visualizes user data.", lastEdited: "3 days ago" },
  { name: "Content Summarizer", description: "Summarizes long articles and documents.", lastEdited: "5 days ago" },
];

export const RecentWork = () => {
  return (
    <Card className="bg-black/20 border-white/10 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Work</CardTitle>
          <CardDescription>
            Quickly jump back into your recent agents.
          </CardDescription>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Agent
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {recentAgents.map((agent, index) => (
                <Link href="#" key={index} className="flex items-center p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Bot className="w-6 h-6 mr-4 text-gray-400" />
                    <div className="flex-1">
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{agent.lastEdited}</p>
                </Link>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
