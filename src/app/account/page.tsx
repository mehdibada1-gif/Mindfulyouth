'use client';

import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // This should be handled by the UserProvider, but as a fallback
    router.push('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    // The UserProvider will redirect to /login
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center items-center">
                <Avatar className="h-20 w-20 mb-4">
                    <AvatarFallback className="text-3xl">
                        {user.email ? user.email.charAt(0).toUpperCase() : <User />}
                    </AvatarFallback>
                </Avatar>
            <CardTitle>My Account</CardTitle>
            <CardDescription>View and manage your account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                </div>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-xs break-all">{user.uid}</p>
                </div>
            <Button onClick={handleSignOut} variant="outline" className="w-full">Sign Out</Button>
            </CardContent>
        </Card>
    </div>
  );
}
