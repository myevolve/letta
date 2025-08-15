import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Overview = () => {
  return (
    <Card className="bg-black/20 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to your dashboard. Here is a summary of your projects and activities.</p>
        {/* Placeholder for overview stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-bold">5</h3>
                <p className="text-sm text-gray-400">Active Agents</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-bold">12</h3>
                <p className="text-sm text-gray-400">Projects</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Overview;
