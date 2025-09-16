
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./auth-context";
import { addDiscussionToFirestore, addCommentToFirestore, toggleLikeInFirestore, getDiscussions } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export type Comment = {
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
};

export type Discussion = {
  id: string;
  title: string;
  authorName: string;
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


  return (
    <CommunityContext.Provider value={{ discussions, addDiscussion, addComment, toggleLike }}>
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
