import { View, ScrollView, Text, StyleSheet } from 'react-native';
import React from 'react';
import MessageItem from './MessageItem';
import { format, isToday, isYesterday } from 'date-fns'; // Date formatting library

interface Message {
    userId: string;
    text: string;
    createdAt: { seconds: number; nanoseconds: number };
    [key: string]: any;
}

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
    [key: string]: any;
}

interface MessageListProps {
    messages: Message[];
    scrollViewRef: React.RefObject<ScrollView>;
    currentUser: User | null;
}

export default function MessageList({
                                        messages,
                                        scrollViewRef,
                                        currentUser,
                                    }: MessageListProps): JSX.Element {
    const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

    return (
        <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
        >
            {messages.map((message, index) => {
                const messageDate = new Date(message.createdAt.seconds * 1000);
                const showDateSeparator =
                    index === 0 ||
                    !isSameDay(
                        new Date(messages[index - 1].createdAt.seconds * 1000),
                        messageDate
                    );

                const dateLabel = isToday(messageDate)
                    ? 'Today'
                    : isYesterday(messageDate)
                        ? 'Yesterday'
                        : format(messageDate, 'EEE, MMM d');

                return (
                    <View key={index}>
                        {showDateSeparator && (
                            <View style={styles.dateSeparator}>
                                <Text style={styles.dateText}>{dateLabel}</Text>
                            </View>
                        )}
                        <MessageItem message={message} currentUser={currentUser} />
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        paddingTop: 10,
    },
    dateSeparator: {
        alignSelf: 'center',
        backgroundColor: '#3F3F3F',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginVertical: 10,
    },
    dateText: {
        fontSize: 14,
        color: '#F6F6F6',
        fontWeight: '500',
    },
});
