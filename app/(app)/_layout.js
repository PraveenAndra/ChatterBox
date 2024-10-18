import { Stack } from 'expo-router';
import HomeHeader from '../../components/HomeHeader';

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    header: () => <HomeHeader />,
                }}
            />
        </Stack>
    );
}
