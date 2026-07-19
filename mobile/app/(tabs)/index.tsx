import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  async function openCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission to access camera is required!',
        'To use this feature, go to Settings > VertTracker > Camera and select Allow.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', style: 'default', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
      videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      router.push({
        pathname: '/(tabs)/mark',
        params: { videoUri: result.assets[0].uri },
      });
    }
  }

  async function openGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission to access media library is required!',
        'To use this feature, go to Settings > VertTracker > Photos and select Allow.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', style: 'default', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
      videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      router.push({
        pathname: '/(tabs)/preview',
        params: { videoUri: result.assets[0].uri },
      });
    }
  }

  return (
    <View style={styles.container}>
        <Text style={styles.title}>VertMax</Text>
        <Text style={styles.subtitle}>Add a video to track your vertical!</Text>
        <Image 
            source={require('../../assets/images/yujinishida.jpg')} 
            style={styles.image}
        />
        <TouchableOpacity onPress={openCamera} style={styles.button}>
            <Text style={styles.buttonText}>Record Video</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openGallery} style={styles.button}>
            <Text style={styles.buttonText}>View Gallery</Text>
        </TouchableOpacity>
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
        width: '100%',
        maxWidth: 300,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        marginTop: 12,
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
