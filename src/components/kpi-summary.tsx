import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useCaptureStore } from '@/store/capture-store';

export function KpiSummary() {
  const items = useCaptureStore((s) => s.items);
  const simulateFailures = useCaptureStore((s) => s.simulateFailures);
  const setSimulateFailures = useCaptureStore((s) => s.setSimulateFailures);

  const pendingCount = items.filter((i) => i.syncStatus === 'pending').length;
  const syncingCount = items.filter((i) => i.syncStatus === 'syncing').length;
  const syncedCount = items.filter((i) => i.syncStatus === 'synced').length;
  const errorCount = items.filter((i) => i.syncStatus === 'error').length;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.pendingColor]}>
            {pendingCount + syncingCount}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.syncedColor]}>{syncedCount}</Text>
          <Text style={styles.statLabel}>Synced</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.errorColor]}>{errorCount}</Text>
          <Text style={styles.statLabel}>Errors</Text>
        </View>
      </View>

      <View style={styles.devSettingsRow}>
        <Text style={styles.devSettingsLabel}>Simulate Upload Failures (to test retries)</Text>
        <Switch
          value={simulateFailures}
          onValueChange={setSimulateFailures}
          trackColor={{ false: '#E2E8F0', true: '#FCA5A5' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  pendingColor: {
    color: '#D97706',
  },
  syncedColor: {
    color: '#059669',
  },
  errorColor: {
    color: '#DC2626',
  },
  devSettingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
  },
  devSettingsLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
