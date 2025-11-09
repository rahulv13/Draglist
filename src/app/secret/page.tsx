'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecretPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <KeyRound className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome to the Secret Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You have successfully unlocked the secret section. Anything is
            possible here!
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button>Secret Action</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
