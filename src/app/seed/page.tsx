
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { useState } from 'react';

const samplePosts = [
    {
        author: 'Anonymous',
        content: 'Just a reminder to everyone to take a moment for yourself today. Even 5 minutes of deep breathing can make a difference. #SelfCare',
        likes: 15,
        comments: 3,
        userId: 'sample_user_1',
    },
    {
        author: 'Anonymous',
        content: 'Feeling a bit overwhelmed with school lately. It\'s tough but trying to stay positive. Any tips for managing stress during exam season?',
        likes: 8,
        comments: 5,
        userId: 'sample_user_2',
    },
    {
        author: 'Anonymous',
        content: 'I\'m here if anyone needs to talk. Remember you are not alone in this. We are a community that supports each other.',
        likes: 22,
        comments: 1,
        userId: 'sample_user_3',
    }
];

const sampleMoods = [
    { mood: 'Good', journal: 'Felt productive today. Finished my assignments and had a nice chat with a friend.', daysAgo: 1, userId: 'sample_user_1' },
    { mood: 'Okay', journal: 'A bit stressed about exams, but I managed to study for a few hours.', daysAgo: 2, userId: 'sample_user_1' },
    { mood: 'Great', journal: 'Had a relaxing day, watched a movie and just chilled.', daysAgo: 3, userId: 'sample_user_2' },
    { mood: 'Awful', journal: 'Feeling down today. Nothing seems to be going right.', daysAgo: 1, userId: 'sample_user_2' },
];


export default function SeedPage() {
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
                    journal: mood.journal,
                    timestamp: entryDate,
                    userId: mood.userId,
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
                    <CardTitle>Seed Database</CardTitle>
                    <CardDescription>
                        Populate your Firestore database with sample data to see how the app works.
                        This will add sample posts to the forum and past entries to the mood tracker.
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
