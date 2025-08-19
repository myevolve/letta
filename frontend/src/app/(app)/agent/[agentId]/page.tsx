import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function AgentEditorPage({ params }: { params: { agentId: string } }) {
  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border dark:border-white/10 bg-black/10 backdrop-blur-lg">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full flex-col p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Agent Settings</h2>
            <p className="text-muted-foreground mb-6">
              Editing agent: <span className="font-mono">{params.agentId}</span>
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input id="name" defaultValue="My Awesome Agent" />
              </div>
              <div>
                <Label htmlFor="instructions">System Instructions</Label>
                <Textarea id="instructions" rows={10} defaultValue="You are a helpful assistant." />
              </div>
              <div>
                <Label>Model Selection</Label>
                <p className="text-sm text-muted-foreground">Model selection UI would go here.</p>
              </div>
               <div>
                <Label>Advanced LLM/Embedding Config</Label>
                <p className="text-sm text-muted-foreground">Advanced config UI would go here.</p>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <Button variant="cta">Save Agent</Button>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle>Simulator</CardTitle>
                <CardDescription>Test your agent's responses.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Agent chat simulator would go here.</p>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
