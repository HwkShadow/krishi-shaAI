
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./auth-context";
import { 
    addDiscussionToFirestore, 
    addCommentToFirestore, 
    toggleLikeInFirestore, 
    getDiscussions,
    deleteDiscussionFromFirestore,
    updateDiscussionInFirestore,
    updateCommentInFirestore,
    deleteCommentFromFirestore,
} from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export type Comment = {
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
};

export type Discussion = {
  id: string;
  title: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  createdAt: string;
  tag?: string;
  comments: Comment[];
  likes: string[]; // Array of user emails
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
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  useEffect(() => {
    const unsubscribe = getDiscussions((newDiscussions) => {
      setDiscussions(newDiscussions as Discussion[]);
    });

    return () => unsubscribe();
  }, []);

  const addDiscussion = async (data: { title: string; tag?: string }) => {
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to post." });
      return;
    }
    const newDiscussion = {
      title: data.title,
      authorName: user.name,
      authorEmail: user.email,
      authorAvatar: `https://picsum.photos/seed/${user.email}/40`,
      createdAt: new Date().toISOString(),
      tag: data.tag,
      comments: [],
      likes: [],
    };
    try {
      await addDiscussionToFirestore(newDiscussion);
      toast({ title: "Discussion started successfully!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error starting discussion." });
      console.error(error);
    }
  };

  const addComment = async (discussionId: string, text: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to comment." });
      return;
    }
    const newComment: Comment = {
      authorName: user.name,
      authorEmail: user.email,
      authorAvatar: `https://picsum.photos/seed/${user.email}/40`,
      text,
      createdAt: new Date().toISOString(),
    };

    try {
        await addCommentToFirestore(discussionId, newComment);
    } catch (error) {
        toast({ variant: "destructive", title: "Error adding comment."});
        console.error(error);
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

    try {
        await toggleLikeInFirestore(discussionId, userId, isLiked);
    } catch(error) {
        toast({ variant: "destructive", title: "Error updating like."});
        console.error(error);
    }
  };

  const deleteDiscussion = async (discussionId: string) => {
      try {
        await deleteDiscussionFromFirestore(discussionId);
        toast({ title: "Discussion deleted."});
      } catch (error) {
        toast({ variant: "destructive", title: "Error deleting discussion."});
        console.error(error);
      }
  }

  const editDiscussion = async (discussionId: string, newTitle: string, newTag?: string) => {
      try {
        await updateDiscussionInFirestore(discussionId, {title: newTitle, tag: newTag});
        toast({ title: "Discussion updated."});
      } catch (error) {
        toast({ variant: "destructive", title: "Error updating discussion."});
        console.error(error);
      }
  }

  const deleteComment = async (discussionId: string, commentIndex: number) => {
    const discussion = discussions.find(d => d.id === discussionId);
    if(!discussion) return;
    const commentToDelete = discussion.comments[commentIndex];
    try {
      await deleteCommentFromFirestore(discussionId, commentToDelete);
      toast({ title: "Comment deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error deleting comment." });
      console.error(error);
    }
  };
  
  const editComment = async (discussionId: string, commentIndex: number, newText: string) => {
    const discussion = discussions.find(d => d.id === discussionId);
    if (!discussion) return;
  
    const updatedComments = [...discussion.comments];
    const oldComment = updatedComments[commentIndex];
    updatedComments[commentIndex] = { ...oldComment, text: newText };
  
    try {
      await updateCommentInFirestore(discussionId, updatedComments);
      toast({ title: "Comment updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error updating comment." });
      console.error(error);
    }
  };


  return (
    <CommunityContext.Provider value={{ discussions, addDiscussion, addComment, toggleLike, deleteDiscussion, editDiscussion, deleteComment, editComment }}>
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
