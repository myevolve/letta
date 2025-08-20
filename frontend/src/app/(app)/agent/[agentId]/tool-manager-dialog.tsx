"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { lettaClient } from "@/lib/letta-client"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"

interface ToolManagerDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  agentId: string
}

export function ToolManagerDialog({ isOpen, onOpenChange, agentId }: ToolManagerDialogProps) {
  const { data: tools, isLoading, error } = useQuery({
    queryKey: ["agentTools", agentId],
    queryFn: () => lettaClient.agents.tools.list(agentId),
    enabled: isOpen && !!agentId, // Only fetch when the dialog is open
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-full h-full max-h-screen flex flex-col">
        <DialogHeader>
          <DialogTitle>Tool Manager</DialogTitle>
          <DialogDescription>
            Manage your agent's capabilities, including tools, dependencies, variables, and execution rules.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="tools" className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>
            <TabsContent value="tools" className="flex-1 p-4">
              {isLoading && <p>Loading tools...</p>}
              {error && <p className="text-red-500">Error fetching tools: {error.message}</p>}
              {tools && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tools.map(tool => (
                    <Card key={tool.id} className="p-4">
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="dependencies" className="flex-1 p-4">
              <p>Dependency management UI would go here.</p>
            </TabsContent>
            <TabsContent value="variables" className="flex-1 p-4">
              <p>Variable management UI would go here.</p>
            </TabsContent>
            <TabsContent value="rules" className="flex-1 p-4">
              <p>Visual graph editor for execution rules would go here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
