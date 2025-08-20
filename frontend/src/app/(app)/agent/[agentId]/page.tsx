"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { AgentSimulator } from "./agent-simulator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { lettaClient } from "@/lib/letta-client"
import { ToolManagerDialog } from "./tool-manager-dialog"

const agentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  system_prompt: z.string().optional(),
  // Add other fields as needed
})

type AgentFormValues = z.infer<typeof agentSchema>

export default function AgentEditorPage({ params }: { params: { agentId: string } }) {
  const [isToolManagerOpen, setIsToolManagerOpen] = useState(false)
  const queryClient = useQueryClient()
  const { agentId } = params

  const { data: agent, isLoading, error } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => lettaClient.agents.retrieve(agentId),
    enabled: !!agentId, // Only run the query if agentId is available
  })

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
  })

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        system_prompt: agent.system_prompt,
      })
    }
  }, [agent, form])

  const mutation = useMutation({
    mutationFn: (updatedAgent: AgentFormValues) => lettaClient.agents.modify(agentId, updatedAgent),
    onSuccess: () => {
      toast.success("Agent saved successfully!")
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] })
      queryClient.invalidateQueries({ queryKey: ["agents"] }) // Invalidate the list view
    },
    onError: (error) => {
      toast.error("Failed to save agent", { description: error.message })
    },
  })

  const onSubmit = (values: AgentFormValues) => {
    mutation.mutate(values)
  }

  if (isLoading) return <div>Loading agent...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border dark:border-white/10 bg-black/10 backdrop-blur-lg">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full flex-col p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Agent Settings</h2>
            <p className="text-muted-foreground mb-6">
              Editing agent: <span className="font-mono">{agent?.name}</span>
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="instructions">System Instructions</Label>
                <Textarea id="instructions" rows={10} {...form.register("system_prompt")} />
              </div>
              <div>
                <Label>Model Selection</Label>
                <p className="text-sm text-muted-foreground">Model: {agent?.model}</p>
              </div>
              <div>
                <Label>Tools</Label>
                <Button variant="outline" type="button" onClick={() => setIsToolManagerOpen(true)}>Manage Tools</Button>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <Button type="submit" variant="cta" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Agent"}
              </Button>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="h-full p-6">
            <AgentSimulator agentId={agentId} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <ToolManagerDialog isOpen={isToolManagerOpen} onOpenChange={setIsToolManagerOpen} agentId={agentId} />
    </form>
  )
}
