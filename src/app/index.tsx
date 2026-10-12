import React, { useState, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FieldCaptureItem } from '@/types/capture';
import { useCaptureStore } from '@/store/capture-store';
import { useNetwork } from '@/hooks/use-network';
import { NetworkStatusBar } from '@/components/network-status-bar';
import { KpiSummary } from '@/components/kpi-summary';
import { StatusFilterTabs } from '@/components/status-filter-tabs';
import { CaptureCard } from '@/components/capture-card';
import { CaptureModal } from '@/components/capture-modal';
import { MediaPreviewModal } from '@/components/media-preview-modal';
import { EmptyState } from '@/components/empty-state';

export default function FieldCaptureScreen() {
  const insets = useSafeAreaInsets();
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<FieldCaptureItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const items = useCaptureStore((s) => s.items);
  const filter = useCaptureStore((s) => s.filter);
  const clearSyncedCaptures = useCaptureStore((s) => s.clearSyncedCaptures);
  const syncPendingAndFailedQueue = useCaptureStore((s) => s.syncPendingAndFailedQueue);
  const { refreshNetwork } = useNetwork();

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.syncStatus === filter);
  }, [items, filter]);

  const syncedCount = useMemo(
    () => items.filter((i) => i.syncStatus === 'synced').length,
    [items]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNetwork();
    await syncPendingAndFailedQueue();
    setIsRefreshing(false);
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topAppBar}>
        <View>
          <Text style={styles.brandTitle}>FieldCapture</Text>
          <Text style={styles.brandSubtitle}>Offline Inspection System</Text>
        </View>

        <View style={styles.topActions}>
          {syncedCount > 0 && (
            <TouchableOpacity
              style={styles.ghostActionButton}
              activeOpacity={0.7}
              onPress={clearSyncedCaptures}>
              <Ionicons name="trash-bin-outline" size={18} color="#64748B" />
              <Text style={styles.ghostActionText}>Clear Synced</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CaptureCard item={item} onPreviewMedia={setPreviewItem} />
        )}
        ListHeaderComponent={
          <>
            <NetworkStatusBar />
            <KpiSummary />
            <StatusFilterTabs />
          </>
        }
        ListEmptyComponent={
          <EmptyState filter={filter} />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />

      <View
        style={[
          styles.floatingBarContainer,
          { bottom: Math.max(insets.bottom + 12, 20) },
        ]}>
        <TouchableOpacity
          style={styles.floatingActionButton}
          activeOpacity={0.88}
          onPress={() => setIsCaptureModalOpen(true)}>
          <Ionicons name="camera" size={20} color="#FFFFFF" />
          <Text style={styles.floatingActionText}>New Field Capture</Text>
        </TouchableOpacity>
      </View>

      <CaptureModal
        visible={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
      />

      <MediaPreviewModal
        visible={previewItem !== null}
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ghostActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  ghostActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  listContent: {
    paddingTop: 4,
  },
  floatingBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingActionButton: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
    maxWidth: 320,
  },
  floatingActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
