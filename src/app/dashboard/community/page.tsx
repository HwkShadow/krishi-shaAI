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
import { useCommunity } from "@/context/community-context";
import { Textarea } from "@/components/ui/textarea";

export default function CommunityPage() {
  const { user } = useAuth();
  const { translate } = useLocalization();
  const { discussions, addDiscussion, addComment, toggleLike } = useCommunity();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionTag, setNewDiscussionTag] = useState('');
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  const handleAddComment = (discussionId: string) => {
    const text = commentInputs[discussionId];
    if (!text || !user) return;
    
    addComment(discussionId, text);
    setCommentInputs({...commentInputs, [discussionId]: ''});
  };

  const handleStartDiscussion = () => {
    if (!newDiscussionTitle || !user) return;
    addDiscussion({
      title: newDiscussionTitle,
      tag: newDiscussionTag,
    });
    setNewDiscussionTitle('');
    setNewDiscussionTag('');
    setIsCreating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline flex items-center gap-3"><Users className="text-primary" />{translate('communityForum', 'Community Forum')}</h1>
          <p className="text-muted-foreground">{translate('communitySubtitle', 'Connect with fellow farmers, share knowledge, and grow together.')}</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <PlusCircle className="mr-2 h-4 w-4" /> 
          {isCreating ? translate('cancel', 'Cancel') : translate('startDiscussion', 'Start Discussion')}
        </Button>
      </div>
      
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="What's on your mind?"
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
            />
             <Input 
              placeholder="Add a tag (e.g., Wheat, Soil)"
              value={newDiscussionTag}
              onChange={(e) => setNewDiscussionTag(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleStartDiscussion}>Post Discussion</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {discussions.map((d) => (
          <Card key={d.id}>
            <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={d.authorAvatar} data-ai-hint="person face" />
                    <AvatarFallback>{d.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{d.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{d.authorName}</span>
                      <span>&middot;</span>
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                     {d.tag && <Badge variant="secondary" className="mt-2">{d.tag}</Badge>}
                  </div>
                   <div className="flex items-center gap-4 text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={() => user && toggleLike(d.id, user.email)} className="flex items-center gap-1">
                        <ThumbsUp className={`h-4 w-4 ${d.likes.includes(user?.email || '') ? 'text-primary fill-primary' : ''}`} />
                        <span>{d.likes.length}</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{d.comments.length}</span>
                    </div>
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {d.comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.authorAvatar} data-ai-hint="person face" />
                                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{comment.authorName}</p>
                                <p className="text-sm text-muted-foreground">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://picsum.photos/seed/${user?.email}/40`} data-ai-hint="person face" />
                            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Input 
                            placeholder={translate('addComment', 'Add a comment...')}
                            value={commentInputs[d.id] || ''}
                            onChange={(e) => setCommentInputs({...commentInputs, [d.id]: e.target.value})}
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
