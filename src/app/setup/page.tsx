
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { useState } from 'react';

const samplePosts = [
    {
        author: 'WellnessWarrior',
        content: 'Just a reminder to everyone to take a moment for yourself today. Even 5 minutes of deep breathing can make a difference. #SelfCare',
        likes: 15,
        comments: 3,
    },
    {
        author: 'HopefulSoul',
        content: 'Feeling a bit overwhelmed with school lately. It\'s tough but trying to stay positive. Any tips for managing stress during exam season?',
        likes: 8,
        comments: 5,
    },
    {
        author: 'Listener22',
        content: 'I\'m here if anyone needs to talk. Remember you are not alone in this. We are a community that supports each other.',
        likes: 22,
        comments: 1,
    }
];

const sampleMoods = [
    { mood: 'Good', entry: 'Felt productive today. Finished my assignments and had a nice chat with a friend.', daysAgo: 1 },
    { mood: 'Okay', entry: 'A bit stressed about exams, but I managed to study for a few hours.', daysAgo: 2 },
    { mood: 'Good', entry: 'Had a relaxing day, watched a movie and just chilled.', daysAgo: 3 },
];


export default function SetupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleSeed = async () => {
        setIsLoading(true);
        try {
            const batch = writeBatch(db);

            // Seed posts
            const postsCollection = collection(db, 'posts');
            samplePosts.forEach(post => {
                const docRef = doc(postsCollection);
                batch.set(docRef, { ...post, timestamp: serverTimestamp() });
            });

            // Seed mood entries
            const moodCollection = collection(db, 'moodEntries');
            sampleMoods.forEach(mood => {
                const entryDate = new Date();
                entryDate.setDate(entryDate.getDate() - mood.daysAgo);
                 const docRef = doc(moodCollection);
                batch.set(docRef, { 
                    mood: mood.mood,
                    journal: mood.entry,
                    timestamp: entryDate,
                    userId: 'anonymous' // Using a generic user for now
                });
            });

            await batch.commit();
            setIsDone(true);
        } catch (error) {
            console.error("Error seeding database: ", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Database Setup</CardTitle>
                    <CardDescription>
                        Populate your Firestore database with some sample data to see how the app works.
                        This will add a few posts to the forum and some past entries to the mood tracker.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isDone ? (
                         <div className="text-center p-6 bg-green-100/50 rounded-lg">
                            <p className="font-semibold text-green-700">✅ Done! Your database has been seeded.</p>
                            <p className="text-sm text-muted-foreground mt-2">You can now visit the other pages to see the data.</p>
                        </div>
                    ) : (
                        <Button onClick={handleSeed} disabled={isLoading}>
                            {isLoading ? 'Seeding...' : 'Seed Database'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
