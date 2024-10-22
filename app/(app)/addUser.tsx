import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Entypo, Feather, AntDesign } from '@expo/vector-icons'; // Added AntDesign for tick icon
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { db } from '@/firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/authContext';
import { getRoomId } from '@/utils/common';

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
}

export default function AddUser() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const insets = useSafeAreaInsets();

    const [searchText, setSearchText] = useState<string>('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null); // Store userId of selected user
    const [loading, setLoading] = useState<boolean>(false);

    const fetchUsers = async (username: string) => {
        if (!username.trim()) {
            setUsers([]);
            return;
        }
        setLoading(true);
        try {
            const q = query(
                collection(db, 'users'),
                where('username', '>=', username),
                where('username', '<=', username + '\uf8ff')
            );
            const querySnapshot = await getDocs(q);
            const fetchedUsers = querySnapshot.docs
                .map((doc) => doc.data() as User)
                .filter((user) => user.userId !== currentUser?.userId);

            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkExistingRoom = async (selectedUser: User) => {
        const roomId = getRoomId(currentUser?.userId, selectedUser.userId);
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
            router.push({ pathname: '/chatRoom', params: { userId: selectedUser.userId } });
        } else {
            await createNewRoom(selectedUser);
            router.push({ pathname: '/chatRoom', params: { userId: selectedUser.userId } });
        }
    };

    const createNewRoom = async (selectedUser: User) => {
        const roomId = getRoomId(currentUser?.userId, selectedUser.userId);
        await setDoc(doc(db, 'rooms', roomId), {
            roomId,
            users: [currentUser?.userId, selectedUser.userId],
            createdAt: new Date(),
        });
    };

    const handleStartChat = () => {
        if (!selectedUser) {
            Alert.alert('Error', 'Please select a user to chat with.');
            return;
        }
        const user = users.find((u) => u.userId === selectedUser);
        if (user) checkExistingRoom(user);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Entypo name="chevron-left" size={hp(3.5)} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Chat</Text>
            </View>

            <View style={styles.innerContainer}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#C7C7C7" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a username"
                        placeholderTextColor="#C7C7C7"
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text);
                            fetchUsers(text);
                        }}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#017B6B" style={styles.loader} />
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.userId}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.userItem}
                                onPress={() =>
                                    setSelectedUser(
                                        selectedUser === item.userId ? null : item.userId
                                    )
                                }
                            >
                                <Image
                                    source={
                                        item.profileUrl
                                            ? { uri: item.profileUrl }
                                            : require('../../assets/images/avatar.png')
                                    }
                                    style={styles.userAvatar}
                                />
                                <View style={styles.userInfo}>
                                    <Text style={styles.username}>{item.username}</Text>
                                    <Text style={styles.subText}>Tap to select</Text>
                                </View>
                                {selectedUser === item.userId && (
                                    <AntDesign name="checkcircle" size={24} color="#017B6B" />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                )}

                <TouchableOpacity
                    style={[
                        styles.startChatButton,
                        !selectedUser && { backgroundColor: '#A5A5A5' },
                    ]}
                    onPress={handleStartChat}
                    disabled={!selectedUser}
                >
                    <Text style={styles.buttonText}>Start Chat</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingBottom: 15,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingBottom: 10,
        backgroundColor: '#017B6B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    headerTitle: {
        marginLeft: wp(4),
        fontSize: hp(2),
        fontWeight: '500',
        color: '#FFF',
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: wp(5),
        marginTop: hp(2),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderColor: '#E0E0E0',
        borderWidth: 1,
        marginBottom: hp(2),
        elevation: 2,
    },
    searchIcon: {
        marginRight: wp(2),
    },
    searchInput: {
        flex: 1,
        fontSize: hp(2),
        color: '#333',
    },
    loader: {
        marginVertical: hp(2),
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderRadius: 20,
        marginBottom: hp(1),
        backgroundColor: '#F5F5F5',
    },
    userAvatar: {
        width: hp(5),
        height: hp(5),
        borderRadius: hp(2.5),
        marginRight: wp(3),
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: hp(2),
        fontWeight: '600',
        color: '#333',
    },
    subText: {
        fontSize: hp(1.6),
        color: '#777',
    },
    startChatButton: {
        marginTop: hp(3),
        width: '100%',
        height: hp(6.5),
        backgroundColor: '#017B6B',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    buttonText: {
        color: '#FFF',
        fontSize: hp(2.2),
        fontWeight: '600',
    },
});
