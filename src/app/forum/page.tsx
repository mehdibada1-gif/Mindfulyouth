
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ThumbsUp, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, writeBatch, deleteDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/hooks/use-user';
import Link from 'next/link';
import { cn } from '@/lib/utils';


interface Post {
    id: string;
    author: string;
    content: string;
    timestamp: Timestamp;
    likes: number;
    comments: number;
    userId: string;
    likedBy: string[];
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
                    likedBy: data.likedBy || []
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
                likedBy: [],
            });
            setNewPostContent('');
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!user) return;
        
        const postRef = doc(db, "posts", postId);
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const userHasLiked = post.likedBy.includes(user.uid);
        
        try {
            const batch = writeBatch(db);
            batch.update(postRef, {
                likes: increment(userHasLiked ? -1 : 1),
                likedBy: userHasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
            await batch.commit();

        } catch (error) {
            console.error("Error liking post: ", error);
        }
    };

    const handleDelete = async (postId: string) => {
        // Note: This is a simple deletion. For production, you might want to
        // add confirmation dialogs and handle subcollections (comments) deletion,
        // possibly with a Cloud Function.
        try {
            await deleteDoc(doc(db, "posts", postId));
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    }


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
            {posts.map(post => {
                 const userHasLiked = user ? post.likedBy.includes(user.uid) : false;
                 const isAuthor = user ? user.uid === post.userId : false;
                 return (
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
                        {isAuthor && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(post.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground"/>
                                <span className="sr-only">Delete Post</span>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                         <Link href={`/forum/${post.id}`}>
                            <p className="text-sm line-clamp-3 hover:text-primary/80 cursor-pointer">{post.content}</p>
                        </Link>
                    </CardContent>
                    <CardFooter className="flex items-center gap-6 border-t pt-4 mt-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn("flex items-center gap-2", userHasLiked ? "text-primary" : "text-muted-foreground hover:text-primary")}
                            onClick={() => handleLike(post.id)}
                            disabled={!user}
                        >
                            <ThumbsUp className="h-4 w-4"/>
                            <span>{post.likes}</span>
                        </Button>
                         <Link href={`/forum/${post.id}`}>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                                <MessageCircle className="h-4 w-4"/>
                                <span>{post.comments} Comments</span>
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            )})}
        </div>
    </div>
  );
}
