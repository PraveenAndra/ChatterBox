import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/authContext';
import { Menu, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { Feather, AntDesign, Entypo } from '@expo/vector-icons';
import { MenuItem } from './CustomMenuItems';
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { useExpoRouter } from "expo-router/build/global-state/router-store";

const HomeHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const router = useExpoRouter();
    const { top } = useSafeAreaInsets();
    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
    });

    const handleProfile = () => {
        console.log('Profile pressed');
        router.push('/profile');
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <View style={[styles.header, { paddingTop: top + 10 }]}>
            <Text style={styles.title}>Chats</Text>

            <Menu>
                <MenuTrigger customStyles={{ TriggerTouchableComponent: TouchableOpacity }}>
                    <View style={styles.menuIconWrapper}>
                        <Entypo name="dots-three-horizontal" size={hp(2)} color="#FFF" />
                    </View>
                </MenuTrigger>
                <MenuOptions customStyles={menuOptionsStyles}>
                    <MenuItem
                        text="Profile"
                        action={handleProfile}
                        value={null}
                        icon={<Feather name="user" size={hp(2.5)} color="#FFF" />}
                    />
                    <Divider />
                    <MenuItem
                        text="Sign Out"
                        action={handleLogout}
                        value={null}
                        icon={<AntDesign name="logout" size={hp(2.5)} color="#FFF" />}
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
        paddingHorizontal: wp(3),
        paddingBottom: hp(2),
        paddingTop: hp(5), // Increased height
        backgroundColor: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    title: {
        fontSize: hp(2.5), // Slightly larger text
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.7,
    },
    menuIconWrapper: {
        height: hp(4),
        width: hp(4),
        borderRadius: hp(2.5), // Circular shape
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#444',
        width: '100%',
        marginVertical: hp(0.5),
    },
});

const menuOptionsStyles = {
    optionsContainer: {
        borderRadius: 12,
        marginTop: 40,
        marginLeft: -20,
        backgroundColor: '#2A2A2A',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        width: 170,
        // height: 160,
        paddingVertical: hp(1),
    },
    optionWrapper: {
        padding: hp(1),
    },
    optionText: {
        color: '#FFFFFF', // Corrected text color to white
        fontSize: hp(1.5),
    },
};

export default HomeHeader;
