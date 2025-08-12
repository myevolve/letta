"use client";

import withAuth from "@/components/withAuth";
import { Overview } from "@/components/dashboard/Overview";
import { RecentWork } from "@/components/dashboard/RecentWork";
import { Tutorials } from "@/components/dashboard/Tutorials";

function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your projects and agents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentWork />
        </div>

        <div className="space-y-8">
          <Overview />
          <Tutorials />
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
