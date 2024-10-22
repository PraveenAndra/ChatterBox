import {
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {Feather, MaterialIcons} from '@expo/vector-icons';
import ChatList from '../../components/ChatList';
import {
    getDocs, query, collection, QuerySnapshot, DocumentData, where
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
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

    useEffect(() => {
        if (user?.userId) fetchUsersWithChatHistory();
    }, [user?.userId]);

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
