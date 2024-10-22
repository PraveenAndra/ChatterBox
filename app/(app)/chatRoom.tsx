import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StyleSheet,
    Text,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ChatRoomHeader from '../../components/ChatRoomHeader';
import MessageList from '../../components/MessageList';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/authContext';
import { getRoomId } from '@/utils/common';
import { db } from '@/firebaseConfig';
import {
    Timestamp,
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    getDoc,
} from 'firebase/firestore';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface Message {
    userId: string;
    text: string;
    profileUrl?: string;
    senderName: string;
    createdAt: Timestamp;
}

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
}

export default function ChatRoom() {
    const { userId, username, profileUrl } = useLocalSearchParams<{ userId: string; username: string; profileUrl?: string }>(); // Extract params directly

    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const textRef = useRef<string>('');
    const inputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (currentUser && userId) {
            setLoading(true);
            createRoomIfNotExists();
            subscribeToMessages();
        }

        const keyboardListener = Keyboard.addListener('keyboardDidShow', updateScrollView);
        return () => keyboardListener.remove();
    }, [currentUser, userId]);

    const createRoomIfNotExists = async () => {
        const roomId = getRoomId(currentUser?.userId, userId);
        const roomRef = doc(db, 'rooms', roomId);

        try {
            const roomSnap = await getDoc(roomRef);
            if (!roomSnap.exists()) {
                await setDoc(roomRef, { roomId, createdAt: Timestamp.fromDate(new Date()) });
            }
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const subscribeToMessages = () => {
        const roomId = getRoomId(currentUser?.userId, userId);
        const messagesRef = collection(doc(db, 'rooms', roomId), 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const allMessages = snapshot.docs.map((doc) => doc.data() as Message);
            setMessages(allMessages);
            setLoading(false); // Stop loading after fetching messages
        });
    };

    const updateScrollView = () => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const handleSendMessage = async () => {
        const message = textRef.current.trim();
        if (!message) return;

        try {
            const roomId = getRoomId(currentUser?.userId, userId);
            const messagesRef = collection(doc(db, 'rooms', roomId), 'messages');

            textRef.current = '';
            inputRef.current?.clear();

            await addDoc(messagesRef, {
                userId: currentUser?.userId,
                text: message,
                profileUrl: currentUser?.profileUrl,
                senderName: currentUser?.username,
                createdAt: Timestamp.fromDate(new Date()),
            });
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const otherUser: User = { userId, username, profileUrl }; // Create the user object

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <View style={styles.innerContainer}>
                <StatusBar style="light" />
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#017B6B" />
                        <Text style={styles.loadingText}>Loading chat...</Text>
                    </View>
                ) : (
                    <>
                        <ChatRoomHeader user={otherUser} />
                        <ScrollView
                            ref={scrollViewRef}
                            contentContainerStyle={styles.messageList}
                            showsVerticalScrollIndicator={false}
                        >
                            <MessageList
                                messages={messages}
                                currentUser={currentUser}
                                scrollViewRef={scrollViewRef}
                            />
                        </ScrollView>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    ref={inputRef}
                                    onChangeText={(value) => (textRef.current = value)}
                                    placeholder="Type a message..."
                                    placeholderTextColor="#C7C7C7"
                                    style={styles.input}
                                />
                                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                                    <Feather name="send" size={22} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    innerContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
    messageList: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(1),
    },
    inputWrapper: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.5),
        backgroundColor: '#F7F7F7',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        color: '#333',
        marginRight: wp(2),
    },
    sendButton: {
        backgroundColor: '#017B6B',
        width: hp(4.5),
        height: hp(4.5),
        borderRadius: hp(2.25),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: wp(1),
    },
});
