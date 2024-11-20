import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const insets = useSafeAreaInsets();
    const [isOnline, setIsOnline] = useState<boolean | null>(null);
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
                setIsOnline(null);
            }
        });

        return () => unsubscribe();
    }, [user.userId]);

    const getLastSeenText = (): string | null => {
        if (isOnline === null) return null;
        if (isOnline) return 'Online';
        if (lastSeen) return `Last seen ${format(lastSeen, 'MMM d')} at ${format(lastSeen, 'p')}`;
        return 'Last seen recently';
    };

    return (
        <View style={[styles.header, { paddingTop: insets.top+10 }]}>
            {/* Left Section */}
            <View style={styles.leftContainer}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/home', params: { refresh: 'true' } })} style={styles.backButton}>
                    <Entypo name="chevron-left" size={hp(3)} color="#FFFFFF" />
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

            {/* Right Section */}
            <View style={styles.rightContainer}>
                {/*<TouchableOpacity style={styles.iconButton}>*/}
                {/*    <Ionicons name="call" size={hp(2.8)} color="#FFFFFF" />*/}
                {/*</TouchableOpacity>*/}
                {/*<TouchableOpacity style={styles.iconButton}>*/}
                {/*    <Ionicons name="videocam" size={hp(2.8)} color="#FFFFFF" />*/}
                {/*</TouchableOpacity>*/}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E1E',
        // paddingHorizontal: wp(0.5),
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: hp(1), // Add touchable area for the back button
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: wp(1.5),
    },
    profileImage: {
        height: hp(5),
        width: hp(5),
        borderRadius: hp(2.5),
        backgroundColor: '#444', // Placeholder color for missing images
    },
    textContainer: {
        marginLeft: wp(2),
    },
    username: {
        fontSize: hp(2),
        fontWeight: '700',
        color: '#FFFFFF',
    },
    lastSeenText: {
        fontSize: hp(1.25),
        color: '#AAA',
        marginTop: hp(0.2),
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: wp(-2),
    },
    iconButton: {
        marginLeft: wp(3), // Spacing between icons
        padding: hp(1), // Add touchable area for icons
    },
});
