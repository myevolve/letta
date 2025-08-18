import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and project settings.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="project">Project</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Profile settings form would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Manage your organization details.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Organization settings form would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Usage</CardTitle>
              <CardDescription>View your current plan and usage.</CardDescription>
            </Header>
            <CardContent>
              <p>Billing information would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Manage settings for the current project.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Project settings form would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
