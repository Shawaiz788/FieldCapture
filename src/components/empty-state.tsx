import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterStatus } from '@/store/capture-store';

interface Props {
  filter: FilterStatus;
}

export function EmptyState({ filter }: Props) {
  const getMessage = () => {
    switch (filter) {
      case 'pending':
        return 'No captures currently pending synchronization.';
      case 'syncing':
        return 'No captures currently actively uploading.';
      case 'synced':
        return 'No synced captures found yet.';
      case 'error':
        return 'No failed uploads. Everything is running smoothly!';
      default:
        return 'No field inspections recorded yet. Tap "New Field Capture" below to begin.';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="clipboard-outline" size={32} color="#94A3B8" />
      </View>
      <Text style={styles.title}>No Records Found</Text>
      <Text style={styles.description}>{getMessage()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
