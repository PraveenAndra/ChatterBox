import { View, FlatList, ListRenderItem, StyleSheet } from 'react-native';
import React from 'react';
import ChatItem from './ChatItem';
import { useRouter } from 'expo-router';

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    [key: string]: any;
}

interface ChatListProps {
    users: User[] | null;
    currentUser: User | null;
}

export default function ChatList({ users, currentUser }: ChatListProps) {
    const router = useRouter();

    const renderItem: ListRenderItem<User> = ({ item, index }) => (
        <View>
            <ChatItem
                noBorder={index + 1 === users.length}
                router={router}
                currentUser={currentUser}
                item={item}
            />
            {/* Render a divider unless it's the last item */}
            {/*{index + 1 !== users.length && <View style={styles.divider} />}*/}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={users}
                contentContainerStyle={styles.listContainer}
                keyExtractor={(item) => item.userId} // Use userId as the unique key
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0', // Retain the dark theme
    },
    listContainer: {
        paddingVertical: 15, // Consistent vertical spacing
    },
    divider: {
        height: 1,
        backgroundColor: '#333', // Subtle divider color matching the theme
        marginHorizontal: 20, // Align divider with ChatItem padding
    },
});
