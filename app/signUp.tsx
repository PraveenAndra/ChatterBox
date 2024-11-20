import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Pressable,
    Alert,
    StyleSheet, Platform,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Feather, Octicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import Loading from '../components/Loading';
import { useAuth } from '@/context/authContext';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImageManipulator from 'expo-image-manipulator';


const SignUp: React.FC = () => {
    const router = useRouter();
    const { register } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const emailRef = useRef<string>('');
    const passwordRef = useRef<string>('');
    const confirmPasswordRef = useRef<string>('');
    const usernameRef = useRef<string>('');


    const handleRegister = async () => {
        if (
            !emailRef.current ||
            !passwordRef.current ||
            !usernameRef.current ||
            !profileImage ||
            !confirmPasswordRef.current
        ) {
            Alert.alert('Sign Up', 'Please fill all the fields!');
            return;
        }

        if (passwordRef.current !== confirmPasswordRef.current) {
            Alert.alert('Sign Up', 'Passwords do not match!');
            return;
        }

        setLoading(true);

        try {
            // Upload profile image to Firebase Storage
            // const uploadedUrl = await uploadImageToFirebase(profileImage, emailRef.current);

            // Register user with the uploaded profile image URL
            const response = await register(
                emailRef.current,
                passwordRef.current,
                usernameRef.current,
                profileImage
            );

            if (response.success) {
                Alert.alert('Sign Up', 'Account created successfully!');
                router.push('/signIn');
            } else {
                Alert.alert('Sign Up', response.msg);
            }
        } catch (error) {
            console.error('Sign Up Error:', error);
            Alert.alert('Sign Up', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
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
                setProfileImage(base64Image);
                if( Platform.OS === 'web'){
                    window.alert("Profile image updated successfully.");
                }else
                Alert.alert("Success", "Profile image updated successfully.");
            } catch (error: any) {
                if( Platform.OS === 'web'){
                    window.alert("Error");
                }
                Alert.alert("Error", error.message || "An unexpected error occurred.");
            }
        }
    };

    const processImage = async (image: ImagePicker.ImagePickerAsset): Promise<string> => {
        const { base64, uri } = image;

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
    return (
        <View style={styles.fullScreen}>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        resizeMode="contain"
                        source={require('../assets/images/register.png')}
                    />
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.title}>Sign Up</Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputContainer}>
                            <Feather name="user" size={hp(2.7)} color="#dfdfdf" />
                            <TextInput
                                onChangeText={(value) => (usernameRef.current = value)}
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#B0B0B0"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Octicons name="mail" size={hp(2.7)} color="#dfdfdf" />
                            <TextInput
                                onChangeText={(value) => (emailRef.current = value)}
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#B0B0B0"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Octicons name="lock" size={hp(2.7)} color="#dfdfdf" />
                            <TextInput
                                onChangeText={(value) => (passwordRef.current = value)}
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry={!passwordVisible}
                                placeholderTextColor="#B0B0B0"
                            />
                            <TouchableOpacity
                                onPress={() => setPasswordVisible(!passwordVisible)}
                                style={styles.visibilityToggle}
                            >
                                <Feather
                                    name={passwordVisible ? 'eye-off' : 'eye'}
                                    size={hp(2.5)}
                                    color="#dfdfdf"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Octicons name="lock" size={hp(2.7)} color="#dfdfdf" />
                            <TextInput
                                onChangeText={(value) => (confirmPasswordRef.current = value)}
                                style={styles.input}
                                placeholder="Confirm Password"
                                secureTextEntry={!confirmPasswordVisible}
                                placeholderTextColor="#B0B0B0"
                            />
                            <TouchableOpacity
                                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                style={styles.visibilityToggle}
                            >
                                <Feather
                                    name={confirmPasswordVisible ? 'eye-off' : 'eye'}
                                    size={hp(2.5)}
                                    color="#dfdfdf"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    style={styles.profileImagePreview}
                                />
                            ) : (
                                <Text style={styles.imagePickerText}>
                                    <Feather name="image" size={hp(2.7)} color="#dfdfdf" /> Upload
                                    Profile Picture
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <Loading size={hp(6.5)} />
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleRegister}
                                    style={styles.submitButton}
                                >
                                    <Text style={styles.submitButtonText}>Sign Up</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>Already have an account? </Text>
                            <Link href="/signIn" asChild>
                                <Pressable>
                                    <Text style={styles.signInLink}>Sign In</Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        paddingTop: hp(7),
        paddingHorizontal: wp(5),
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: hp(4),
    },
    image: {
        height: hp(20),
    },
    formContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: hp(4),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        gap: 10,
    },
    title: {
        fontSize: hp(3),
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF',
    },
    inputGroup: {
        gap: 15,
    },
    inputContainer: {
        height: hp(6.5),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: wp(4),
        backgroundColor: '#333333',
        borderRadius: 12,
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        fontWeight: '500',
        color: '#FFFFFF',
    },
    visibilityToggle: {
        padding: hp(0.5),
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    submitButton: {
        height: hp(6.5),
        backgroundColor: '#dfdfdf',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: hp(2),
    },
    submitButtonText: {
        fontSize: hp(2.5),
        color: '#000000',
        fontWeight: 'bold',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(2),
    },
    signInText: {
        fontSize: hp(1.8),
        color: '#FFFFFF',
    },
    signInLink: {
        fontSize: hp(1.8),
        fontWeight: 'bold',
        color: '#bebebe',
        textDecorationLine: 'underline',
    },
    imagePickerButton: {
        height: hp(6.5),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: wp(4),
        backgroundColor: '#333333',
        borderRadius: 12,
    },
    profileImagePreview: {
        height: hp(6),
        width: hp(6),
        borderRadius: hp(3),
    },
    imagePickerText: {
        color: '#dfdfdf',
        fontSize: hp(2),
        fontWeight: '500',
    },
});

export default SignUp;
