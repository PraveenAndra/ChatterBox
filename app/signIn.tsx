import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Pressable,
    Alert,
    StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import {Feather, Octicons} from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import Loading from '../components/Loading';
import { useAuth } from '@/context/authContext';

const SignIn: React.FC = () => {
    const router = useRouter();
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { login } = useAuth();

    const emailRef = useRef<string>('');
    const passwordRef = useRef<string>('');

    const handleLogin = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert('Sign In', 'Please fill all the fields!');
            return;
        }

        setLoading(true);
        try {
            const response = await login(emailRef.current, passwordRef.current);
            setLoading(false);
            console.log('Sign in response:', response);

            if (!response.success) {
                Alert.alert('Sign In', response.msg);
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Sign In', 'An unexpected error occurred.');
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
                        source={require('../assets/images/login.png')}
                    />
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.title}>Sign In</Text>

                    <View style={styles.inputGroup}>
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

                        <View>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <Loading size={hp(6.5)} />
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleLogin}
                                    style={styles.signInButton}
                                >
                                    <Text style={styles.signInButtonText}>Sign In</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>Don't have an account? </Text>
                            <Link href="/signUp" asChild>
                                <Pressable>
                                    <Text style={styles.signUpLink}>Sign Up</Text>
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
        backgroundColor: '#000000', // Pure black background
    },
    container: {
        flex: 1,
        paddingTop: hp(8),
        paddingHorizontal: wp(5),
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: hp(4),
    },
    image: {
        height: hp(25),
        width: wp(60),
    },
    visibilityToggle: {
        padding: hp(0.5),
    },
    formContainer: {
        backgroundColor: '#1E1E1E', // Slightly lighter black for form container
        borderRadius: 12,
        padding: hp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        gap: 10,
    },
    title: {
        fontSize: hp(3),
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF', // White text for visibility
        marginBottom: hp(3),
    },
    inputGroup: {
        gap: 12, // Increased spacing for a modern layout
    },
    inputContainer: {
        height: hp(7),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: wp(4),
        backgroundColor: '#333333', // Dark gray for input fields
        borderRadius: 12,
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        fontWeight: '500',
        color: '#FFFFFF', // White text for input
    },
    passwordGroup: {
        gap: 3,
    },
    forgotPassword: {
        fontSize: hp(1.8),
        textAlign: 'right',
        color: '#FFFFFF', // White text for links
        marginTop: 5,
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signInButton: {
        height: hp(6.5),
        backgroundColor: '#dfdfdf', // White button for contrast
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    signInButtonText: {
        fontSize: hp(2.5),
        color: '#000000', // Black text to contrast with the white button
        fontWeight: 'bold',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(2),
    },
    signUpText: {
        fontSize: hp(1.8),
        color: '#FFFFFF', // White text for supporting text
    },
    signUpLink: {
        fontSize: hp(1.8),
        fontWeight: 'bold',
        color: '#bebebe', // White link for consistency
        textDecorationLine: 'underline', // Subtle underline for emphasis
    },
});



export default SignIn;
