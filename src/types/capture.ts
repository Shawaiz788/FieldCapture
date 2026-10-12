export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

export type MediaType = 'photo' | 'video';

export type CaptureCategory =
  | 'safety'
  | 'structural'
  | 'electrical'
  | 'environmental'
  | 'general';

export interface FieldLocation {
  latitude: number;
  longitude: number;
  name: string;
}

export interface FieldCaptureItem {
  id: string;
  title: string;
  notes: string;
  category: CaptureCategory;
  mediaUri: string;
  mediaType: MediaType;
  createdAt: string;
  location: FieldLocation;
  syncStatus: SyncStatus;
  syncProgress: number; // 0 to 100
  retryCount: number;
  errorMessage?: string;
  syncedAt?: string;
  fileSizeBytes?: number;
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
}

export type PermissionKind = 'camera' | 'mediaLibrary';

export interface AppPermissionStatus {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain: boolean;
}
