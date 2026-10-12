import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '@/hooks/use-network';
import { useCaptureStore } from '@/store/capture-store';

export function NetworkStatusBar() {
  const { effectiveOnline, isSimulatedOffline, toggleSimulateOffline, type } = useNetwork();
  const isBatchSyncing = useCaptureStore((s) => s.isBatchSyncing);
  const syncPendingAndFailedQueue = useCaptureStore((s) => s.syncPendingAndFailedQueue);
  const pendingCount = useCaptureStore(
    (s) => s.items.filter((i) => i.syncStatus === 'pending' || i.syncStatus === 'error').length
  );

  return (
    <View style={[styles.container, effectiveOnline ? styles.onlineBorder : styles.offlineBorder]}>
      <View style={styles.statusRow}>
        <View style={styles.indicatorRow}>
          <View
            style={[
              styles.statusDot,
              effectiveOnline ? styles.onlineDot : styles.offlineDot,
            ]}
          />
          <View>
            <Text style={styles.statusTitle}>
              {effectiveOnline ? 'Online Ready' : 'Offline Mode'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {effectiveOnline
                ? `Network active (${type})`
                : isSimulatedOffline
                ? 'Simulated offline active'
                : 'No internet connection'}
            </Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Simulate Offline</Text>
            <Switch
              value={isSimulatedOffline}
              onValueChange={toggleSimulateOffline}
              trackColor={{ false: '#CBD5E1', true: '#F59E0B' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {effectiveOnline && pendingCount > 0 && (
            <TouchableOpacity
              style={styles.syncButton}
              activeOpacity={0.8}
              disabled={isBatchSyncing}
              onPress={syncPendingAndFailedQueue}>
              {isBatchSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.syncButtonText}>Sync ({pendingCount})</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  onlineBorder: {
    borderColor: '#E2E8F0',
  },
  offlineBorder: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBEB',
  },
  statusRow: {
    flexDirection: 'column',
    gap: 10,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  onlineDot: {
    backgroundColor: '#10B981',
  },
  offlineDot: {
    backgroundColor: '#F59E0B',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  syncButton: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
