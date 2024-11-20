import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    Alert,
    StyleSheet, ActivityIndicator,
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

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New password and confirm password do not match.');
            return;
        }

        if (!user || !user.email) {
            Alert.alert('Error', 'User not authenticated. Please log in again.');
            return;
        }

        const auth = getAuth();
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            setLoading(true);

            // Reauthenticate user
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            Alert.alert('Success', 'Your password has been updated.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            router.push('/home'); // Navigate back to home after successful update
        } catch (error) {
            console.error('Password update error:', error);
            Alert.alert('Password Update Failed', error.message);
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

                <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Current Password"
                    secureTextEntry
                    placeholderTextColor="#B0B0B0"
                />
                <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New Password"
                    secureTextEntry
                    placeholderTextColor="#B0B0B0"
                />
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm New Password"
                    secureTextEntry
                    placeholderTextColor="#B0B0B0"
                />

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
    input: {
        height: hp(6.5),
        backgroundColor: '#333333',
        borderRadius: 12,
        paddingHorizontal: wp(4),
        marginBottom: hp(2),
        fontSize: hp(2),
        fontWeight: '500',
        color: '#FFF',
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
