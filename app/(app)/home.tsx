    import {
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    AppStateStatus,
    AppState,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {Feather, MaterialIcons} from '@expo/vector-icons';
import ChatList from '../../components/ChatList';
import {
    getDocs, query, collection, QuerySnapshot, DocumentData, where, doc, setDoc, updateDoc
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { ref, set, onDisconnect } from 'firebase/database';
import Ionicons from "@expo/vector-icons/Ionicons";

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    [key: string]: any;
}

export default function Home() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    useEffect(() => {
        if (user?.userId) {
            fetchUsersWithChatHistory();
            setUserPresence(user.userId); // Set the user online when they enter the app
        }

        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            console.log("AppState change detected:", nextAppState); // Debugging line to see the state

            if (nextAppState === 'active') {
                // Set user online when app becomes active
                 setUserPresence(user.userId);
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                // Delay offline update to allow async calls to complete before backgrounding
                setTimeout(() => {
                 setUserOffline(user.userId);
                }, 100); // Adjust delay if needed for testing
            }

            // Update the appState to track current state
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [user?.userId, appState]);

    const setUserPresence = async (userId: string) => {
        const userStatusDocRef = doc(db, 'presence', userId);

        // Set user status to online
        await setDoc(userStatusDocRef, {
            state: 'online',
            lastSeen: Date.now(),
        }, { merge: true }); // Merge ensures only specific fields are updated
    };

    const setUserOffline = async (userId: string) => {
        const userStatusDocRef = doc(db, 'presence', userId);

        // Set the user status to offline directly
        await updateDoc(userStatusDocRef, {
            state: 'offline',
            lastSeen: Date.now(),
        });
    };

    const fetchUsersWithChatHistory = async (): Promise<void> => {
        try {
            const roomsRef = collection(db, 'rooms');
            const roomSnapshot = await getDocs(roomsRef);

            const relevantRoomIds: string[] = roomSnapshot.docs
                .map((doc) => doc.id) // Extract room IDs
                .filter((roomId) => roomId.includes(user?.userId || '')); // Filter rooms that contain current user's ID

            const otherUserIds = new Set<string>();

            // Extract the other user ID from each relevant room ID
            relevantRoomIds.forEach((roomId) => {
                const participants = roomId.split('-');
                const otherUserId = participants.find((id) => id !== user?.userId);
                if (otherUserId) otherUserIds.add(otherUserId);
            });

            if (otherUserIds.size === 0) {
                console.log('No other users found.');
                setUsers([]);
                return;
            }

            // Fetch details of all other participants
            const usersQuery = query(
                collection(db, 'users'),
                where('userId', 'in', Array.from(otherUserIds))
            );
            const usersSnapshot = await getDocs(usersQuery);

            const usersWithHistory = usersSnapshot.docs.map((doc) => doc.data() as User);
            setUsers(usersWithHistory);
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
        backgroundColor: '#017B6B',
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
