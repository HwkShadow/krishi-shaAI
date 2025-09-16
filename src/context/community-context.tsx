
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";
import { translateText } from "@/ai/flows/translate-text-flow";
import { 
    getDiscussions, 
    addDiscussionToFirestore, 
    addCommentToFirestore,
    toggleLikeInFirestore,
    deleteDiscussionFromFirestore,
    updateDiscussionInFirestore,
    deleteCommentFromFirestore,
    updateCommentInFirestore,
} from "@/lib/firebase";

export type TranslatedContent = {
  en: string;
  hi: string;
  ml: string;
}

export type Comment = {
  authorName: string;
  authorEmail: string;
  authorAvatar: string | null;
  text: TranslatedContent;
  createdAt: string;
};

export type Discussion = {
  id: string;
  title: TranslatedContent;
  authorName: string;
  authorEmail: string;
  authorAvatar: string | null;
  createdAt: string;
  tag?: string;
  comments: Comment[];
  likes: string[]; // Array of user emails/uids
};

type CommunityContextType = {
  discussions: Discussion[];
  addDiscussion: (data: { title: string; tag?: string }) => void;
  addComment: (discussionId: string, text: string) => void;
  toggleLike: (discussionId: string, userId: string) => void;
  deleteDiscussion: (discussionId: string) => void;
  editDiscussion: (discussionId: string, newTitle: string, newTag?: string) => void;
  deleteComment: (discussionId: string, commentIndex: number) => void;
  editComment: (discussionId: string, commentIndex: number, newText: string) => void;
  isPending: boolean;
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const unsubscribe = getDiscussions((discussionsFromDb) => {
        setDiscussions(discussionsFromDb as Discussion[]);
    });

    return () => unsubscribe();
  }, []);

  const addDiscussion = async (data: { title: string; tag?: string }) => {
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to post." });
      return;
    }
    setIsPending(true);
    try {
      const translatedTitle = await translateText({ text: data.title });

      const newDiscussion = {
        title: {
          en: translatedTitle.en,
          hi: translatedTitle.hi,
          ml: translatedTitle.ml,
        },
        authorName: user.name,
        authorEmail: user.email,
        authorAvatar: user.photoURL ?? `https://picsum.photos/seed/${user.email}/40`,
        createdAt: new Date().toISOString(),
        tag: data.tag,
        comments: [],
        likes: [],
      };
      await addDiscussionToFirestore(newDiscussion);
      toast({ title: "Discussion started successfully!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error starting discussion." });
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const addComment = async (discussionId: string, text: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to comment." });
      return;
    }
    setIsPending(true);

    try {
        const translatedText = await translateText({ text });
        const newComment: Comment = {
            authorName: user.name,
            authorEmail: user.email,
            authorAvatar: user.photoURL ?? `https://picsum.photos/seed/${user.email}/40`,
            text: {
                en: translatedText.en,
                hi: translatedText.hi,
                ml: translatedText.ml,
            },
            createdAt: new Date().toISOString(),
        };
        await addCommentToFirestore(discussionId, newComment);

    } catch (error) {
        toast({ variant: "destructive", title: "Error adding comment."});
        console.error(error);
    } finally {
        setIsPending(false);
    }
  };

  const toggleLike = async (discussionId: string, userId: string) => {
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to like posts." });
      return;
    }
    const discussion = discussions.find(d => d.id === discussionId);
    if (!discussion) return;
    
    const isLiked = discussion.likes.includes(userId);
    await toggleLikeInFirestore(discussionId, userId, isLiked);
  };

  const deleteDiscussion = async (discussionId: string) => {
      await deleteDiscussionFromFirestore(discussionId);
      toast({ title: "Discussion deleted."});
  }

  const editDiscussion = async (discussionId: string, newTitle: string, newTag?: string) => {
      setIsPending(true);
      try {
        const translatedTitle = await translateText({ text: newTitle });
        
        await updateDiscussionInFirestore(discussionId, {
             title: {
                en: translatedTitle.en,
                hi: translatedTitle.hi,
                ml: translatedTitle.ml,
            },
            tag: newTag || ""
        });
        
        toast({ title: "Discussion updated."});
      } catch (error) {
        toast({ variant: "destructive", title: "Error updating discussion."});
        console.error(error);
      } finally {
        setIsPending(false);
      }
  }

  const deleteComment = async (discussionId: string, commentIndex: number) => {
    const discussion = discussions.find(d => d.id === discussionId);
    if (!discussion) return;
    
    const commentToDelete = discussion.comments[commentIndex];
    await deleteCommentFromFirestore(discussionId, commentToDelete);
    toast({ title: "Comment deleted." });
  };
  
  const editComment = async (discussionId: string, commentIndex: number, newText: string) => {
    setIsPending(true);
    const discussion = discussions.find(d => d.id === discussionId);
    if (!discussion) {
        setIsPending(false);
        return;
    };
    
    const oldComment = discussion.comments[commentIndex];

    try {
        const translatedText = await translateText({ text: newText });

        const newComment = {
            ...oldComment,
            text: {
                en: translatedText.en,
                hi: translatedText.hi,
                ml: translatedText.ml,
            }
        };

        await updateCommentInFirestore(discussionId, oldComment, newComment);
        
        toast({ title: "Comment updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error updating comment." });
      console.error(error);
    } finally {
        setIsPending(false);
    }
  };


  return (
    <CommunityContext.Provider value={{ discussions, addDiscussion, addComment, toggleLike, deleteDiscussion, editDiscussion, deleteComment, editComment, isPending }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
}
