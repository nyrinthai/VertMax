import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import AutoJumpDetector from "../../components/jump_detector";

function calcVertical(takeoff: number, landing: number) {
    if (landing <= takeoff) return null;

    const g = 9.81;
    const flightTime = landing - takeoff;
    return ((g * flightTime * flightTime) / 8) * 39.3701;
}

export default function Mark() {
    const { videoUri } = useLocalSearchParams<{ videoUri: string }>();
    const [vertical, setVertical] = useState<number | null>(null);
    const [autoStatus, setAutoStatus] = useState<'running' | 'done' | 'error'>('running');
    const [autoMessage, setAutoMessage] = useState<string | null>(null);

    const handleAutoError = useCallback((message: string) => {
        setAutoStatus('error');
        setAutoMessage(message);
    }, []);

    const handleAutoDetected = useCallback((result: { takeoffTime: number; landingTime: number }) => {
        const detectedVertical = calcVertical(result.takeoffTime, result.landingTime);
        if (detectedVertical === null) {
            handleAutoError('Auto-detection returned invalid jump timing.');
            return;
        }

        setVertical(detectedVertical);
        setAutoStatus('done');
    }, [handleAutoError]);

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
                <View style={styles.panel}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.title}>Calculating your jump</Text>
                    <Text style={styles.message}>This usually takes a few seconds.</Text>
                </View>
            )}
            {autoStatus === 'error' && (
                <View style={styles.panel}>
                    <Text style={styles.title}>Could not calculate jump</Text>
                    <Text style={styles.message}>{autoMessage ?? 'Auto-detection failed.'}</Text>
                </View>
            )}
            {autoStatus === 'done' && vertical !== null && (
                <View style={styles.panel}>
                    <Text style={styles.label}>Estimated vertical</Text>
                    <Text style={styles.result}>{vertical.toFixed(2)} in</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    panel: {
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f2f2f7',
        borderRadius: 8,
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    title: {
        marginTop: 18,
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
    },
    message: {
        marginTop: 8,
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: '#555',
        textTransform: 'uppercase',
    },
    result: {
        marginTop: 10,
        fontSize: 48,
        fontWeight: '800',
        color: '#000',
    },
});
