import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Vertical Tracker</Text>
        <Text style={styles.subtitle}>Add a video to track your vertical!</Text>
        <Image 
            source={require('../../assets/images/yujinishida.jpg')} 
            style={styles.image}
        />
        <Link href={{ pathname: '/(tabs)/camera' }} style={styles.button}>
            <Text style={styles.buttonText}>Record Video</Text>
        </Link>
        <Link href={{ pathname: '/(tabs)/gallery' }} style={styles.button}>
            <Text style={styles.buttonText}>View Gallery</Text>
        </Link>
    </View>
  )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding : 20,
        paddingTop : 50,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },

    button: {
        backgroundColor: '#007AFF',
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    image: {
        width: 300,
        height: 300,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10,
    }
})