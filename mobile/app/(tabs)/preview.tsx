import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function preview() {

    const { videoUri } = useLocalSearchParams<{ videoUri: string }>();

    const player = useVideoPlayer(videoUri, (player) => {
        player.loop = true;
        player.play();
    });

    function handleRetake() {
        router.back();
    }

    function handleDone() {
        router.push({
        pathname: '/mark',
        params: { videoUri }
        });
        player.pause();
    }


    return (
        <View style={styles.container}>
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
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleRetake} style={styles.button}>
                    <Text style={styles.buttonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDone} style={styles.button}>
                    <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
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

    buttonContainer: {
        position: 'absolute',
        bottom: 64,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        width: '100%',
        paddingHorizontal: 64,
        gap: 16,
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
    video: {
        width: '100%',
        height: 500,
    },
})