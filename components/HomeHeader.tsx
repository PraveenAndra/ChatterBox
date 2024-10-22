import React from 'react';
import { View, Text, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { blurhash } from '@/utils/common';
import { useAuth } from '@/context/authContext';
import { Menu, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { AntDesign, Feather } from '@expo/vector-icons';
import { MenuItem } from './CustomMenuItems';
import {useFonts} from "expo-font";
import {Inter_400Regular, Inter_700Bold} from "@expo-google-fonts/inter";
import {useExpoRouter} from "expo-router/build/global-state/router-store";

const ios = Platform.OS === 'ios';

const HomeHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const router = useExpoRouter();
    const { top } = useSafeAreaInsets();
    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
    });

    // if (!fontsLoaded) {
    //     return <AppLoading />;
    // }

    const handleProfile = () => {
        console.log('Profile pressed');
        router.push('/profile');
    };

    const handleLogout = async () => {
        try {
            await logout();
            console.log('Logged out');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <View style={[styles.header, { paddingTop: top + 10 }]}>
            <Text style={styles.title}>Chats</Text>

            <Menu>
                <MenuTrigger>
                    {/*<TouchableOpacity activeOpacity={0.8}>*/}
                        <Image
                            style={styles.profileImage}
                            source={user?.profileUrl || require('../assets/images/avatar.png')}
                            placeholder={blurhash}
                            transition={500}
                        />
                    {/*</TouchableOpacity>*/}
                </MenuTrigger>

                <MenuOptions customStyles={menuOptionsStyles}>
                    <MenuItem
                        text="Profile"
                        action={handleProfile}
                        value={null}
                        icon={<Feather name="user" size={hp(2.5)} color="#737373" />}
                    />
                    <Divider />
                    <MenuItem
                        text="Sign Out"
                        action={handleLogout}
                        value={null}
                        icon={<AntDesign name="logout" size={hp(2.5)} color="#737373" />}
                    />
                </MenuOptions>
            </Menu>
        </View>
    );
};

const Divider: React.FC = () => (
    <View style={styles.divider} />
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        backgroundColor: '#017B6B',
        paddingBottom: hp(1.5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4, // Elevation for Android shadow
    },
    title: {
        fontSize: hp(2.8), // Slightly larger text size for modern look
        fontWeight: '600',
        color: 'white',
        // fontFamily: 'Inter_400Regular',
    },
    profileImage: {
        height: hp(5), // Increased for better proportions
        width: hp(5),
        borderRadius: hp(2.5), // Make it perfectly circular
        borderWidth: 1,
        borderColor: '#FFF', // White border for better visibility
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        width: '100%',
        marginVertical: hp(0.5),
    },
});

const menuOptionsStyles = {
    optionsContainer: {
        borderRadius: 10,
        marginTop: 40,
        marginLeft: -30,
        backgroundColor: 'white',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 0 },
        width: 160,
    },
};

export default HomeHeader;
