import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Bot, Folder, Cpu } from "lucide-react";

export const Overview = () => {
  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Folder className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-2xl font-bold">4</p>
            <p className="text-sm text-muted-foreground">Projects</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Bot className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-2xl font-bold">27</p>
            <p className="text-sm text-muted-foreground">Agents</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Cpu className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Models</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
