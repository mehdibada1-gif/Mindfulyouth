
'use client';

import { aiAnonymizedSupportChat, type AiAnonymizedSupportChatInput } from '@/ai/flows/ai-anonymized-support-chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bot, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useChat } from '@/hooks/use-chat';
import type { DisplayMessage } from '@/context/chat-provider';


// Custom hook for the typing effect
const useTypingEffect = (message: DisplayMessage) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const typingSpeed = 20;

    useEffect(() => {
        if (message.role === 'assistant' && !message.isSaving) {
            setDisplayedContent('');
            let charIndex = 0;
            const intervalId = setInterval(() => {
                setDisplayedContent((prev) => prev + message.content.charAt(charIndex));
                charIndex++;
                if (charIndex >= message.content.length) {
                    clearInterval(intervalId);
                }
            }, typingSpeed);

            return () => clearInterval(intervalId);
        }
    }, [message.content, message.role, message.isSaving]);

    if (message.role === 'user' || message.isSaving) {
        return message.content;
    }
    return displayedContent;
};


const ChatMessage = ({ message }: { message: DisplayMessage }) => {
    const displayedContent = useTypingEffect(message);

    return (
       <div
            className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
            >
            {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 shrink-0 border">
                <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                </AvatarFallback>
                </Avatar>
            )}
            <div
                className={cn(
                'max-w-[80%] rounded-lg p-3 text-sm shadow-sm whitespace-pre-wrap',
                message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none',
                message.isSaving && 'opacity-50'
                )}
            >
                {displayedContent}
                 {message.role === 'assistant' && !message.isSaving && displayedContent.length < message.content.length && (
                    <span className="animate-pulse">▍</span>
                )}
            </div>
            {message.role === 'user' && (
                <Avatar className="h-8 w-8 shrink-0 border">
                <AvatarFallback>
                    <User className="h-5 w-5" />
                </AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}

export function ChatInterface() {
  const [inputValue, setInputValue] = useState('');
  const { user } = useUser();
  const { messages, activeChatId, isLoading, addMessage, createNewChat } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setTimeout(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, 100);
  }, [messages]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    let currentChatId = activeChatId;

    // If there's no active chat, create one and wait for it to be set
    if (!currentChatId) {
        currentChatId = await createNewChat();
    }

    const userMessageContent = inputValue;
    setInputValue('');

    await addMessage({ role: 'user', content: userMessageContent });
  
    const currentMessages = messages;

    // The user message is now in the context, let's prepare the history for the API
     const chatHistoryForApi = [...currentMessages, { id: 'temp', role: 'user', content: userMessageContent }]
        .filter(m => m.id !== 'initial') // Exclude initial message
        .map(msg => ({
            role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
            content: msg.content,
        }));


    try {
        const input: AiAnonymizedSupportChatInput = {
            message: userMessageContent,
            chatHistory: chatHistoryForApi.slice(0,-1),
        };

        const result = await aiAnonymizedSupportChat(input);
        await addMessage({ role: 'assistant', content: result.response });

    } catch (error) {
        console.error('AI chat failed:', error);
        await addMessage({ role: 'assistant', content: "I'm having a little trouble connecting right now. Please try again in a moment." });
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-card rounded-lg shadow-sm border">
      <div className="flex items-center p-3 border-b justify-center relative">
            <h2 className="text-lg font-semibold">Support Chat</h2>
        </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && messages[messages.length-1]?.role === 'user' && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8 shrink-0 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              <div className="max-w-md rounded-lg p-3 text-sm shadow-sm bg-muted flex items-center space-x-2">
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
            disabled={isLoading || !user}
            className="text-base"
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim() || !user}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
