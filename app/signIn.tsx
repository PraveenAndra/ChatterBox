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
import { Octicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import Loading from '../components/Loading';
import { useAuth } from '@/context/authContext';

const SignIn: React.FC = () => {
    const router = useRouter();
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
                            <Octicons name="mail" size={hp(2.7)} color="#017B6B" />
                            <TextInput
                                onChangeText={(value) => (emailRef.current = value)}
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#B0B0B0"
                            />
                        </View>

                        <View style={styles.passwordGroup}>
                            <View style={styles.inputContainer}>
                                <Octicons name="lock" size={hp(2.7)} color="#017B6B" />
                                <TextInput
                                    onChangeText={(value) => (passwordRef.current = value)}
                                    style={styles.input}
                                    placeholder="Password"
                                    secureTextEntry
                                    placeholderTextColor="#B0B0B0"
                                />
                            </View>
                            <Text style={styles.forgotPassword}>Forgot password?</Text>
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
        height: '100%',
        backgroundColor: '#F0F0F0',
    },
    container: {
        height: '100%',
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
    formContainer: {
        backgroundColor: '#FFFFFF',
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
        fontSize: hp(4),
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#017B6B',
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
        backgroundColor: '#F2F2F2',
        borderRadius: 12,
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        fontWeight: '600',
        color: '#333',
    },
    passwordGroup: {
        gap: 3,
    },
    forgotPassword: {
        fontSize: hp(1.8),
        textAlign: 'right',
        color: '#017B6B',
        marginTop: 5,
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signInButton: {
        height: hp(6.5),
        backgroundColor: '#017B6B',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: hp(2),
    },
    signInButtonText: {
        fontSize: hp(2.7),
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signUpText: {
        fontSize: hp(1.8),
        color: '#777',
    },
    signUpLink: {
        fontSize: hp(1.8),
        fontWeight: 'bold',
        color: '#017B6B',
    },
});

export default SignIn;
