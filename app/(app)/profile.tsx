import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StyleSheet,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { Feather, Entypo } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAuth } from '@/context/authContext';
import { router } from "expo-router";
import { db } from '@/firebaseConfig'; // Assuming firebase is initialized and exported from this path
import { doc, updateDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export default function Profile() {
    const { user, logout,refreshUser } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [profileUrl, setProfileUrl] = useState(user?.profileUrl || '');
    const insets = useSafeAreaInsets();

    // Helper function to check if the profileUrl is a base64 encoded image
    const isBase64 = (url: string) => url.startsWith("data:image/");

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permission Denied", "You need to grant camera roll permissions to use this feature.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1, // Start with high quality
            base64: true,
        });

        if (!result.canceled) {
            try {
                const base64Image = await processImage(result.assets[0]);
                setProfileUrl(base64Image);
                Alert.alert("Success", "Profile image updated successfully.");
            } catch (error: any) {
                Alert.alert("Error", error.message || "An unexpected error occurred.");
            }
        }
    };

    const processImage = async (image: ImagePicker.ImagePickerAsset): Promise<string> => {
        const { base64, uri } = image;
        console.log(base64);

        // Check if the base64 exceeds Firestore's limit
        if (base64 && base64.length <= 1048487) {
            return `data:image/jpeg;base64,${base64}`;
        }

        // Compress the image if it exceeds the limit
        const compressedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Resize to a smaller width while maintaining aspect ratio
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Reduce quality and save as JPEG
        );

        // Convert the compressed image to Base64
        const compressedBase64 = await fetch(compressedImage.uri)
            .then((response) => response.blob())
            .then((blob) =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                })
            );

        if (compressedBase64.length > 1048487) {
            throw new Error("The image is still too large after compression. Please select a smaller image.");
        }

        return compressedBase64;
    };


    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('Logged out', 'You have been logged out.');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleSave = async () => {
        console.log(user);
        if (!user || !user.userId) {
            // If user or user.uid is not defined, show an alert and stop execution
            console.error('User ID is undefined. Cannot save profile data.');
            Alert.alert('Error', 'User data is missing. Please try again later.');
            return;
        }

        try {
            // Get a reference to the Firestore document
            const userDocRef = doc(db, 'users', user?.userId);

            // Log document reference for debugging
            console.log('Updating document:', userDocRef.path);

            // Update Firestore document with new username and profileUrl
            await updateDoc(userDocRef, {
                username: username,
                profileUrl: profileUrl,
            });
            await refreshUser();
            // Success alert
            Alert.alert('Profile updated', 'Your profile has been successfully updated.');
        } catch (error) {
            // Log and display error if update fails
            console.error('Failed to update profile:', error);
            Alert.alert('Update failed', 'Could not save your profile changes. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <StatusBar style="light" />
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() =>router.push({ pathname: '/home', params: { refresh: 'true' } })}>
                    <Entypo name="chevron-left" size={hp(3)} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Feather name="check" size={hp(3)} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.innerContainer}>
                <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
                    {profileUrl ? (
                        <Image
                            source={{ uri: isBase64(profileUrl) ? profileUrl : profileUrl }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <Feather name="user" size={hp(7)} color="#FFF" style={styles.placeholderIcon} />
                    )}
                    <View style={styles.cameraIconWrapper}>
                        <Feather name="camera" size={hp(2.2)} color="#FFF" />
                    </View>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter your username"
                    />
                </View>

                <View style={styles.menuContainer}>
                    <MenuItem icon="lock" title="Change Password" onPress={() => router.push('/change-password')}/>
                    <MenuItem icon="bell" title="Notifications" />
                    <MenuItem icon="eye" title="Privacy Settings" />
                    <MenuItem icon="info" title="About App" />
                    <MenuItem icon="log-out" title="Logout" onPress={handleLogout} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const MenuItem = ({ icon, title, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconWrapper}>
            <Feather name={icon} size={hp(2.2)} color="#FFF" />
        </View>
        <Text style={styles.menuText}>{title}</Text>
        <Entypo name="chevron-right" size={hp(2)} color="#000" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingBottom: 15,
        backgroundColor: '#000000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    headerTitle: {
        fontSize: hp(2),
        fontWeight: '600',
        color: '#FFF',
    },
    innerContainer: {
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(3),
    },
    imageContainer: {
        marginBottom: hp(2),
        alignItems: 'center',
        position: 'relative',
    },
    profileImage: {
        width: hp(12),
        height: hp(12),
        borderRadius: hp(6),
    },
    placeholderIcon: {
        backgroundColor: '#A5A5A5',
        padding: hp(1.5),
        borderRadius: hp(6),
    },
    cameraIconWrapper: {
        position: 'absolute',
        bottom: 0,
        right: wp(2),
        backgroundColor: '#000000',
        padding: hp(0.5),
        borderRadius: hp(1.5),
    },
    inputContainer: {
        width: '100%',
        marginBottom: hp(2),
    },
    label: {
        fontSize: hp(2),
        fontWeight: '500',
        color: '#333',
        marginBottom: hp(1),
    },
    input: {
        width: '100%',
        height: hp(5.5),
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingHorizontal: wp(4),
        borderColor: '#E0E0E0',
        borderWidth: 1,
        fontSize: hp(2),
    },
    menuContainer: {
        width: '100%',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(4),
        backgroundColor: '#FFFFFF',
        borderRadius: 100,
        marginBottom: hp(1),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    menuIconWrapper: {
        backgroundColor: '#333',
        padding: hp(0.8),
        borderRadius: 100,
        marginRight: wp(3),
    },
    menuText: {
        fontSize: hp(2),
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
});
