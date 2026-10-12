import * as ImagePicker from 'expo-image-picker';
import { Linking, Platform } from 'react-native';
import { AppPermissionStatus, PermissionKind } from '@/types/capture';

export interface PermissionExplanation {
  title: string;
  description: string;
  settingsInstruction: string;
}

export const PERMISSION_EXPLANATIONS: Record<PermissionKind, PermissionExplanation> = {
  camera: {
    title: 'Camera Access Needed',
    description: 'FieldCapture requires camera access to take high-resolution site inspection photos and field videos.',
    settingsInstruction: 'Go to Settings > Apps > FieldCapture > Permissions and toggle Camera to Allowed.',
  },
  mediaLibrary: {
    title: 'Photo Library Access Needed',
    description: 'FieldCapture needs access to your media library to attach existing site photos and inspection media.',
    settingsInstruction: 'Go to Settings > Apps > FieldCapture > Permissions and enable Photo & Video access.',
  },
};

export async function checkPermissionStatus(kind: PermissionKind): Promise<AppPermissionStatus> {
  const result =
    kind === 'camera'
      ? await ImagePicker.getCameraPermissionsAsync()
      : await ImagePicker.getMediaLibraryPermissionsAsync();

  return {
    status: result.status,
    granted: result.granted,
    canAskAgain: result.canAskAgain,
  };
}

export async function requestPermission(kind: PermissionKind): Promise<AppPermissionStatus> {
  const result =
    kind === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  return {
    status: result.status,
    granted: result.granted,
    canAskAgain: result.canAskAgain,
  };
}

export async function openDeviceSettings(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return false;
    }
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}
