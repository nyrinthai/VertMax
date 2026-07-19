import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import { Alert, StyleSheet, Linking, Text, TouchableOpacity, View } from 'react-native';

export default function Preview() {

    const { videoUri } = useLocalSearchParams<{ videoUri?: string | string[] }>();
    const source = Array.isArray(videoUri) ? videoUri[0] : videoUri;

    const player = useVideoPlayer(source ?? null, (player) => {
        if (!source) return;
        player.loop = true;
        player.play();
    });

async function openGallery() {
    player.pause();

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
      router.replace({
        pathname: '/(tabs)/preview',
        params: { videoUri: result.assets[0].uri },
      });
    }
  }
    function handleDone() {
        if (!source) return;
        player.pause();

        router.push({
        pathname: '/mark',
        params: { videoUri: source }
        });
        player.pause();
    }


    return (
        <View style={styles.container}>
            {source ? (
                <VideoView
                    player = {player}
                    style ={styles.video}
                    fullscreenOptions={{
                        enable: true,
                    }}
                    allowsPictureInPicture
                    contentFit = "contain"
                    nativeControls
                />
            ) : (
                <Text>No video selected.</Text>
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleDone}
                    style={styles.primaryButton}
                >
                    <Text style={styles.primaryButtonText}>
                        Use This Video
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={openGallery}
                    style={styles.secondaryButton}
                >
                    <Text style={styles.secondaryButtonText}>
                        Choose Another Video
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 20,
        paddingTop: 50,
        paddingBottom: 32,
        alignItems: 'center',
        backgroundColor: '#fff',
    },

    buttonContainer: {
        width: '100%',
        maxWidth: 520,
        marginTop: 16,
        gap: 12,
    },

    primaryButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },

    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },

    secondaryButton: {
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },

    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    video: {
        width: '100%',
        maxWidth: 520,
        flex: 1,
        minHeight: 260,
        backgroundColor: '#000',
        borderRadius: 8,
    },
})
