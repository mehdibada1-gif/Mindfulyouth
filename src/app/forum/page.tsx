'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/hooks/use-user';


interface Post {
    id: string;
    author: string;
    content: string;
    timestamp: Timestamp;
    likes: number;
    comments: number;
    userId: string;
}


export default function ForumPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData: Post[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                postsData.push({ 
                    id: doc.id, 
                    author: data.author,
                    content: data.content,
                    timestamp: data.timestamp,
                    likes: data.likes,
                    comments: data.comments,
                    userId: data.userId,
                });
            });
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, []);

    const handlePostSubmit = async () => {
        if (!newPostContent.trim() || !user) return;
        setIsPosting(true);
        try {
            await addDoc(collection(db, 'posts'), {
                author: 'Anonymous',
                content: newPostContent,
                timestamp: serverTimestamp(),
                likes: 0,
                comments: 0,
                userId: user.uid,
            });
            setNewPostContent('');
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setIsPosting(false);
        }
    };

    const formatTimestamp = (timestamp: Timestamp) => {
        if (!timestamp) return 'Just now';
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Share Your Thoughts</CardTitle>
                <CardDescription>Connect with peers in a safe, moderated space. You are anonymous here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea 
                    placeholder="What's on your mind..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={isPosting || !user}
                />
            </CardContent>
            <CardFooter>
                <Button onClick={handlePostSubmit} disabled={isPosting || !newPostContent.trim() || !user}>
                    {isPosting ? 'Posting...' : 'Post Anonymously'}
                </Button>
            </CardFooter>
        </Card>
        
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Community Conversations</h2>
            {posts.map(post => (
                <Card key={post.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{post.author}</p>
                                <p className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex items-center gap-6 border-t pt-4 mt-4">
                        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <ThumbsUp className="h-4 w-4"/>
                            <span>{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <MessageCircle className="h-4 w-4"/>
                            <span>{post.comments} Comments</span>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
