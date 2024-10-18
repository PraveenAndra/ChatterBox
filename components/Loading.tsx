import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoadingProps {
    size: number;
}

const Loading: React.FC<LoadingProps> = ({ size }) => {
    return (
        <View style={[styles.container, { height: size }]}>
            <LottieView
                style={styles.lottie}
                source={require('../assets/images/loading.json')}
                autoPlay
                loop
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        aspectRatio: 1,
    },
    lottie: {
        flex: 1,
    },
});

export default Loading;
