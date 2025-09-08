
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@/hooks/use-user';
import { addMessageToChat, createChatSession, deleteChatSession, getUserChatSessions, renameChatSession, type ChatSession, type ChatMessage as FirestoreChatMessage } from '@/lib/firestore-chat-service';
import { Timestamp } from 'firebase/firestore';

export type DisplayMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isSaving?: boolean;
};

export type NewDisplayMessage = Omit<DisplayMessage, 'id'>;

interface ChatContextType {
    chatSessions: ChatSession[];
    activeChatId: string | null;
    messages: DisplayMessage[];
    isLoading: boolean;
    loadChat: (chatId: string) => void;
    createNewChat: () => Promise<string>;
    deleteChat: (chatId: string) => void;
    addMessage: (message: NewDisplayMessage) => Promise<void>;
    renameChat: (chatId: string, newName: string) => Promise<void>;
    getSessionTitle: (session: ChatSession) => string;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialMessage: DisplayMessage = {
    id: 'initial',
    role: 'assistant',
    content: "Hello! I'm here to listen and support you. How are you feeling today?"
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<DisplayMessage[]>([initialMessage]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getUserChatSessions(user.uid).then(sessions => {
                setChatSessions(sessions);
                if (sessions.length > 0) {
                    loadChat(sessions[0].id, sessions);
                } else {
                    setMessages([initialMessage]);
                    setActiveChatId(null);
                }
                setIsLoading(false);
            });
        } else {
            // Reset state when user logs out
            setChatSessions([]);
            setActiveChatId(null);
            setMessages([initialMessage]);
        }
    }, [user]);

    const loadChat = (chatId: string, currentSessions?: ChatSession[]) => {
        const sessions = currentSessions || chatSessions;
        const session = sessions.find(s => s.id === chatId);
        if (session) {
            setActiveChatId(session.id);
            const displayMessages = session.messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
            }));
            setMessages(displayMessages.length > 0 ? displayMessages : [initialMessage]);
        }
    };

    const addMessage = async (message: NewDisplayMessage) => {
        if (!user || !activeChatId) return;

        const tempId = Date.now().toString();
        const displayMessage: DisplayMessage = { ...message, id: tempId, isSaving: true };
        
        // Optimistically update the UI
        setMessages(prev => (prev.length === 1 && prev[0].id === 'initial') ? [displayMessage] : [...prev, displayMessage]);
        
        setIsLoading(true);
        try {
            await addMessageToChat(activeChatId, { role: message.role, content: message.content, userId: user.uid });
            
            // After successful save, update the message to remove saving state
            // A full refetch would be better in a real app, but this is simpler
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isSaving: false } : m));
            
            // Update the session in the state as well
            setChatSessions(prevSessions => {
                return prevSessions.map(session => {
                    if (session.id === activeChatId) {
                         const newFirestoreMessage: FirestoreChatMessage = {
                             id: 'new-id-from-firestore', // In a real app, you'd get this back
                             role: message.role,
                             content: message.content,
                             timestamp: Timestamp.now(),
                             userId: user.uid
                         }
                        return {
                            ...session,
                            messages: [...session.messages, newFirestoreMessage]
                        };
                    }
                    return session;
                });
            });

        } catch (error) {
            console.error("Failed to save message:", error);
            // Optionally handle the error, e.g., show a toast
             setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setIsLoading(false);
        }
    };
    
    const createNewChat = async (): Promise<string> => {
        if (!user) throw new Error("User not authenticated");
        setIsLoading(true);
        const newSession = await createChatSession(user.uid);
        setChatSessions(prev => [newSession, ...prev]);
        setActiveChatId(newSession.id);
        setMessages([initialMessage]);
        setIsLoading(false);
        return newSession.id;
    };

    const deleteChat = async (chatId: string) => {
        if (!user) return;
        await deleteChatSession(chatId);
        const newSessions = chatSessions.filter(s => s.id !== chatId);
        setChatSessions(newSessions);

        if (activeChatId === chatId) {
            if (newSessions.length > 0) {
                loadChat(newSessions[0].id, newSessions);
            } else {
                setActiveChatId(null);
                setMessages([initialMessage]);
            }
        }
    };

    const renameChat = async (chatId: string, newName: string) => {
        if (!user) return;
        // Optimistically update UI
        setChatSessions(prev => prev.map(s => s.id === chatId ? { ...s, name: newName } : s));
        await renameChatSession(chatId, newName);
    };

    const getSessionTitle = (session: ChatSession) => {
        if (session.name) {
            return session.name;
        }
        const firstUserMessage = session.messages.find(m => m.role === 'user');
        return firstUserMessage?.content.substring(0, 35) || 'New Conversation';
    };


    return (
        <ChatContext.Provider value={{ chatSessions, activeChatId, messages, isLoading, loadChat, createNewChat, deleteChat, addMessage, renameChat, getSessionTitle }}>
            {children}
        </ChatContext.Provider>
    );
};
