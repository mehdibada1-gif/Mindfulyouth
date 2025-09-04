
'use client';

import { useState, useEffect } from 'react';
import { Frown, Laugh, Meh, Smile, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const moods = [
  { name: 'Awful', icon: Frown, color: 'text-red-500', bgColor: 'hover:bg-red-100/50', selectedBg: 'bg-red-100/50' },
  { name: 'Okay', icon: Meh, color: 'text-orange-500', bgColor: 'hover:bg-orange-100/50', selectedBg: 'bg-orange-100/50' },
  { name: 'Good', icon: Smile, color: 'text-yellow-500', bgColor: 'hover:bg-yellow-100/50', selectedBg: 'bg-yellow-100/50' },
  { name: 'Great', icon: Laugh, color: 'text-green-500', bgColor: 'hover:bg-green-100/50', selectedBg: 'bg-green-100/50' },
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
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Today's Check-in</CardTitle>
                <CardDescription>Select your mood and optionally add a journal entry to reflect on your day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">How are you feeling today?</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {moods.map((mood) => {
                        const MoodIcon = mood.icon;
                        const isSelected = selectedMood === mood.name;
                        return (
                        <button
                            key={mood.name}
                            onClick={() => setSelectedMood(mood.name)}
                            className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200",
                             isSelected ? `border-primary ${mood.selectedBg}` : `border-transparent bg-card hover:bg-accent/50`,
                             'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                            )}
                            aria-pressed={selectedMood === mood.name}
                        >
                            <MoodIcon className={cn("w-10 h-10", isSelected ? 'text-primary' : 'text-muted-foreground/60')} />
                            <span className={cn("text-sm font-semibold", isSelected ? 'text-primary' : 'text-muted-foreground')}>{mood.name}</span>
                        </button>
                        )
                    })}
                    </div>
                </div>
                 <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Daily Journal (optional)</p>
                    <Textarea 
                        placeholder="Reflect on your day. What's on your mind?" 
                        className="min-h-[120px]"
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        disabled={isSaving}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSaveEntry} disabled={isSaving || !selectedMood}>
                    {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
            </CardFooter>
        </Card>
      
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">
                    Check-in Streak
                </CardTitle>
                <Star className="text-yellow-400 fill-yellow-400 h-6 w-6"/>
            </CardHeader>
            <CardContent className="text-center py-6">
                <p className="text-6xl font-bold">{checkinStreak}</p>
                <p className="text-muted-foreground">days in a row!</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Past Entries</CardTitle>
                 <CardDescription>A log of your recent check-ins.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[450px] overflow-y-auto">
                {pastEntries.length > 0 ? pastEntries.map((entry, index) => {
                    const mood = moods.find(m => m.name === entry.mood);
                    const MoodIcon = mood?.icon || Smile;
                    return (
                        <div key={entry.id}>
                            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50">
                                <div className="flex flex-col items-center mt-1">
                                    <MoodIcon className={cn("w-6 h-6", mood?.color)} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground font-semibold">{formatTimestamp(entry.timestamp)}</p>
                                    <p className="text-sm text-foreground">{entry.journal || <span className="italic text-muted-foreground">No journal entry.</span>}</p>
                                </div>
                            </div>
                            {index < pastEntries.length -1 && <Separator />}
                        </div>
                    )
                }) : (
                    <p className="text-sm text-muted-foreground text-center py-8">You have no past entries yet.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
