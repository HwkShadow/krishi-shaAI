'use client';
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, MessageSquare, Mic, Paperclip, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { localizedQueryResponse, LocalizedQueryResponseOutput } from '@/ai/flows/localized-query-response';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

export default function QueryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const location = user?.location || "India";
        const result: LocalizedQueryResponseOutput = await localizedQueryResponse({ query: input, location });
        
        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: result.response,
            sender: 'ai',
        };
        setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
        console.error("Error fetching AI response:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get a response. Please try again."
        });
        // Optionally add an error message to the chat
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I couldn't process your request right now. Please try again later.",
            sender: 'ai',
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <MessageSquare className="text-primary"/> Ask Krishi SahAI
        </CardTitle>
        <CardDescription>
            Your AI farming assistant. Ask anything in any language.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md rounded-lg px-4 py-2',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                 {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://picsum.photos/seed/avatar/100" data-ai-hint="person face" />
                    <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs lg:max-w-md rounded-lg px-4 py-2 bg-muted flex items-center">
                       <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 border-t pt-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => toast({ title: "Voice input coming soon!"})}>
            <Mic className="h-5 w-5" />
          </Button>
           <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => toast({ title: "Image upload coming soon!"})}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Type your question here..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
