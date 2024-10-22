import { Stack } from 'expo-router';
import HomeHeader from '../../components/HomeHeader';

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="home"
                options={{
                    header: () => <HomeHeader />,
                }}
            />
            {/* Add User Page with No Header */}
            <Stack.Screen
                name="addUser"
                options={{
                    headerShown: false, // No header
                }}
            />

            {/* ChatRoom Page with Custom Inline Header */}
            <Stack.Screen
                name="chatRoom"
                options={{
                    headerStyle: { backgroundColor: '#017B6B' },
                    headerTintColor: '#FFFFFF', // Set back button and title color
                    headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
                }}
            />

            <Stack.Screen
                name="profile"
                options={{
                    headerShown: false, // No header
                }}
            />

        </Stack>
    );
}
