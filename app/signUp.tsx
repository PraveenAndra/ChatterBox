import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Pressable,
    Alert,
    StyleSheet
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Feather, Octicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '@/context/authContext';

const SignUp: React.FC = () => {
    const router = useRouter();
    const { register } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);

    const emailRef = useRef<string>('');
    const passwordRef = useRef<string>('');
    const usernameRef = useRef<string>('');
    const profileRef = useRef<string>('');

    const handleRegister = async () => {
        if (
            !emailRef.current ||
            !passwordRef.current ||
            !usernameRef.current ||
            !profileRef.current
        ) {
            Alert.alert('Sign Up', 'Please fill all the fields!');
            return;
        }

        setLoading(true);

        const response = await register(
            emailRef.current,
            passwordRef.current,
            usernameRef.current,
            profileRef.current
        );
        setLoading(false);

        console.log('Got result: ', response);

        if (!response.success) {
            Alert.alert('Sign Up', response.msg);
        }
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
                            <Feather name="user" size={hp(2.7)} color="#007BFF" />
                            <TextInput
                                onChangeText={(value) => (usernameRef.current = value)}
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#B0B0B0"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Octicons name="mail" size={hp(2.7)} color="#007BFF" />
                            <TextInput
                                onChangeText={(value) => (emailRef.current = value)}
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#B0B0B0"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Octicons name="lock" size={hp(2.7)} color="#007BFF" />
                            <TextInput
                                onChangeText={(value) => (passwordRef.current = value)}
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry
                                placeholderTextColor="#B0B0B0"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Feather name="image" size={hp(2.7)} color="#007BFF" />
                            <TextInput
                                onChangeText={(value) => (profileRef.current = value)}
                                style={styles.input}
                                placeholder="Profile URL"
                                placeholderTextColor="#B0B0B0"
                            />
                        </View>

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
                            <Link href='/signIn' asChild>
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
        flex: 1, // Ensures the keyboard view takes up full height
        height: '100%',
    },
    container: {
        flex: 1,
        paddingTop: hp(7),
        paddingHorizontal: wp(5),
        backgroundColor: '#E5E5E5', // Light gray background for the container
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: hp(4), // Space between image and form
    },
    image: {
        height: hp(20),
    },
    formContainer: {
        backgroundColor: '#FFFFFF', // White background for the form
        borderRadius: 12,
        padding: hp(4),
        shadowColor: '#000', // Shadow for elevation effect
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
        gap: 10,
    },
    title: {
        fontSize: hp(4),
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333', // Dark gray title
    },
    inputGroup: {
        gap: 4,
    },
    inputContainer: {
        height: hp(7),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        backgroundColor: '#F2F2F2', // Softer input background
        borderRadius: 12,
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        fontWeight: '600',
        color: '#333', // Dark gray text color
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    submitButton: {
        height: hp(6.5),
        backgroundColor: '#007BFF', // Primary blue color for button
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: hp(2), // Space around the button
    },
    submitButtonText: {
        fontSize: hp(2.7),
        color: '#FFFFFF', // White text color for button
        fontWeight: 'bold',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signInText: {
        fontSize: hp(1.8),
        color: '#777', // Gray text color for sign-in prompt
    },
    signInLink: {
        fontSize: hp(1.8),
        fontWeight: 'bold',
        color: '#007BFF', // Primary blue color for sign-in link
    },
});

export default SignUp;
