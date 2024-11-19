import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from "@/firebaseConfig";
import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore';

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean | undefined;

    login: (email: string, password: string) => Promise<{ success: boolean; msg?: string }>;
    register: (
        email: string,
        password: string,
        username: string,
        profileUrl: string
    ) => Promise<{ success: boolean; data?: User; msg?: string }>;
    logout: () => Promise<{ success: boolean; msg?: string; error?: unknown }>;
    refreshUser: () => Promise<{ success: boolean; data?: User; msg?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const mappedUser = await mapFirebaseUserToCustomUser(firebaseUser);
                setUser(mappedUser);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        });

        return unsub;
    }, []);

    const mapFirebaseUserToCustomUser = async (firebaseUser: FirebaseUser): Promise<User> => {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        let userData: User = {
            userId: firebaseUser.uid,
            username: firebaseUser.email ?? 'Unknown',
            profileUrl: '',
        };

        if (docSnap.exists()) {
            const data = docSnap.data();
            userData = {
                ...userData,
                username: data.username,
                profileUrl: data.profileUrl,
            };
        }

        return userData;
    };

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (e: any) {
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
            if (msg.includes('(auth/invalid-credential)')) msg = 'Wrong credentials';
            return { success: false, msg };
        }
    };


    const logout = async () => {
        try {
            if (!user || !user.userId) {
                throw new Error("User is not authenticated.");
            }

            // Reference to the presence document
            const userStatusDocRef = doc(db, 'presence', user.userId);

            // Set the user's status to offline and update lastSeen

            // Proceed with signing the user out
            await signOut(auth);
            await updateDoc(userStatusDocRef, {
                state: 'offline',
                lastSeen: Date.now(),
            });


            // Clear the user state in your context
            setUser(null);

            return { success: true };
        } catch (e: any) {
            console.error('Logout Error:', e);
            return { success: false, msg: e.message, error: e };
        }
    };
    const refreshUser = async () => {
        if (!user || !user.userId) {
            console.error("User is not authenticated or userId is missing.");
            return { success: false, msg: "User not authenticated" };
        }

        try {
            const docRef = doc(db, 'users', user.userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const updatedUser: User = {
                    userId: user.userId,
                    username: data.username || user.username,
                    profileUrl: data.profileUrl || user.profileUrl,
                    ...data,
                };

                setUser(updatedUser); // Update the user state
                return { success: true, data: updatedUser };
            } else {
                console.error('User document not found in Firestore.');
                return { success: false, msg: 'User not found' };
            }
        } catch (e: any) {
            console.error('Error refreshing user data:', e);
            return { success: false, msg: e.message };
        }
    };


    const register = async (
        email: string,
        password: string,
        username: string,
        profileUrl: string
    ) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const newUser: User = {
                userId: response.user.uid,
                username,
                profileUrl,
            };
            await setDoc(doc(db, "users", newUser.userId), newUser);
            return { success: true, data: newUser };
        } catch (e: any) {
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
            if (msg.includes('(auth/email-already-in-use)')) msg = 'This email is already in use';
            return { success: false, msg };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};
