
'use client';

import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const countries = ["Italy", "the Netherlands", "Sweden", "Lebanon", "Tunisia", "Morocco"];

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().optional().refine(val => val === '' || (val && val.length >= 6), {
    message: 'Password must be at least 6 characters.',
  }),
  country: z.string().optional(),
});


export default function AccountPage() {
  const { user, loading, signOut, updateUserProfile, uploadProfilePicture } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      fullName: user?.displayName || '',
      email: user?.email || '',
      password: '',
      country: user?.country || '',
    },
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
  
  const handleAvatarClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setIsSaving(true);
        try {
            await uploadProfilePicture(file);
            toast({
                title: "Profile Picture Updated",
                description: "Your new picture has been saved.",
            });
            // You might need to manually trigger a state update to show the new picture
            window.location.reload(); 
        } catch (error: any) {
             toast({
                title: "Upload Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }
  }


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
        await updateUserProfile({
          displayName: values.fullName,
          email: values.email,
          password: values.password,
          country: values.country,
        });

        toast({
            title: "Profile Updated",
            description: "Your account details have been successfully updated.",
        });
        form.reset({ ...values, password: '' });

    } catch(error: any) {
        toast({
            title: "Update Failed",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-center md:min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md md:shadow-sm">
            <CardHeader className="text-center items-center">
                <div className="relative group">
                    <Avatar className="h-24 w-24 mb-4 cursor-pointer" onClick={handleAvatarClick}>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                        <AvatarFallback className="text-3xl">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleAvatarClick}>
                        <Edit2 className="h-8 w-8 text-white"/>
                    </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                        accept="image/png, image/jpeg"
                    />
                </div>
                <CardTitle>{user.displayName || 'My Account'}</CardTitle>
                <CardDescription>View and manage your account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                            <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="Leave blank to keep current" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {countries.map(country => (
                                        <SelectItem key={country} value={country}>{country}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" className="w-full" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 border-t pt-6 mt-2">
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-xs break-all text-muted-foreground">{user.uid}</p>
                <Button onClick={handleSignOut} variant="outline" className="w-full !mt-4">Sign Out</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
