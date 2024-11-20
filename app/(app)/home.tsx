import {
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    AppStateStatus,
    AppState,
    Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import ChatList from '../../components/ChatList';
import {
    getDocs,
    query,
    collection,
    where,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    getDoc,
    orderBy,
    limit,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    [key: string]: any;
    lastInteraction?: number; // Timestamp for sorting
    state?: 'online' | 'offline'; // Online/offline status
}

export default function Home() {
    const { user } = useAuth();
    const router = useRouter();
    const { refresh } = useLocalSearchParams(); // Get `refresh` parameter from URL
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    useEffect(() => {
        if (!user?.userId) {
            Alert.alert('Error', 'User data is missing. Please log in again.');
            return;
        }

        // Fetch users and setup presence updates
        fetchUsersWithChatHistory();
        setUserPresence(user.userId);

        const presenceListener = setupPresenceListener();
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                setUserPresence(user.userId);
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                setUserOffline(user.userId);
            }
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            presenceListener();
        };
    }, [user?.userId]);

    useEffect(() => {
        // Trigger a refresh when the `refresh` parameter changes
        if (refresh) {
            setLoading(true);
            fetchUsersWithChatHistory();
        }
    }, [refresh]);

    const setUserPresence = async (userId: string) => {
        const userStatusDocRef = doc(db, 'presence', userId);

        try {
            await setDoc(
                userStatusDocRef,
                {
                    state: 'online',
                    lastSeen: Date.now(),
                },
                { merge: true }
            );
        } catch (error) {
            console.error('Error setting user presence:', error);
        }
    };

    const setUserOffline = async (userId: string) => {
        const userStatusDocRef = doc(db, 'presence', userId);

        try {
            await updateDoc(userStatusDocRef, {
                state: 'offline',
                lastSeen: Date.now(),
            });
        } catch (error) {
            console.error('Error setting user offline:', error);
        }
    };

    const setupPresenceListener = () => {
        const unsubscribe = onSnapshot(collection(db, 'presence'), (snapshot) => {
            const presenceMap: Record<string, 'online' | 'offline'> = {};
            snapshot.forEach((doc) => {
                const data = doc.data();
                presenceMap[doc.id] = data.state || 'offline';
            });

            // Update the state for the users
            setUsers((prevUsers) =>
                prevUsers.map((u) => ({
                    ...u,
                    state: presenceMap[u.userId] || 'offline',
                }))
            );
        });

        return unsubscribe;
    };

    const fetchUsersWithChatHistory = async (): Promise<void> => {
        if (!user?.userId) return;

        try {
            const roomsRef = collection(db, 'rooms');
            const roomSnapshot = await getDocs(roomsRef);

            const relevantRoomIds: string[] = roomSnapshot.docs
                .map((doc) => doc.id)
                .filter((roomId) => roomId.includes(user.userId));

            const otherUserIds = new Set<string>();

            for (const roomId of relevantRoomIds) {
                const participants = roomId.split('-');
                const otherUserId = participants.find((id) => id !== user.userId);

                if (otherUserId) {
                    const roomDoc = doc(db, 'rooms', roomId);
                    const messagesRef = collection(roomDoc, 'messages');
                    const latestMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
                    const messageSnapshot = await getDocs(latestMessageQuery);

                    if (!messageSnapshot.empty) {
                        const lastMessage = messageSnapshot.docs[0].data();
                        otherUserIds.add(
                            JSON.stringify({ userId: otherUserId, lastInteraction: lastMessage.createdAt.toMillis() })
                        );
                    } else {
                        otherUserIds.add(JSON.stringify({ userId: otherUserId, lastInteraction: 0 }));
                    }
                }
            }

            if (otherUserIds.size === 0) {
                setUsers([]);
                return;
            }

            const sortedUsers: User[] = [];
            for (const userString of otherUserIds) {
                const { userId, lastInteraction } = JSON.parse(userString);
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data() as User;
                    sortedUsers.push({ ...userData, lastInteraction });
                }
            }

            sortedUsers.sort((a, b) => (b.lastInteraction || 0) - (a.lastInteraction || 0));
            setUsers(sortedUsers);
        } catch (error) {
            console.error('Error fetching users with chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        router.push('/addUser');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#017B6B" />
                    <Text style={styles.loadingText}>Loading chats...</Text>
                </View>
            ) : (
                <>
                    <ChatList currentUser={user} users={users} />
                    <TouchableOpacity style={styles.fab} onPress={handleAddUser}>
                        <MaterialIcons name="message" size={28} color="white" />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: hp(1),
        fontSize: hp(2),
        color: '#737373',
    },
    fab: {
        position: 'absolute',
        bottom: hp(4),
        right: wp(4),
        backgroundColor: '#000000',
        width: hp(6),
        height: hp(6),
        borderRadius: hp(3),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
