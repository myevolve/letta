"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Paperclip, Send } from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { lettaClient } from "@/lib/letta-client"
import { LettaMessage } from "@letta-ai/letta-client/api/types"

const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
})

type ChatFormValues = z.infer<typeof chatSchema>

interface AgentSimulatorProps {
  agentId: string;
}

export function AgentSimulator({ agentId }: AgentSimulatorProps) {
  const [messages, setMessages] = useState<LettaMessage[]>([])

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: "" },
  })

  const mutation = useMutation({
    mutationFn: (messageText: string) => lettaClient.agents.messages.create(agentId, {
      messages: [{ role: "user", content: messageText }]
    }),
    onSuccess: (response) => {
      // Add both the user message and the agent's response messages
      setMessages(prev => [...prev, ...response.messages]);
      form.reset()
    },
    onError: (error) => {
      toast.error("Failed to send message", { description: error.message })
    },
  })

  const onSubmit = (values: ChatFormValues) => {
    // Add user message to UI immediately for better UX
    const userMessage: LettaMessage = { role: "user", content: values.message };
    setMessages(prev => [...prev, userMessage]);
    mutation.mutate(values.message)
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Simulator</CardTitle>
        <CardDescription>Test your agent's responses.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role !== 'user' && <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">A</div>}
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">U</div>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input id="message" placeholder="Type your message..." {...form.register("message")} />
          <Button type="submit" size="icon" disabled={mutation.isPending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
