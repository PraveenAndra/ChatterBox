import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { format } from 'date-fns';

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    lastSeen?: Date; // New field for last seen
}

interface ChatRoomHeaderProps {
    user: User;
}

export default function ChatRoomHeader({ user }: ChatRoomHeaderProps) {
    const router = useRouter();

    const getLastSeenText = (lastSeen: Date | undefined): string => {
        if (!lastSeen) return 'Last seen recently'; // Default message if no timestamp
        return `Last seen ${format(lastSeen, 'EEE, MMM d')} at ${format(lastSeen, 'p')}`; // e.g., Sun, Oct 22 at 3:39 PM
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
                                <Text style={styles.lastSeenText}>
                                    {getLastSeenText(user?.lastSeen)}
                                </Text>
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
        color: '#FFFFFF', // White text for better contrast
    },
    lastSeenText: {
        fontSize: hp(1.6),
        color: '#FFFFFF', // Light white text
        marginTop: hp(0.3),
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
    },
});
