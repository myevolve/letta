"use client"

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { lettaClient } from "@/lib/letta-client";
import Link from "next/link";

export default function AgentsPage() {
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: () => lettaClient.agents.list(),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Manage and create your agents.</p>
        </div>
        <Button variant="cta">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create a new agent
        </Button>
      </div>

      {isLoading && <p>Loading agents...</p>}
      {error && <p className="text-red-500">Error fetching agents: {error.message}</p>}

      {agents && (
        <>
          {agents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <Link href={`/agent/${agent.id}`} key={agent.id}>
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle>{agent.name}</CardTitle>
                      <CardDescription>
                        Model: {agent.model}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {agent.system_prompt || "No system prompt."}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-10">
                <h3 className="text-xl font-semibold">No agents yet</h3>
                <p className="text-muted-foreground mt-2">
                  Create your first agent to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
