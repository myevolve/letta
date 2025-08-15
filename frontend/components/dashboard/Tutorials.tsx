import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Tutorials = () => {
    const tutorialLinks = [
        { title: 'Creating your first agent', href: '#' },
        { title: 'Connecting a data source', href: '#' },
        { title: 'Understanding models and templates', href: '#' },
    ];

  return (
    <Card className="bg-black/20 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Get Started</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tutorialLinks.map((link) => (
            <li key={link.title}>
                <Link href={link.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                    <p className="font-medium">{link.title}</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default Tutorials;
