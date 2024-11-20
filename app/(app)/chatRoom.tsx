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
        backgroundColor: '#FAFAFA', // Dark background for the chat screen
    },
    innerContainer: {
        flex: 1,
        backgroundColor: '#e3e3e3', // Matches the theme
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: hp(1),
        fontSize: hp(2),
        color: '#AAA', // Subtle gray for loading text
    },
    messageList: {
        paddingHorizontal: wp(2),
        paddingVertical: hp(2),
    },
    inputWrapper: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#2A2A2A', // Slightly lighter black for input bar area
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: hp(0),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E', // Match with the theme for a unified look
        borderRadius: 40, // Fully rounded input
        paddingHorizontal: wp(4),
        height: hp(6.5),
        borderColor: '#333', // Subtle border for contrast
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        color: '#FFF', // White text for readability
        marginRight: wp(2),
        paddingVertical: 0, // Remove excess padding for better alignment
    },
    sendButton: {
        backgroundColor: '#3E3E3E', // Modern green for the send button
        width: hp(4.5),
        height: hp(4.5),
        borderRadius: hp(2.75), // Perfectly circular button
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: wp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
});



