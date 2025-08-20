"use client"

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { lettaClient } from "@/lib/letta-client";
import Link from "next/link";
import { Bot, FolderKanban, Zap } from "lucide-react";

export default function DashboardPage() {
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: () => lettaClient.agents.list(),
  });

  const recentAgents = agents?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
        <p className="text-muted-foreground">Overview of your project.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump back into your recent work.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading recent agents...</p>
            ) : error ? (
              <p className="text-red-500">Could not load agents.</p>
            ) : recentAgents.length > 0 ? (
              <ul>
                {recentAgents.map(agent => (
                  <li key={agent.id} className="truncate">
                    <Link href={`/agent/${agent.id}`} className="hover:underline">
                      Agent: {agent.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No agents found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tutorials</CardTitle>
            <CardDescription>Learn how to use Letta.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              <li>Creating your first agent</li>
              <li>Understanding memory</li>
              <li>Using tools</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : error ? "N/A" : agents?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Total agents in project</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">(Static Data)</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
