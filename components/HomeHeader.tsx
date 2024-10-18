import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { blurhash } from '@/utils/common';
import { useAuth } from '@/context/authContext';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { MenuItem } from './CustomMenuItems';
import { AntDesign, Feather } from '@expo/vector-icons';

const ios = Platform.OS === 'ios';

const HomeHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const { top } = useSafeAreaInsets();

    const handleProfile = () => {
        console.log('Profile pressed');
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
        <View style={[styles.header, { paddingTop: ios ? top : top + 10 }]}>
            <Text style={styles.title}>Chats</Text>

            <Menu>
                <MenuTrigger>
                    <Image
                        style={styles.profileImage}
                        source={user?.profileUrl || require('../assets/images/avatar.png')}
                        placeholder={blurhash}
                        transition={500}
                    />
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
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        backgroundColor: '#4f46e5',
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
    },
    title: {
        fontSize: hp(3),
        fontWeight: '500',
        color: 'white',
    },
    profileImage: {
        height: hp(4.3),
        aspectRatio: 1,
        borderRadius: 50,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        width: '100%',
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
