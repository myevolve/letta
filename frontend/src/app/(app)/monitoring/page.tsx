import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function MonitoringPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Monitoring</h1>
        <p className="text-muted-foreground">
          Track agent performance and metrics over time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Calls Over Time</CardTitle>
            <CardDescription>Total API calls in the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
              <p>Chart placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
            <CardDescription>Prompt vs. Completion tokens.</CardDescription>
          </Header>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
              <p>Chart placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Success rate and average response time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
              <p>Chart placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
