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
import { Entypo, Feather, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { db } from '@/firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/authContext';

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
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
            const fetchedUsers = querySnapshot.docs.map((doc) => doc.data() as User);

            // Include selected user in results if they exist
            if (selectedUser && !fetchedUsers.some((u) => u.userId === selectedUser.userId)) {
                fetchedUsers.push(selectedUser);
            }

            // Exclude the current user from the search results
            setUsers(fetchedUsers.filter((user) => user.userId !== currentUser?.userId));
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = () => {
        if (!selectedUser) {
            Alert.alert('Error', 'Please select a user to chat with.');
            return;
        }
        router.push({ pathname: '/chatRoom', params: { userId: selectedUser.userId, username: selectedUser.username, profileUrl: selectedUser.profileUrl } });
    };

    const clearSearch = () => {
        setSearchText('');
        setUsers([]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/home', params: { refresh: 'true' } })}>
                    <Entypo name="chevron-left" size={hp(3.5)} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Chat</Text>
            </View>

            <View style={styles.innerContainer}>
                {/* Search Bar */}
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
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <AntDesign name="closecircle" size={18} color="#C7C7C7" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Selected User Display */}
                {selectedUser && !searchText && (
                    <View style={styles.selectedUserContainer}>
                        <Image
                            source={
                                selectedUser.profileUrl
                                    ? { uri: selectedUser.profileUrl }
                                    : require('../../assets/images/avatar.png')
                            }
                            style={styles.userAvatar}
                        />
                        <View style={styles.userInfo}>
                            <Text style={styles.username}>{selectedUser.username}</Text>
                            {/*<Text style={styles.subText}>Selected User</Text>*/}
                        </View>
                        <TouchableOpacity
                            style={styles.unselectButton}
                            onPress={() => setSelectedUser(null)}
                        >
                            <AntDesign name="closecircle" size={24} color="#3E3E3E" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* User List */}
                {loading ? (
                    <ActivityIndicator size="large" color="#017B6B" style={styles.loader} />
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.userId}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.userItem,
                                    selectedUser?.userId === item.userId && styles.selectedUserItem,
                                ]}
                                onPress={() => setSelectedUser(item)}
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
                                    <Text style={styles.subText}>
                                        {selectedUser?.userId === item.userId
                                            ? 'Selected'
                                            : 'Tap to select'}
                                    </Text>
                                </View>
                                {selectedUser?.userId === item.userId && (
                                    <AntDesign name="checkcircle" size={24} color="#017B6B" />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                )}

                {/* Start Chat Button */}
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
        backgroundColor: '#1E1E1E', // Black/dark background for elegance
        paddingBottom: hp(2),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: hp(3),
        paddingBottom: hp(2),
        backgroundColor: '#000', // Solid black header
        borderBottomWidth: 1,
        borderBottomColor: '#333', // Subtle separation for the header
    },
    headerTitle: {
        marginLeft: wp(4),
        fontSize: hp(2.5),
        fontWeight: '700',
        color: '#FFF', // Bright white text for contrast
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333', // Dark gray background for search
        borderRadius: 25,
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.2),
        borderColor: '#444', // Slightly lighter border for subtle depth
        borderWidth: 1,
        marginBottom: hp(2),
    },
    searchIcon: {
        marginRight: wp(2),
    },
    searchInput: {
        flex: 1,
        fontSize: hp(2),
        color: '#FFF', // White text for input
    },
    clearButton: {
        marginLeft: wp(1),
    },
    loader: {
        marginVertical: hp(2),
    },
    selectedUserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A', // Slightly lighter black
        borderRadius: 15,
        padding: hp(1.5),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 2, // Subtle elevation for depth
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A', // Matches selected user container
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderRadius: 15,
        marginBottom: hp(1),
    },
    selectedUserItem: {
        backgroundColor: '#3B3B3B', // Highlight for selected user
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
        color: '#FFF', // Bright white text
    },
    subText: {
        fontSize: hp(1.6),
        color: '#AAA', // Light gray for subtext
    },
    unselectButton: {
        marginLeft: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
    },
    startChatButton: {
        marginTop: hp(3),
        marginBottom: hp(3),
        width: '100%',
        height: hp(6.5),
        backgroundColor: '#000', // Black button for consistency
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: hp(2.2),
        fontWeight: '600',
    },
});

