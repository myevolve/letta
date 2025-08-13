'use client';

import React from 'react';
import withAuth from '@/lib/withAuth';
import useAuth from '@/hooks/useAuth';
import Overview from '@/components/dashboard/Overview';
import RecentWork from '@/components/dashboard/RecentWork';
import Tutorials from '@/components/dashboard/Tutorials';

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
                <p className="text-gray-400">Here's what's happening with your projects today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Overview />
                </div>
                <div className="lg:col-span-1">
                    <RecentWork />
                </div>
                <div className="lg:col-span-3">
                    <Tutorials />
                </div>
            </div>
        </div>
    );
}

export default withAuth(DashboardPage);
