
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  writeBatch,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
    userId: string;
}

export interface ChatSession {
    id:string;
    userId: string;
    createdAt: Timestamp;
    messages: ChatMessage[];
    name?: string;
}

export type NewMessage = Omit<ChatMessage, 'id' | 'timestamp'>;


// Create a new chat session for a user
export const createChatSession = async (userId: string): Promise<ChatSession> => {
    const docRef = await addDoc(collection(db, 'chats'), {
        userId,
        createdAt: serverTimestamp(),
    });
    return { id: docRef.id, userId, createdAt: Timestamp.now(), messages: [] };
};

// Add a message to a specific chat session
export const addMessageToChat = async (chatId: string, message: { role: 'user' | 'assistant', content: string, userId: string }) => {
    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesCollectionRef, {
        ...message,
        timestamp: serverTimestamp(),
    });
};

// Rename a chat session
export const renameChatSession = async (chatId: string, newName:string) => {
    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
        name: newName,
    });
};

// Get all chat sessions for a user, with the most recent messages for each
export const getUserChatSessions = async (userId: string): Promise<ChatSession[]> => {
    const q = query(
        collection(db, 'chats'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const sessions: ChatSession[] = [];
    
    for (const doc of querySnapshot.docs) {
        const messagesQuery = query(
            collection(db, 'chats', doc.id, 'messages'),
            orderBy('timestamp', 'asc'),
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(msgDoc => ({ id: msgDoc.id, ...msgDoc.data() } as ChatMessage));
        
        sessions.push({
            id: doc.id,
            userId: doc.data().userId,
            createdAt: doc.data().createdAt,
            messages: messages,
            name: doc.data().name,
        });
    }
    
    return sessions;
};

// Delete a chat session and all its messages
export const deleteChatSession = async (chatId: string) => {
    const batch = writeBatch(db);

    // Delete all messages in the subcollection
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    messagesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // Delete the chat session document itself
    const chatDocRef = doc(db, 'chats', chatId);
    batch.delete(chatDocRef);

    await batch.commit();
};
