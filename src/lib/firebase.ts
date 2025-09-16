import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    doc, 
    updateDoc,
    arrayUnion,
    arrayRemove,
    query,
    orderBy,
    onSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const discussionsCollection = collection(db, "discussions");

export const getDiscussions = (callback: (discussions: any[]) => void) => {
    const q = query(discussionsCollection, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const discussions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(discussions);
    });
};

export const addDiscussionToFirestore = async (discussion: any) => {
    return await addDoc(discussionsCollection, discussion);
}

export const addCommentToFirestore = async (discussionId: string, comment: any) => {
    const discussionRef = doc(db, "discussions", discussionId);
    return await updateDoc(discussionRef, {
        comments: arrayUnion(comment)
    });
}

export const toggleLikeInFirestore = async (discussionId: string, userId: string, isLiked: boolean) => {
    const discussionRef = doc(db, "discussions", discussionId);
    return await updateDoc(discussionRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
}

export { db };
