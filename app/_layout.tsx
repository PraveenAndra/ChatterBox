import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native'; // Import View and StyleSheet
import { Slot, useRouter, useSegments } from 'expo-router';
import '../global.css';
import { AuthContextProvider, useAuth } from '@/context/authContext';
import { MenuProvider } from 'react-native-popup-menu';
import {ChatProvider} from "@/context/chatContext";

const MainLayout: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        console.log('isAuthenticated:', isAuthenticated);
        if (typeof isAuthenticated === 'undefined') return;

        const inApp = segments[0] === '(app)';
        if (isAuthenticated && !inApp) {
            router.replace('/home');
        } else if (!isAuthenticated && segments[0] !== 'signUp') {
            console.log("in _layout");
            router.replace('/signIn');
        }
    }, [isAuthenticated, segments, router]);

    return (
        <View style={styles.fullScreen}>
            <Slot />
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        height: '100%',
    },
});

const RootLayout: React.FC = () => {
    return (
        <MenuProvider>
            <AuthContextProvider>
                <ChatProvider>
                    <MainLayout />
                </ChatProvider>
            </AuthContextProvider>
        </MenuProvider>
    );
};

export default RootLayout;
