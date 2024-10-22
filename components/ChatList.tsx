import { View, FlatList, ListRenderItem } from 'react-native';
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

export default function ChatList({ users, currentUser }: ChatListProps){
    const router = useRouter();

    const renderItem: ListRenderItem<User> = ({ item, index }) => (
        <ChatItem
            noBorder={index + 1 === users.length}
            router={router}
            currentUser={currentUser}
            item={item}
            // index={index}
        />
    );

    return (
        <View className="flex-1">
            <FlatList
                data={users}
                contentContainerStyle={{ flex: 1, paddingVertical: 25 }}
                keyExtractor={() => Math.random().toString()} // Math.random() as a key is not recommended
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
            />
        </View>
    );
}
