import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-black bg-opacity-20 border border-gray-700 backdrop-blur-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required className="bg-black bg-opacity-30 border-gray-600"/>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full">Send Reset Link</Button>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">
              Back to Log In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
