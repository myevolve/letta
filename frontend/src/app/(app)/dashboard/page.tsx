import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
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
            <ul>
              <li>Agent: My Chatbot</li>
              <li>Template: Customer Support</li>
              <li>Identity: AI Assistant</li>
            </ul>
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
          <CardHeader>
            <CardTitle>Project Stats</CardTitle>
            <CardDescription>High-level metrics for this project.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Active Agents: 5</p>
            <p>API Calls Today: 1,234</p>
            <p>Total Runs: 5,678</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
