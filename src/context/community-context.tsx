
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";
import { translateText } from "@/ai/flows/translate-text-flow";

export type TranslatedContent = {
  en: string;
  hi: string;
  ml: string;
}

export type Comment = {
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  text: TranslatedContent;
  createdAt: string;
};

export type Discussion = {
  id: string;
  title: TranslatedContent;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
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

const initialDiscussions: Discussion[] = [
    {
        id: '1',
        title: { en: 'Best pesticide for wheat rust?', hi: 'गेहूं के रस्ट के लिए सबसे अच्छा कीटनाशक कौन सा है?', ml: 'ഗോതമ്പ് തുരുമ്പിന് ഏറ്റവും നല്ല കീടനാശിനി ഏതാണ്?' },
        authorName: 'Ramesh Kumar',
        authorEmail: 'ramesh@example.com',
        authorAvatar: 'https://picsum.photos/seed/ramesh/40',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tag: 'Wheat',
        comments: [],
        likes: ['sita@example.com']
    },
    {
        id: '2',
        title: { en: 'Question about monsoon soil preparation', hi: 'मानसून मिट्टी की तैयारी के बारे में प्रश्न', ml: 'മൺസൂൺ മണ്ണ് ഒരുക്കുന്നതിനെക്കുറിച്ചുള്ള ചോദ്യം' },
        authorName: 'Sita Devi',
        authorEmail: 'sita@example.com',
        authorAvatar: 'https://picsum.photos/seed/sita/40',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        tag: 'Soil',
        comments: [
            {
                authorName: 'Ramesh Kumar',
                authorEmail: 'ramesh@example.com',
                authorAvatar: 'https://picsum.photos/seed/ramesh/40',
                text: { en: 'Good question! I am also interested.', hi: 'अच्छा सवाल! मुझे भी दिलचस्पी है।', ml: 'നല്ല ചോദ്യം! എനിക്കും താല്പര്യമുണ്ട്.' },
                createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
            }
        ],
        likes: ['ramesh@example.com', 'priya@example.com']
    }
];


const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [isPending, setIsPending] = useState(false);

  const addDiscussion = async (data: { title: string; tag?: string }) => {
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to post." });
      return;
    }
    setIsPending(true);
    try {
      const translatedTitle = await translateText({ text: data.title });

      const newDiscussion: Discussion = {
        id: Date.now().toString(),
        title: {
          en: translatedTitle.en,
          hi: translatedTitle.hi,
          ml: translatedTitle.ml,
        },
        authorName: user.name,
        authorEmail: user.email,
        authorAvatar: `https://picsum.photos/seed/${user.email}/40`,
        createdAt: new Date().toISOString(),
        tag: data.tag,
        comments: [],
        likes: [],
      };
      setDiscussions(prev => [newDiscussion, ...prev]);
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
            authorAvatar: `https://picsum.photos/seed/${user.email}/40`,
            text: {
                en: translatedText.en,
                hi: translatedText.hi,
                ml: translatedText.ml,
            },
            createdAt: new Date().toISOString(),
        };
        
        setDiscussions(prev => prev.map(d => 
            d.id === discussionId ? { ...d, comments: [...d.comments, newComment] } : d
        ));

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
    
    setDiscussions(prev => prev.map(d => {
        if (d.id === discussionId) {
            const isLiked = d.likes.includes(userId);
            const newLikes = isLiked ? d.likes.filter(id => id !== userId) : [...d.likes, userId];
            return { ...d, likes: newLikes };
        }
        return d;
    }));
  };

  const deleteDiscussion = async (discussionId: string) => {
      setDiscussions(prev => prev.filter(d => d.id !== discussionId));
      toast({ title: "Discussion deleted."});
  }

  const editDiscussion = async (discussionId: string, newTitle: string, newTag?: string) => {
      setIsPending(true);
      try {
        const translatedTitle = await translateText({ text: newTitle });
        
        setDiscussions(prev => prev.map(d => {
            if (d.id === discussionId) {
                return {
                    ...d,
                    title: {
                        en: translatedTitle.en,
                        hi: translatedTitle.hi,
                        ml: translatedTitle.ml,
                    },
                    tag: newTag
                }
            }
            return d;
        }));
        
        toast({ title: "Discussion updated."});
      } catch (error) {
        toast({ variant: "destructive", title: "Error updating discussion."});
        console.error(error);
      } finally {
        setIsPending(false);
      }
  }

  const deleteComment = async (discussionId: string, commentIndex: number) => {
    setDiscussions(prev => prev.map(d => {
        if (d.id === discussionId) {
            const updatedComments = [...d.comments];
            updatedComments.splice(commentIndex, 1);
            return { ...d, comments: updatedComments };
        }
        return d;
    }));
    toast({ title: "Comment deleted." });
  };
  
  const editComment = async (discussionId: string, commentIndex: number, newText: string) => {
    setIsPending(true);
    try {
        const translatedText = await translateText({ text: newText });

        setDiscussions(prev => prev.map(d => {
            if (d.id === discussionId) {
                const updatedComments = [...d.comments];
                const oldComment = updatedComments[commentIndex];
                updatedComments[commentIndex] = {
                    ...oldComment,
                    text: {
                        en: translatedText.en,
                        hi: translatedText.hi,
                        ml: translatedText.ml,
                    }
                };
                return { ...d, comments: updatedComments };
            }
            return d;
        }));
        
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
