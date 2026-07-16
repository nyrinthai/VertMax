import { useEffect, useRef } from 'react';

const API_BASE_URL = '';

type DetectionResult = {
    takeoffTime: number;
    landingTime: number;
};

type Props = {
    videoUri: string;
    onDetected: (result: DetectionResult) => void;
    onError: (message: string) => void;
};

export default function AutoJumpDetector({ videoUri, onDetected, onError }: Props) {
    const firedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        firedRef.current = false;

        async function run() {
            try {
                const formData = new FormData();
                // RN's FormData accepts this { uri, name, type } shape directly.
                formData.append('video', {
                    uri: videoUri,
                    name: 'jump.mp4',
                    type: 'video/mp4',
                } as any);

                const response = await fetch(`${API_BASE_URL}/analyze-jump`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const data = await response.json();

                if (cancelled || firedRef.current) return;

                if (!response.ok || data.error) {
                    firedRef.current = true;
                    onError(data.error ?? `Server error (${response.status}).`);
                    return;
                }

                if (data.takeoffTime == null || data.landingTime == null) {
                    firedRef.current = true;
                    onError('Server did not return a valid jump detection.');
                    return;
                }

                firedRef.current = true;
                onDetected({ takeoffTime: data.takeoffTime, landingTime: data.landingTime });
            } catch (err: any) {
                if (cancelled || firedRef.current) return;
                firedRef.current = true;
                onError(
                    err?.message?.includes('Network request failed')
                        ? 'Could not reach the detection server. Check your API_BASE_URL and that your phone and computer are on the same Wi-Fi.'
                        : (err?.message ?? 'Unexpected error contacting the detection server.')
                );
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [videoUri]);

    return null;
}