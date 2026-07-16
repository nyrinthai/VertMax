import { CameraType, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CameraScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [isRecording, setIsRecording] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

    if (!cameraPermission || !microphonePermission) {
        return <View />;
    }

    if (!cameraPermission.granted || !microphonePermission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need camera and microphone permissions</Text>
                <TouchableOpacity onPress={() => { requestCameraPermission(); requestMicrophonePermission(); }} style={styles.button}>
                    <Text style={styles.text}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }
      
    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    async function startRecording() {
        if (!isCameraReady) return;

        if (cameraRef.current && !isRecording) {
            setIsRecording(true);
            try {
                const video = await cameraRef.current.recordAsync();
                if (video){
                    console.log('Video recorded:', video.uri);
                    router.push({
                        pathname: '/(tabs)/preview',
                        params: { videoUri: video.uri },
                    })
                }
            } catch (error) {
                console.error('Error recording video:', error);
                setIsRecording(false);
            } finally {
                setIsRecording(false);
            }
        }
    }

    async function stopRecording() {
        if (cameraRef.current) {
            cameraRef.current.stopRecording();
        }
    }

    return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        onCameraReady={() =>  setIsCameraReady(true)}
        responsiveOrientationWhenOrientationLocked
        onResponsiveOrientationChanged ={(orientation) => { console.log('Orientation changed to:', orientation); }}
        />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
            style={[styles.button, !isCameraReady && styles.buttonDisabled]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={!isCameraReady}
          >
            <Text style={styles.text}>
                {!isCameraReady ? 'Loading...' : isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
  
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
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
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    buttonDisabled: {
        backgroundColor: '#999',
        opacity: 0.5,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
});