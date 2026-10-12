import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { PermissionKind, MediaType } from '@/types/capture';
import { checkPermissionStatus, requestPermission } from '@/services/permissions';

export interface MediaCaptureResult {
  uri: string;
  mediaType: MediaType;
  fileSizeBytes?: number;
}

export function useMediaPermissions() {
  const [deniedKind, setDeniedKind] = useState<PermissionKind | null>(null);
  const [showDeniedModal, setShowDeniedModal] = useState<boolean>(false);

  const ensurePermission = useCallback(
    async (kind: PermissionKind): Promise<boolean> => {
      const current = await checkPermissionStatus(kind);
      if (current.granted) {
        return true;
      }

      const requested = await requestPermission(kind);
      if (requested.granted) {
        return true;
      }

      setDeniedKind(kind);
      setShowDeniedModal(true);
      return false;
    },
    []
  );

  const capturePhotoWithCamera = useCallback(async (): Promise<MediaCaptureResult | null> => {
    const hasPermission = await ensurePermission('camera');
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      mediaType: 'photo',
      fileSizeBytes: asset.fileSize,
    };
  }, [ensurePermission]);

  const captureVideoWithCamera = useCallback(async (): Promise<MediaCaptureResult | null> => {
    const hasPermission = await ensurePermission('camera');
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      quality: 0.85,
      videoMaxDuration: 60,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      mediaType: 'video',
      fileSizeBytes: asset.fileSize,
    };
  }, [ensurePermission]);

  const pickFromGallery = useCallback(async (): Promise<MediaCaptureResult | null> => {
    const hasPermission = await ensurePermission('mediaLibrary');
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const isVideo = asset.type === 'video';

    return {
      uri: asset.uri,
      mediaType: isVideo ? 'video' : 'photo',
      fileSizeBytes: asset.fileSize,
    };
  }, [ensurePermission]);

  const closeDeniedModal = useCallback(() => {
    setShowDeniedModal(false);
  }, []);

  return {
    showDeniedModal,
    deniedKind,
    closeDeniedModal,
    capturePhotoWithCamera,
    captureVideoWithCamera,
    pickFromGallery,
    ensurePermission,
  };
}
