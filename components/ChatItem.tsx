import React, { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet, Alert} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { blurhash, formatDate, getRoomId } from '@/utils/common';
import { collection, doc, onSnapshot, orderBy, query, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Router } from 'expo-router';
import { useChat } from '@/context/chatContext';
import { Ionicons } from '@expo/vector-icons';

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    [key: string]: any;
}

interface Message {
    createdAt: { seconds: number; nanoseconds: number };
    text: string;
    userId: string;
}

interface ChatItemProps {
    item: User;
    router: Router;
    noBorder: boolean;
    currentUser: User | null;
}

export default function ChatItem({ item, router, noBorder, currentUser }: ChatItemProps) {
    const { setSelectedUser } = useChat();
    const [lastMessage, setLastMessage] = useState<Message | null | undefined>(undefined);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Modal state

    useEffect(() => {
        // Ensure `currentUser` is not null before proceeding
        if (!currentUser?.userId) {
            console.warn('No currentUser available.');
            return;
        }

        const roomId = getRoomId(currentUser.userId, item?.userId);
        const docRef = doc(db, 'rooms', roomId);
        const messagesRef = collection(docRef, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const allMessages = snapshot.docs.map((doc) => doc.data() as Message);
            setLastMessage(allMessages[0] || null);
        });

        return unsubscribe;
    }, [currentUser, item]);

    const openChatRoom = () => {
        if (!currentUser) {
            Alert.alert('Error', 'You must be signed in to access this chat.');
            return;
        }

        setSelectedUser(item);
        router.push({ pathname: '/chatRoom', params: item });
    };

    const openProfileImage = () => {
        setIsModalVisible(true);
    };

    const closeProfileImage = () => {
        setIsModalVisible(false);
    };

    const renderTime = (): string | undefined => {
        if (lastMessage) {
            const date = lastMessage.createdAt;
            return formatDate(new Date(date.seconds * 1000));
        }
    };

    const renderLastMessage = (): string => {
        if (!currentUser) return '';
        if (typeof lastMessage === 'undefined') return 'Loading...';
        if (lastMessage) {
            return currentUser.userId === lastMessage.userId ? `You: ${lastMessage.text}` : lastMessage.text;
        } else {
            return 'Say Hi 👋';
        }
    };

    return (
        <View className="flex-row mx-4 items-center gap-3 mb-4">
            {/* Profile Image Touchable */}
            <TouchableOpacity onPress={openProfileImage}>
                <Image
                    style={{ height: hp(6), width: hp(6), borderRadius: 100 }}
                    source={item.profileUrl}
                    placeholder={blurhash}
                    transition={500}
                />
            </TouchableOpacity>

            {/* Main Chat Item Touchable */}
            <TouchableOpacity
                onPress={openChatRoom}
                style={[
                    styles.chatItemContainer,
                    !noBorder && styles.chatItemWithBorder, // Apply border style only if noBorder is false
                ]}
            >
                <View className="flex-1 gap-1">
                    <View className="flex-row justify-between">
                        <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-neutral-800">
                            {item.username}
                        </Text>
                        <Text style={{ fontSize: hp(1.6) }} className="font-medium text-neutral-500">
                            {renderTime()}
                        </Text>
                    </View>
                    <Text style={{ fontSize: hp(1.6) }} className="font-medium text-neutral-500">
                        {renderLastMessage()}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Modal for Enlarged Profile Picture */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeProfileImage}
            >
                <View style={styles.modalBackground}>
                    {/* Close button in the top-right corner */}
                    <TouchableOpacity style={styles.closeButton} onPress={closeProfileImage}>
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Profile picture enlargement */}
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.enlargedImage}
                            source={item.profileUrl}
                            placeholder={blurhash}
                            transition={500}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    imageContainer: {
        width: '50%',
        height: '50%',
        borderRadius: wp(2),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    enlargedImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    chatItemContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10, // Adjust the bottom padding
        gap: 12, // Adjust the gap between elements
    },
    chatItemWithBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#c0bebe', // Dark gray color for the border
        paddingBottom: 15, // Add padding above the border
        marginTop: 10, // Ensure there's spacing above the border
    },
});
