import { View, ActivityIndicator, StyleSheet } from 'react-native';
import React from 'react';

export default function StartPage(){
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="gray" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
});
