import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { FieldCaptureItem, SyncStatus, CaptureCategory, MediaType, FieldLocation } from '@/types/capture';
import { networkService } from '@/services/network';
import { removePersistedMedia } from '@/services/storage';

export type FilterStatus = 'all' | 'pending' | 'syncing' | 'synced' | 'error';

interface NewCapturePayload {
  title: string;
  notes: string;
  category: CaptureCategory;
  mediaUri: string;
  mediaType: MediaType;
  location: FieldLocation;
  fileSizeBytes?: number;
}

interface CaptureStoreState {
  items: FieldCaptureItem[];
  filter: FilterStatus;
  simulateFailures: boolean;
  isBatchSyncing: boolean;

  setFilter: (filter: FilterStatus) => void;
  setSimulateFailures: (simulate: boolean) => void;
  addCapture: (payload: NewCapturePayload) => Promise<FieldCaptureItem>;
  removeCapture: (id: string) => Promise<void>;
  clearSyncedCaptures: () => Promise<void>;
  syncItem: (id: string) => Promise<boolean>;
  syncPendingAndFailedQueue: () => Promise<void>;
  updateItemStatus: (id: string, status: SyncStatus, progress: number, errorMessage?: string) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useCaptureStore = create<CaptureStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      filter: 'all',
      simulateFailures: false,
      isBatchSyncing: false,

      setFilter: (filter) => set({ filter }),

      setSimulateFailures: (simulateFailures) => set({ simulateFailures }),

      updateItemStatus: (id, syncStatus, syncProgress, errorMessage) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            return {
              ...item,
              syncStatus,
              syncProgress,
              errorMessage: errorMessage ?? item.errorMessage,
              syncedAt: syncStatus === 'synced' ? new Date().toISOString() : item.syncedAt,
            };
          }),
        }));
      },

      addCapture: async (payload) => {
        const id = Crypto.randomUUID();
        const newItem: FieldCaptureItem = {
          id,
          title: payload.title.trim() || 'Untitled Inspection',
          notes: payload.notes.trim(),
          category: payload.category,
          mediaUri: payload.mediaUri,
          mediaType: payload.mediaType,
          location: payload.location,
          fileSizeBytes: payload.fileSizeBytes,
          createdAt: new Date().toISOString(),
          syncStatus: 'pending',
          syncProgress: 0,
          retryCount: 0,
        };

        set((state) => ({
          items: [newItem, ...state.items],
        }));

        const network = networkService.getState();
        if (network.effectiveOnline) {
          get().syncItem(newItem.id);
        }

        return newItem;
      },

      removeCapture: async (id) => {
        const item = get().items.find((i) => i.id === id);
        if (item) {
          await removePersistedMedia(item.mediaUri);
        }
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      clearSyncedCaptures: async () => {
        const syncedItems = get().items.filter((i) => i.syncStatus === 'synced');
        for (const item of syncedItems) {
          await removePersistedMedia(item.mediaUri);
        }
        set((state) => ({
          items: state.items.filter((i) => i.syncStatus !== 'synced'),
        }));
      },

      syncItem: async (id: string): Promise<boolean> => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return false;

        const network = networkService.getState();
        if (!network.effectiveOnline) {
          get().updateItemStatus(id, 'pending', 0, 'Cannot sync: Device is offline');
          return false;
        }

        if (item.syncStatus === 'syncing') {
          return false;
        }

        get().updateItemStatus(id, 'syncing', 10);
        await sleep(250);

        const currentNetwork = networkService.getState();
        if (!currentNetwork.effectiveOnline) {
          get().updateItemStatus(id, 'pending', 0, 'Sync aborted: Connection lost');
          return false;
        }

        get().updateItemStatus(id, 'syncing', 35);
        await sleep(300);

        get().updateItemStatus(id, 'syncing', 70);
        await sleep(250);

        if (get().simulateFailures && Math.random() > 0.4) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id
                ? {
                    ...i,
                    syncStatus: 'error',
                    syncProgress: 70,
                    retryCount: i.retryCount + 1,
                    errorMessage: 'Simulated Network Error: Remote endpoint timed out (504)',
                  }
                : i
            ),
          }));
          return false;
        }

        get().updateItemStatus(id, 'syncing', 95);
        await sleep(200);

        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  syncStatus: 'synced',
                  syncProgress: 100,
                  errorMessage: undefined,
                  syncedAt: new Date().toISOString(),
                }
              : i
          ),
        }));

        return true;
      },

      syncPendingAndFailedQueue: async () => {
        const { isBatchSyncing, items } = get();
        if (isBatchSyncing) return;

        const network = networkService.getState();
        if (!network.effectiveOnline) return;

        const candidateItems = items.filter(
          (i) => i.syncStatus === 'pending' || i.syncStatus === 'error'
        );

        if (candidateItems.length === 0) return;

        set({ isBatchSyncing: true });

        for (const candidate of candidateItems) {
          const currentNetwork = networkService.getState();
          if (!currentNetwork.effectiveOnline) break;

          await get().syncItem(candidate.id);
          await sleep(150);
        }

        set({ isBatchSyncing: false });
      },
    }),
    {
      name: 'field-capture-records-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        simulateFailures: state.simulateFailures,
      }),
    }
  )
);

networkService.onReconnect(() => {
  useCaptureStore.getState().syncPendingAndFailedQueue();
});
