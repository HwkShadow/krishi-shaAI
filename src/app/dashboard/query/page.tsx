
'use client';
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Bot, Mic, Paperclip, Send, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { localizedQueryResponse, LocalizedQueryResponseOutput } from '@/ai/flows/localized-query-response';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useLocalization } from '@/context/localization-context';
import Image from 'next/image';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  imageUrl?: string;
};

export default function QueryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const { translate } = useLocalization();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select an image file.',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const toDataURL = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSend = async () => {
    if (!input.trim() && !imageFile) return;

    const userMessage: Message = { 
        id: Date.now().toString(), 
        text: input, 
        sender: 'user',
        imageUrl: imagePreview || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    removeImage();
    setIsLoading(true);

    try {
        const location = user?.location || "India";
        
        let photoDataUri: string | undefined;
        if(imageFile) {
            photoDataUri = await toDataURL(imageFile);
        }

        const result: LocalizedQueryResponseOutput = await localizedQueryResponse({ 
            query: input, 
            location,
            photoDataUri 
        });
        
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
            title: translate('error', "Error"),
            description: translate('failedToGetResponse', "Failed to get a response. Please try again.")
        });
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
            <Bot className="text-primary"/> {translate('askKrishiSahai', 'AI Assistant')}
        </CardTitle>
        <CardDescription>
            {translate('askAnything', 'Your AI farming assistant. Ask anything in any language.')}
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
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md rounded-lg px-3 py-2',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.imageUrl && (
                    <Image src={message.imageUrl} alt="User upload" width={300} height={200} className="rounded-md mb-2" />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                 {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarImage src={user?.photoURL ?? undefined} />
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
        <div className="border-t pt-4">
            {imagePreview && (
                <div className="relative w-24 h-24 mb-2">
                    <Image src={imagePreview} alt="Image preview" layout="fill" className="rounded-md object-cover" />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeImage}
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => toast({ title: translate('voiceInputComingSoon', "Voice input coming soon!")})}>
                    <Mic className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                />
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    placeholder={translate('typeYourQuestion', "Type your question here...")}
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !imageFile)}>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
