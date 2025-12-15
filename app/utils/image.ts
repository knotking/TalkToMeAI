import { CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

export async function captureCameraFrame(cameraRef: CameraView): Promise<string | null> {
    try {
        if (!cameraRef) return null;
        // Note: takePictureAsync can be slow and makes a shutter sound.
        // For a true "live" video feed analysis without shutter sound, we would need
        // Frame Processors (requires bare workflow/dev client) or react-native-view-shot.
        // For Expo Go, this is the best we can do easily.
        const photo = await cameraRef.takePictureAsync({
            base64: true,
            quality: 0.4, // lower quality for speed
            skipProcessing: true,
            shutterSound: false, // Attempt to disable sound (Android only usually)
            imageType: 'jpg',
        });
        return photo?.base64 || null;
    } catch (error) {
        // console.error("Failed to capture frame", error);
        return null;
    }
}

export async function fileToBase64(uri: string): Promise<string> {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
    } catch (error) {
        console.error("Error reading file:", error);
        throw error;
    }
}

