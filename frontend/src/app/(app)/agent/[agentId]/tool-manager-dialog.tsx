"use client"

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

interface ToolManagerDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function ToolManagerDialog({ isOpen, onOpenChange }: ToolManagerDialogProps) {
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
            <TabsContent value="tools" className="flex-1">
              <p>Tool management UI would go here.</p>
            </TabsContent>
            <TabsContent value="dependencies" className="flex-1">
              <p>Dependency management UI would go here.</p>
            </TabsContent>
            <TabsContent value="variables" className="flex-1">
              <p>Variable management UI would go here.</p>
            </TabsContent>
            <TabsContent value="rules" className="flex-1">
              <p>Visual graph editor for execution rules would go here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
