import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import moment from 'moment';

interface Message {
    userId: string;
    text: string;
    createdAt: { seconds: number; nanoseconds: number };
}

interface User {
    userId: string;
    username: string;
    profileUrl?: string;
}

interface MessageItemProps {
    message: Message;
    currentUser: User | null;
}

export default function MessageItem({ message, currentUser }: MessageItemProps): JSX.Element {
    const isCurrentUserMessage = currentUser?.userId === message?.userId;
    const formattedTime = moment(message.createdAt.seconds * 1000).format('h:mm A');

    return isCurrentUserMessage ? (
        <View style={styles.myMessageContainer}>
            <View style={styles.myMessageWrapper}>
                <Text style={styles.messageText}>{message?.text}</Text>
                <Text style={styles.timestamp}>{formattedTime}</Text>
            </View>
        </View>
    ) : (
        <View style={styles.otherMessageContainer}>
            <View style={styles.otherMessageWrapper}>
                <Text style={styles.messageText}>{message?.text}</Text>
                <Text style={styles.timestamp}>{formattedTime}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    myMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: hp(1.2),
        marginRight: wp(3),
    },
    myMessageWrapper: {
        maxWidth: wp(75),
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(4),
        backgroundColor: '#02574b', // Deep green for sender's message
        borderRadius: 20,
        borderBottomRightRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    otherMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: hp(1.2),
        marginLeft: wp(3),
    },
    otherMessageWrapper: {
        maxWidth: wp(75),
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(4),
        backgroundColor: '#2A2A2A', // Dark gray for other user's message
        borderRadius: 20,
        borderBottomLeftRadius: 5,
        borderColor: '#444', // Subtle border for contrast
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    messageText: {
        fontSize: hp(2),
        color: '#FFFFFF', // White text for visibility on dark bubbles
        lineHeight: hp(2.5), // Better readability with proper line height
    },
    timestamp: {
        fontSize: hp(1.4),
        color: '#AAA', // Subtle gray for timestamps
        textAlign: 'right',
        marginTop: hp(0.5),
    },
});
