import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { FieldCaptureItem, SyncStatus, CaptureCategory } from '@/types/capture';
import { useCaptureStore } from '@/store/capture-store';

interface Props {
  item: FieldCaptureItem;
  onPreviewMedia: (item: FieldCaptureItem) => void;
}

const CATEGORY_COLORS: Record<CaptureCategory, { bg: string; text: string }> = {
  safety: { bg: '#FEE2E2', text: '#B91C1C' },
  structural: { bg: '#E0E7FF', text: '#3730A3' },
  electrical: { bg: '#FEF3C7', text: '#92400E' },
  environmental: { bg: '#DCFCE7', text: '#166534' },
  general: { bg: '#F1F5F9', text: '#334155' },
};

export function CaptureCard({ item, onPreviewMedia }: Props) {
  const syncItem = useCaptureStore((s) => s.syncItem);
  const removeCapture = useCaptureStore((s) => s.removeCapture);

  const categoryStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general;

  const renderStatusBadge = (status: SyncStatus, progress: number) => {
    switch (status) {
      case 'pending':
        return (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Ionicons name="time-outline" size={12} color="#D97706" />
            <Text style={[styles.statusText, styles.pendingText]}>Pending Sync</Text>
          </View>
        );
      case 'syncing':
        return (
          <View style={[styles.statusBadge, styles.syncingBadge]}>
            <ActivityIndicator size="small" color="#0284C7" style={styles.syncSpinner} />
            <Text style={[styles.statusText, styles.syncingText]}>Syncing ({progress}%)</Text>
          </View>
        );
      case 'synced':
        return (
          <View style={[styles.statusBadge, styles.syncedBadge]}>
            <Ionicons name="checkmark-circle" size={12} color="#059669" />
            <Text style={[styles.statusText, styles.syncedText]}>Synced</Text>
          </View>
        );
      case 'error':
        return (
          <View style={[styles.statusBadge, styles.errorBadge]}>
            <Ionicons name="alert-circle" size={12} color="#DC2626" />
            <Text style={[styles.statusText, styles.errorText]}>Error</Text>
          </View>
        );
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onPreviewMedia(item)}
          style={styles.thumbnailContainer}>
          <Image
            source={{ uri: item.mediaUri }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
          {item.mediaType === 'video' && (
            <View style={styles.videoOverlay}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.headerDetails}>
          <View style={styles.topMetaRow}>
            <View style={[styles.categoryChip, { backgroundColor: categoryStyle.bg }]}>
              <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
                {item.category.toUpperCase()}
              </Text>
            </View>
            {renderStatusBadge(item.syncStatus, item.syncProgress)}
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#64748B" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location.name}
            </Text>
            <Text style={styles.timestampText}>• {formattedDate}</Text>
          </View>
        </View>
      </View>

      {item.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}

      {item.syncStatus === 'syncing' && (
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${item.syncProgress}%` }]} />
        </View>
      )}

      {item.syncStatus === 'error' && item.errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
          <Text style={styles.errorMessageText} numberOfLines={2}>
            {item.errorMessage}
          </Text>
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.retryInfo}>
          {item.retryCount > 0 ? `Attempts: ${item.retryCount}` : ''}
        </Text>

        <View style={styles.actionsRow}>
          {item.syncStatus !== 'synced' && item.syncStatus !== 'syncing' && (
            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.7}
              onPress={() => syncItem(item.id)}>
              <Ionicons name="refresh-outline" size={14} color="#0284C7" />
              <Text style={styles.retryButtonText}>
                {item.syncStatus === 'error' ? 'Retry Upload' : 'Upload'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.7}
            onPress={() => removeCapture(item.id)}>
            <Ionicons name="trash-outline" size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailContainer: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  pendingText: {
    color: '#92400E',
  },
  syncingBadge: {
    backgroundColor: '#E0F2FE',
  },
  syncingText: {
    color: '#0369A1',
  },
  syncSpinner: {
    transform: [{ scale: 0.7 }],
  },
  syncedBadge: {
    backgroundColor: '#D1FAE5',
  },
  syncedText: {
    color: '#065F46',
  },
  errorBadge: {
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#991B1B',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    maxWidth: 120,
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notes: {
    fontSize: 13,
    color: '#475569',
    marginTop: 10,
    lineHeight: 18,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  errorMessageText: {
    fontSize: 12,
    color: '#B91C1C',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
  },
  retryInfo: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  deleteButton: {
    padding: 4,
  },
});
