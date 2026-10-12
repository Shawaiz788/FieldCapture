import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const CAPTURES_DIR = `${FileSystem.documentDirectory || ''}field_captures/`;

async function ensureCapturesDirectoryExists(): Promise<void> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return;
  }
  const dirInfo = await FileSystem.getInfoAsync(CAPTURES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CAPTURES_DIR, { intermediates: true });
  }
}

export async function persistMediaLocally(
  sourceUri: string,
  itemId: string,
  extension = 'jpg'
): Promise<string> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return sourceUri;
  }

  await ensureCapturesDirectoryExists();
  const targetDestination = `${CAPTURES_DIR}${itemId}.${extension}`;

  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetDestination,
    });
    return targetDestination;
  } catch (error) {
    console.warn('[Storage] Copy failed, falling back to source URI:', error);
    return sourceUri;
  }
}

export async function removePersistedMedia(uri: string): Promise<void> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return;
  }

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.warn('[Storage] Remove failed:', error);
  }
}
