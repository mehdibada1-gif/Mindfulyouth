
'use client';

import { Button } from '@/components/ui/button';
import { HeartPulse, BotMessageSquare, Users, Smile, Library } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl">MindfulYouth</span>
        </div>
        <Link href="/login">
            <Button variant="outline">Login</Button>
        </Link>
      </header>

      <main className="flex-1">
        <section className="text-center pt-16 pb-12 px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">A Safe Space for Your Mind</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            MindfulYouth is here to provide anonymous, AI-powered emotional support, peer connections, and valuable resources to help you navigate life's challenges.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup">
                <Button size="lg">Get Started for Free</Button>
            </Link>
          </div>
        </section>

        <section className="py-12 bg-card border-y">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <BotMessageSquare className="w-6 h-6 text-primary"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">AI Support Chat</h3>
                                <p className="text-muted-foreground">Talk about what's on your mind with our friendly AI assistant, available 24/7.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Users className="w-6 h-6 text-primary"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Peer Forum</h3>
                                <p className="text-muted-foreground">Connect with others who understand, share experiences, and find community.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Smile className="w-6 h-6 text-primary"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Mood Tracker</h3>
                                <p className="text-muted-foreground">Understand your emotions and see your progress over time with our simple journal.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-12 bg-background border-b">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.
                        </p>
                    </div>
                    <div className="flex justify-center md:justify-start">
                        <Image
                            src="https://dare4.masterpeace.org/wp-content/uploads/sites/19/2024/03/EN-Co-Funded-by-the-EU_PANTONE-1536x322.png"
                            alt="Co-funded by the EU logo"
                            width={450}
                            height={94}
                            className="object-contain"
                            data-ai-hint="eu funding logo"
                        />
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-muted">
        <div className="container mx-auto py-8 px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} MindfulYouth. All rights reserved.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Image
                src="https://dare4.masterpeace.org/wp-content/uploads/sites/19/2024/03/dare4-logos.png"
                alt="Dare4 logos"
                width={300}
                height={63}
                className="object-contain"
                data-ai-hint="sponsor logos"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
