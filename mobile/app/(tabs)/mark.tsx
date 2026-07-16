import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRef, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AutoJumpDetector from "../../components/jump_detector";

export default function Mark() {
    const { videoUri } = useLocalSearchParams<{ videoUri: string }>();
    const [takeoffTime, setTakeoffTime] = useState<number | null>(null);
    const [landingTime, setLandingTime] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const [vertical, setVertical] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [autoStatus, setAutoStatus] = useState<'running' | 'done' | 'error'>('running');
    const [autoMessage, setAutoMessage] = useState<string | null>(null);

    function handleAutoDetected(result: { takeoffTime: number; landingTime: number }) {
        setTakeoffTime(result.takeoffTime);
        setLandingTime(result.landingTime);
        setAutoStatus('done');
        showToast("Jump auto-detected — review below");
    }

    function handleAutoError(message: string) {
        setAutoStatus('error');
        setAutoMessage(message);
    }

    function showToast(message: string) {
        setToast(message);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => {
            setToast(null);
            toastTimer.current = null;
        }, 1000);
    }

    const player = useVideoPlayer(videoUri, (player) => {
        player.loop = true;
        player.play();
    });

    function handleTakeoff() {
        player.pause();
        setTakeoffTime(player.currentTime);
        showToast("Takeoff frame set");      
    }

    function handleLanding() {
        player.pause();
        setLandingTime(player.currentTime);
        showToast("Landing frame set");
    }

    function calcVertical(){
        if (takeoffTime === null || landingTime === null) {
            return null;
        }
        else if (landingTime <= takeoffTime) {
            return null;
        }
        const g = 9.81;
        const T = landingTime - takeoffTime;
        const h = (g * T * T) / 8;
        const h_inches = h * 39.3701;
        return h_inches;
    }

    function handleCalculate() {
        const vertical_height = calcVertical();
        if (vertical_height === null) {
            alert("Please set valid takeoff and landing frames.");
        } else {
            setVisible(true);
            setVertical(vertical_height);
        }
    }
    
    return (
        <View style={styles.container}>
            {videoUri && autoStatus === 'running' && (
                <AutoJumpDetector
                    videoUri={videoUri}
                    onDetected={handleAutoDetected}
                    onError={handleAutoError}
                />
            )}
            {autoStatus === 'running' && (
                <View style={styles.autoBanner}>
                    <ActivityIndicator size="small" />
                    <Text style={styles.autoBannerText}>Detecting jump automatically…</Text>
                </View>
            )}
            {autoStatus === 'error' && (
                <View style={[styles.autoBanner, styles.autoBannerError]}>
                    <Text style={styles.autoBannerText}>
                        {autoMessage ?? 'Auto-detection failed.'} Use the buttons below to set frames manually.
                    </Text>
                </View>
            )}
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
            {(takeoffTime !== null || landingTime !== null) && (
                <View style={styles.reviewRow}>
                    <Text style={styles.reviewText}>
                        Takeoff: {takeoffTime !== null ? `${takeoffTime.toFixed(2)}s` : '—'}
                    </Text>
                    <Text style={styles.reviewText}>
                        Landing: {landingTime !== null ? `${landingTime.toFixed(2)}s` : '—'}
                    </Text>
                </View>
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleTakeoff} style={styles.button}>
                    <Text style={styles.buttonText}>Set Takeoff Frame</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLanding} style={styles.button}>
                    <Text style={styles.buttonText}>Set Landing Frame</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCalculate} style={styles.button}>
                    <Text style={styles.buttonText}>Calculate Vertical</Text>
                </TouchableOpacity>
            </View>
            <Modal visible={visible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalText}>Estimated Vertical: {vertical?.toFixed(2)} inches</Text>
                        <TouchableOpacity onPress={() => setVisible(false)} style={styles.modalButton}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>           
                    </View>
                </View>
            </Modal>
            {toast && (
                <View style={styles.toast}>
                    <Text style={styles.toastText}>{toast}</Text>
                </View>
            )}
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
        gap : 8,
    },
    buttonContainer: {
        flexDirection: 'column',
        backgroundColor: 'transparent',
        width: '100%',
        paddingHorizontal: 64,
        gap: 8,
    },
    button: {
        backgroundColor: '#007AFF',
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
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    modalText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignSelf: 'center',
    },
    toast: {
        position: "absolute",
        bottom: 30,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.75)",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    toastText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    autoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#e8f0fe',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 8,
        width: '100%',
    },
    autoBannerError: {
        backgroundColor: '#fdecea',
    },
    autoBannerText: {
        fontSize: 13,
        color: '#333',
        flexShrink: 1,
    },
    reviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 8,
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
})