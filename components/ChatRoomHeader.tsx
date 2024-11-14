import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Assuming you have a firebaseConfig file

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    lastSeen?: Date;
}

interface ChatRoomHeaderProps {
    user: User;
}

export default function ChatRoomHeader({ user }: ChatRoomHeaderProps) {
    const router = useRouter();
    const [isOnline, setIsOnline] = useState<boolean | null>(null); // `null` if not found, `true` for online, `false` for offline
    const [lastSeen, setLastSeen] = useState<Date | null>(user.lastSeen || null);

    useEffect(() => {
        if (!user?.userId) return;

        const userStatusRef = doc(db, 'presence', user.userId);

        const unsubscribe = onSnapshot(userStatusRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setIsOnline(data.state === 'online');
                setLastSeen(data.lastSeen ? new Date(data.lastSeen) : null);
            } else {
                setIsOnline(null); // No presence data available
            }
        });

        return () => unsubscribe();
    }, [user.userId]);

    const getLastSeenText = (): string | null => {
        if (isOnline === null) return null; // If no presence data, show nothing
        if (isOnline) return 'Online';
        if (lastSeen) return `Last seen ${format(lastSeen, 'EEE, MMM d')} at ${format(lastSeen, 'p')}`;
        return 'Last seen recently';
    };

    return (
        <Stack.Screen
            options={{
                title: '',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#017B6B' },
                headerLeft: () => (
                    <View style={styles.leftContainer}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Entypo name="chevron-left" size={hp(4)} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.userInfo}>
                            <Image
                                source={user?.profileUrl}
                                style={styles.profileImage}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.username}>{user?.username}</Text>
                                {getLastSeenText() && (
                                    <Text style={styles.lastSeenText}>
                                        {getLastSeenText()}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                ),
                headerRight: () => (
                    <View style={styles.rightContainer}>
                        <Ionicons name="call" size={hp(2.8)} color="#FFFFFF" />
                        <Ionicons name="videocam" size={hp(2.8)} color="#FFFFFF" />
                    </View>
                ),
            }}
        />
    );
}

const styles = StyleSheet.create({
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
    },
    profileImage: {
        height: hp(4.5),
        aspectRatio: 1,
        borderRadius: 100,
    },
    textContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    username: {
        fontSize: hp(2),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    lastSeenText: {
        fontSize: hp(1.6),
        color: '#FFFFFF',
        marginTop: hp(0.3),
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
    },
});
