
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, writeBatch, deleteDoc, getDocs, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, MessageCircle, ThumbsUp, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { arrayRemove, arrayUnion } from 'firebase/firestore';

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

interface Comment {
    id: string;
    author: string;
    content: string;
    timestamp: Timestamp;
    userId: string;
}

export default function PostDetailPage() {
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;

    useEffect(() => {
        if (!postId) return;

        const postRef = doc(db, 'posts', postId);
        
        const unsubscribePost = onSnapshot(postRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPost({
                    id: docSnap.id,
                    author: data.author,
                    content: data.content,
                    timestamp: data.timestamp,
                    likes: data.likes,
                    comments: data.comments,
                    userId: data.userId,
                    likedBy: data.likedBy || [],
                });
            } else {
                console.log("No such document!");
                setPost(null);
            }
            setLoading(false);
        });

        const commentsQuery = query(collection(db, 'posts', postId, 'comments'), orderBy('timestamp', 'asc'));
        const unsubscribeComments = onSnapshot(commentsQuery, (querySnapshot) => {
            const commentsData: Comment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                commentsData.push({
                    id: doc.id,
                    author: data.author,
                    content: data.content,
                    timestamp: data.timestamp,
                    userId: data.userId,
                });
            });
            setComments(commentsData);
        });

        return () => {
            unsubscribePost();
            unsubscribeComments();
        };
    }, [postId]);

    const handleCommentSubmit = async () => {
        if (!newCommentContent.trim() || !user || !post) return;
        setIsPostingComment(true);
        try {
            const postRef = doc(db, 'posts', postId);
            const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
            
            const batch = writeBatch(db);

            // Add the new comment
            const newCommentRef = doc(commentsCollectionRef);
            batch.set(newCommentRef, {
                author: 'Anonymous',
                content: newCommentContent,
                timestamp: serverTimestamp(),
                userId: user.uid,
            });

            // Update the comment count on the post
            batch.update(postRef, {
                comments: increment(1)
            });
            
            await batch.commit();

            setNewCommentContent('');
        } catch (error) {
            console.error("Error adding comment: ", error);
        } finally {
            setIsPostingComment(false);
        }
    };
    
     const handleLike = async () => {
        if (!user || !post) return;
        const postRef = doc(db, 'posts', postId);
        const userHasLiked = post.likedBy.includes(user.uid);
        
        try {
            const batch = writeBatch(db);
            batch.update(postRef, {
                likes: increment(userHasLiked ? -1 : 1),
                likedBy: userHasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
            });
            await batch.commit();
        } catch (error) {
            console.error("Error liking post: ", error);
        }
    };

    const handleDelete = async () => {
        if (!post) return;
        try {
            // First, delete all comments in the subcollection
            const commentsRef = collection(db, 'posts', postId, 'comments');
            const commentsSnapshot = await getDocs(commentsRef);
            const deleteBatch = writeBatch(db);
            commentsSnapshot.forEach(doc => {
                deleteBatch.delete(doc.ref);
            });
            await deleteBatch.commit();

            // Then, delete the post itself
            await deleteDoc(doc(db, 'posts', postId));
            router.push('/forum');
        } catch (error) {
            console.error("Error deleting post and its comments: ", error);
        }
    }

    const formatTimestamp = (timestamp: Timestamp) => {
        if (!timestamp) return 'Just now';
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    };

    if (loading) {
        return <div className="text-center py-10">Loading post...</div>;
    }

    if (!post) {
        return <div className="text-center py-10">Post not found.</div>;
    }
    
    const userHasLiked = user ? post.likedBy.includes(user.uid) : false;
    const isAuthor = user ? user.uid === post.userId : false;

    return (
        <div className="space-y-6">
            <Link href="/forum" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Back to Forum
            </Link>

            <Card>
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
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                </CardContent>
                <CardFooter className="flex items-center gap-6 border-t pt-4 mt-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("flex items-center gap-2", userHasLiked ? "text-primary" : "text-muted-foreground hover:text-primary")}
                        onClick={handleLike}
                        disabled={!user}
                    >
                        <ThumbsUp className="h-4 w-4"/>
                        <span>{post.likes}</span>
                    </Button>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="h-4 w-4"/>
                        <span>{post.comments} Comments</span>
                    </div>
                    {isAuthor && (
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-2 text-red-500/80 hover:text-red-500 ml-auto"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4"/>
                            <span>Delete</span>
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <div className="space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Comments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {comments.length > 0 ? (
                             comments.map((comment, index) => (
                                <div key={comment.id} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-muted/50 rounded-lg p-3">
                                        <div className="flex items-baseline justify-between">
                                            <p className="font-semibold text-sm">{comment.author}</p>
                                            <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                                        </div>
                                        <p className="text-sm text-foreground/80 mt-1">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to reply!</p>
                        )}
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Leave a Comment</CardTitle>
                        <CardDescription>Share your thoughts on this post.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            placeholder="Write your comment here..."
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            disabled={isPostingComment || !user}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleCommentSubmit} disabled={isPostingComment || !newCommentContent.trim() || !user}>
                            {isPostingComment ? 'Posting...' : 'Post Comment'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
