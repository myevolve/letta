import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const RecentWork = () => {
  const recentAgents = [
    { name: 'Customer Support Bot', lastEdited: '2 hours ago' },
    { name: 'Data Analyst Agent', lastEdited: '1 day ago' },
    { name: 'Marketing Content Generator', lastEdited: '3 days ago' },
  ];

  return (
    <Card className="bg-black/20 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Recent Work</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recentAgents.map((agent) => (
            <li key={agent.name} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
              <div>
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-gray-400">Last edited: {agent.lastEdited}</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="#">Open</Link>
              </Button>
            </li>
          ))}
        </ul>
      </ContentContent>
    </Card>
  );
};

export default RecentWork;
