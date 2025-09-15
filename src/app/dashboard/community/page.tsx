'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, PlusCircle, ThumbsUp, Users } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useLocalization } from "@/context/localization-context";

const initialDiscussions = [
  { id: 1, title: 'Best pesticide for wheat rust?', author: 'Ramesh K.', avatar: 'https://picsum.photos/seed/user1/40', replies: 5, likes: 10, tag: 'Wheat', time: '2 hours ago', comments: [{ id: 1, author: 'Sita D.', text: 'I found that propiconazole works well.', avatar: 'https://picsum.photos/seed/user2/40'}] },
  { id: 2, title: 'Question about monsoon soil preparation', author: 'Sita D.', avatar: 'https://picsum.photos/seed/user2/40', replies: 12, likes: 25, tag: 'Soil', time: '1 day ago', comments: [] },
  { id: 3, title: 'Sharing my success with organic farming in Punjab', author: 'Balwinder S.', avatar: 'https://picsum.photos/seed/user3/40', replies: 28, likes: 50, tag: 'Organic', time: '3 days ago', comments: [] },
  { id: 4, title: 'Low yield on my cotton crop, any advice?', author: 'Priya M.', avatar: 'https://picsum.photos/seed/user4/40', replies: 8, likes: 15, tag: 'Cotton', time: '5 days ago', comments: [] },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const { translate } = useLocalization();

  const handleLike = (id: number) => {
    setDiscussions(discussions.map(d => d.id === id ? { ...d, likes: d.likes + 1 } : d));
  };

  const handleCommentChange = (id: number, text: string) => {
    setCommentInputs({...commentInputs, [id]: text});
  };

  const handleAddComment = (id: number) => {
    const text = commentInputs[id];
    if (!text || !user) return;
    
    const newComment = {
      id: Date.now(),
      author: user.name,
      text: text,
      avatar: 'https://picsum.photos/seed/avatar/100'
    };

    setDiscussions(discussions.map(d => {
      if (d.id === id) {
        return { ...d, comments: [...d.comments, newComment], replies: d.replies + 1 };
      }
      return d;
    }));

    setCommentInputs({...commentInputs, [id]: ''});
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline flex items-center gap-3"><Users className="text-primary" />{translate('communityForum', 'Community Forum')}</h1>
          <p className="text-muted-foreground">{translate('communitySubtitle', 'Connect with fellow farmers, share knowledge, and grow together.')}</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> {translate('startDiscussion', 'Start Discussion')}
        </Button>
      </div>

      <div className="space-y-4">
        {discussions.map((d) => (
          <Card key={d.id}>
            <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={d.avatar} data-ai-hint="person face" />
                    <AvatarFallback>{d.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link href="#" className="font-semibold text-lg hover:underline">{d.title}</Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{d.author}</span>
                      <span>&middot;</span>
                      <span>{d.time}</span>
                    </div>
                     <Badge variant="secondary" className="mt-2">{d.tag}</Badge>
                  </div>
                   <div className="flex items-center gap-4 text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={() => handleLike(d.id)} className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{d.likes}</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{d.replies}</span>
                    </div>
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {d.comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.avatar} data-ai-hint="person face" />
                                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{comment.author}</p>
                                <p className="text-sm text-muted-foreground">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/avatar/100" data-ai-hint="person face" />
                            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Input 
                            placeholder={translate('addComment', 'Add a comment...')}
                            value={commentInputs[d.id] || ''}
                            onChange={(e) => handleCommentChange(d.id, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(d.id)}
                        />
                        <Button size="sm" onClick={() => handleAddComment(d.id)}>{translate('comment', 'Comment')}</Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
