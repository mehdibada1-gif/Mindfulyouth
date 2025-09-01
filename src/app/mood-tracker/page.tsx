'use client';

import { useState, useEffect } from 'react';
import { Frown, Laugh, Meh, Smile, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

const moods = [
  { name: 'Awful', icon: Frown },
  { name: 'Okay', icon: Meh },
  { name: 'Good', icon: Smile },
  { name: 'Great', icon: Laugh },
];

interface MoodEntry {
  id: string;
  mood: string;
  journal: string;
  timestamp: Timestamp;
}

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>('Good');
  const [journalEntry, setJournalEntry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pastEntries, setPastEntries] = useState<MoodEntry[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'moodEntries'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries: MoodEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          mood: data.mood,
          journal: data.journal,
          timestamp: data.timestamp,
        });
      });
      setPastEntries(entries);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveEntry = async () => {
    if (!selectedMood || !user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'moodEntries'), {
        userId: user.uid,
        mood: selectedMood,
        journal: journalEntry,
        timestamp: serverTimestamp(),
      });
      setJournalEntry('');
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return 'Just now';
    return format(timestamp.toDate(), "MMMM d, yyyy");
  }
  
  const checkinStreak = pastEntries.length > 0 ? (
    (new Date().getTime() - pastEntries[0].timestamp.toDate().getTime()) / (1000 * 3600 * 24) < 2 ? pastEntries.length : 1
  ) : 0;


  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>Track your mood to understand your emotional patterns.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-2">
            <div className="flex justify-around w-full max-w-md">
              {moods.map((mood) => {
                const MoodIcon = mood.icon;
                return (
                  <button
                    key={mood.name}
                    onClick={() => setSelectedMood(mood.name)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200",
                      selectedMood === mood.name ? 'scale-110' : 'hover:bg-accent/50'
                    )}
                    aria-pressed={selectedMood === mood.name}
                  >
                    <MoodIcon className={cn("w-12 h-12", selectedMood === mood.name ? 'text-primary' : 'text-muted-foreground/60')} />
                    <span className={cn("text-sm font-medium", selectedMood === mood.name ? 'text-primary' : 'text-muted-foreground')}>{mood.name}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Daily Journal</CardTitle>
                <CardDescription>Reflect on your day. What's on your mind?</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea 
                    placeholder="Write about your thoughts and feelings..." 
                    className="min-h-[150px]"
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    disabled={isSaving}
                />
                <Button className="mt-4" onClick={handleSaveEntry} disabled={isSaving || !selectedMood}>
                    {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="text-yellow-400 fill-yellow-400"/>
                    Check-in Streak
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-6xl font-bold">{checkinStreak}</p>
                <p className="text-muted-foreground">days in a row!</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Past Entries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {pastEntries.map(entry => {
                    const mood = moods.find(m => m.name === entry.mood);
                    const MoodIcon = mood?.icon || Smile;
                    return (
                        <div key={entry.id} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <MoodIcon className="w-6 h-6 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">{formatTimestamp(entry.timestamp)}</p>
                            </div>
                            <p className="text-sm text-muted-foreground border-l-2 pl-4">{entry.journal}</p>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
