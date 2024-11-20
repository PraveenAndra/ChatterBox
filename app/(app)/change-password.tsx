import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    Alert,
    StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/authContext';
import { getAuth, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ChangePassword() {
    const router = useRouter();
    const { user } = useAuth(); // Assuming user context provides user info
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
            if (Platform.OS === 'web') {
                window.alert('Passwords do not match or are empty.');
            }
            else {
                Alert.alert('Error', 'Passwords do not match or are empty.');
                return;
            }
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
            if (Platform.OS==='web'){
                window.alert( 'No authenticated user found. Please log in again.');
            }
            else {
                Alert.alert('Error', 'No authenticated user found. Please log in again.');
            }
            return;
        }

        try {
            setLoading(true);

            const credential = EmailAuthProvider.credential(currentUser.email || '', currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            if (Platform.OS === 'web'){
                window.alert('Your password has been updated.');
            }
            else{
                Alert.alert('Success', 'Your password has been updated.');
            }
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            router.push('/home');
        } catch (error) {
            console.error('Password update error:', error);
            if (Platform.OS === 'web'){
                window.alert('Password Update Failed');
            }
            else{
                Alert.alert('Password Update Failed'+ error.message || 'An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="chevron-left" size={hp(3.5)} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.title}>Change Password</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Current Password"
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
                    <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="New Password"
                        secureTextEntry={!newPasswordVisible}
                        placeholderTextColor="#B0B0B0"
                    />
                    <TouchableOpacity
                        onPress={() => setNewPasswordVisible(!newPasswordVisible)}
                        style={styles.visibilityToggle}
                    >
                        <Feather
                            name={newPasswordVisible ? 'eye-off' : 'eye'}
                            size={hp(2.5)}
                            color="#dfdfdf"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm New Password"
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

                <TouchableOpacity
                    onPress={handleChangePassword}
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Update Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        paddingHorizontal: wp(5),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: hp(6),
        paddingBottom: hp(2),
    },
    headerTitle: {
        fontSize: hp(2.5),
        fontWeight: '600',
        color: '#FFF',
        marginLeft: wp(3),
    },
    formContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: hp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: hp(3),
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: hp(3),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: hp(6.5),
        backgroundColor: '#333333',
        borderRadius: 12,
        paddingHorizontal: wp(4),
        marginBottom: hp(2),
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        fontWeight: '500',
        color: '#FFF',
    },
    visibilityToggle: {
        padding: hp(0.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        height: hp(6.5),
        backgroundColor: '#FFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
    },
    buttonText: {
        fontSize: hp(2.2),
        color: '#000',
        fontWeight: 'bold',
    },
});
