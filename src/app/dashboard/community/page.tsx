
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, PlusCircle, ThumbsUp, Users, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useLocalization } from "@/context/localization-context";
import { useCommunity, Discussion, TranslatedContent } from "@/context/community-context";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function CommunityPage() {
  const { user } = useAuth();
  const { translate, language } = useLocalization();
  const { discussions, addDiscussion, addComment, toggleLike, deleteDiscussion, editDiscussion, deleteComment, editComment, isPending } = useCommunity();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionTag, setNewDiscussionTag] = useState('');
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  
  // State for editing
  const [editingDiscussion, setEditingDiscussion] = useState<(Discussion & { originalTitle: string; }) | null>(null);
  const [editingComment, setEditingComment] = useState<{discussionId: string; commentIndex: number; text: string} | null>(null);

  // State for delete confirmation
  const [discussionToDelete, setDiscussionToDelete] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<{discussionId: string, commentIndex: number} | null>(null);
  
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

  const handleSaveEditDiscussion = () => {
    if(!editingDiscussion) return;
    editDiscussion(editingDiscussion.id, editingDiscussion.originalTitle, editingDiscussion.tag);
    setEditingDiscussion(null);
  }

  const handleSaveEditComment = () => {
    if(!editingComment) return;
    editComment(editingComment.discussionId, editingComment.commentIndex, editingComment.text);
    setEditingComment(null);
  }
  
  const getTranslatedContent = (content: TranslatedContent) => {
      return content[language] || content.en;
  }

  return (
    <div className="space-y-6">
        {/* Delete Discussion Dialog */}
        <AlertDialog open={!!discussionToDelete} onOpenChange={(open) => !open && setDiscussionToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this discussion.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDiscussionToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        if (discussionToDelete) {
                            deleteDiscussion(discussionToDelete);
                            setDiscussionToDelete(null);
                        }
                    }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Delete Comment Dialog */}
        <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this comment.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCommentToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        if (commentToDelete) {
                            deleteComment(commentToDelete.discussionId, commentToDelete.commentIndex);
                            setCommentToDelete(null);
                        }
                    }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>


      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline flex items-center gap-3"><Users className="text-primary" />{translate('communityForum', 'Community Forum')}</h1>
          <p className="text-muted-foreground">{translate('communitySubtitle', 'Connect with fellow farmers, share knowledge, and grow together.')}</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} disabled={isPending}>
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
              <Button onClick={handleStartDiscussion} disabled={isPending || !newDiscussionTitle}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Discussion
              </Button>
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
                    <AvatarImage src={d.authorAvatar ?? undefined} />
                    <AvatarFallback>{d.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {editingDiscussion?.id === d.id ? (
                        <div className="space-y-2">
                           <Input value={editingDiscussion.originalTitle} onChange={(e) => setEditingDiscussion({...editingDiscussion, originalTitle: e.target.value})}/>
                           <Input value={editingDiscussion.tag} onChange={(e) => setEditingDiscussion({...editingDiscussion, tag: e.target.value || ''})}/>
                           <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEditDiscussion} disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingDiscussion(null)}>Cancel</Button>
                           </div>
                        </div>
                    ) : (
                        <>
                           <p className="font-semibold text-lg">{getTranslatedContent(d.title)}</p>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>{d.authorName}</span>
                            <span>&middot;</span>
                            <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                           </div>
                           {d.tag && <Badge variant="secondary" className="mt-2">{d.tag}</Badge>}
                        </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={() => user && toggleLike(d.id, user.uid)} className="flex items-center gap-1">
                        <ThumbsUp className={`h-4 w-4 ${d.likes.includes(user?.uid || '') ? 'text-primary fill-primary' : ''}`} />
                        <span>{d.likes.length}</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{d.comments.length}</span>
                    </div>
                     {user?.email === d.authorEmail && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setEditingDiscussion({...d, originalTitle: d.title.en})}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDiscussionToDelete(d.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {d.comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.authorAvatar ?? undefined} />
                                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-sm">{comment.authorName}</p>
                                  {user?.email === comment.authorEmail && (
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreVertical className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => setEditingComment({discussionId: d.id, commentIndex: index, text: getTranslatedContent(comment.text)})}>
                                                <Edit className="mr-2 h-4 w-4"/>
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setCommentToDelete({discussionId: d.id, commentIndex: index})} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                                {editingComment?.discussionId === d.id && editingComment?.commentIndex === index ? (
                                    <div className="mt-1 space-y-2">
                                        <Textarea value={editingComment.text} onChange={(e) => setEditingComment({...editingComment, text: e.target.value})} className="text-sm"/>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleSaveEditComment} disabled={isPending}>
                                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{getTranslatedContent(comment.text)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL ?? undefined} />
                            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Input 
                            placeholder={translate('addComment', 'Add a comment...')}
                            value={commentInputs[d.id] || ''}
                            onChange={(e) => setCommentInputs({...commentInputs, [d.id]: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(d.id)}
                            disabled={!user || isPending}
                        />
                        <Button size="sm" onClick={() => handleAddComment(d.id)} disabled={!user || !commentInputs[d.id] || isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {translate('comment', 'Comment')}
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
