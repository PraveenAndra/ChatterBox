import React, { ReactNode } from 'react';
import {
    View,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    KeyboardAvoidingViewProps,
    ScrollViewProps,
    StyleSheet,
    ViewStyle
} from 'react-native';

const ios = Platform.OS === 'ios';

interface CustomKeyboardViewProps {
    children: ReactNode;
    inChat?: boolean;
    style?: ViewStyle;
}

const CustomKeyboardView: React.FC<CustomKeyboardViewProps> = ({ children, inChat = false, style }) => {
    let kavConfig: Partial<KeyboardAvoidingViewProps> = {};
    let scrollViewConfig: Partial<ScrollViewProps> = {};

    if (inChat) {
        kavConfig = { keyboardVerticalOffset: 90 };
        scrollViewConfig = { contentContainerStyle: { flex: 1 } };
    }

    return (
        <KeyboardAvoidingView
            behavior={ios ? 'padding' : 'height'}
            style={[styles.keyboardAvoidingView, style]}
            {...kavConfig}
        >
            <ScrollView
                style={styles.scrollView}
                bounces={false}
                showsVerticalScrollIndicator={false}
                {...scrollViewConfig}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Styles for the component
const styles = StyleSheet.create({
    keyboardAvoidingView: {
        // flex: 1,
        // backgroundColor: '#E5E5E5', // Set a default background color if needed
    },
    scrollView: {
        flex: 1,
    },
});

export default CustomKeyboardView;
