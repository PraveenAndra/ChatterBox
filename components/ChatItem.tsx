import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { blurhash, formatDate, getRoomId } from '@/utils/common';
import { collection, doc, onSnapshot, orderBy, query, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Router } from 'expo-router';
import {useChat} from "@/context/chatContext";

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

    useEffect(() => {
        const roomId = getRoomId(currentUser?.userId, item?.userId);
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
        setSelectedUser(item);
        router.push({ pathname: '/chatRoom', params: item });
    };

    const renderTime = (): string | undefined => {
        if (lastMessage) {
            const date = lastMessage.createdAt;
            return formatDate(new Date(date.seconds * 1000));
        }
    };

    const renderLastMessage = (): string => {
        if (typeof lastMessage === 'undefined') return 'Loading...';
        if (lastMessage) {
            return currentUser.userId === lastMessage.userId ? `You: ${lastMessage.text}` : lastMessage.text;
        } else {
            return 'Say Hi 👋';
        }
    };

    return (
        <TouchableOpacity
            onPress={openChatRoom}
            className={`flex-row justify-between mx-4 items-center gap-3 mb-4 pb-2 ${noBorder ? '' : 'border-b border-b-neutral-200'}`}
        >
            <Image
                style={{ height: hp(6), width: hp(6), borderRadius: 100 }}
                source={item.profileUrl}
                placeholder={blurhash}
                transition={500}
            />

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
    );
}
