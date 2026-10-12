import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FilterStatus, useCaptureStore } from '@/store/capture-store';

interface FilterOption {
  key: FilterStatus;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'syncing', label: 'Syncing' },
  { key: 'synced', label: 'Synced' },
  { key: 'error', label: 'Errors' },
];

export function StatusFilterTabs() {
  const currentFilter = useCaptureStore((s) => s.filter);
  const setFilter = useCaptureStore((s) => s.setFilter);
  const items = useCaptureStore((s) => s.items);

  const getCountForFilter = (filterKey: FilterStatus): number => {
    if (filterKey === 'all') return items.length;
    return items.filter((item) => item.syncStatus === filterKey).length;
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {FILTER_OPTIONS.map((option) => {
          const isSelected = currentFilter === option.key;
          const count = getCountForFilter(option.key);

          return (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.7}
              onPress={() => setFilter(option.key)}
              style={[styles.tab, isSelected && styles.activeTab]}>
              <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                {option.label}
              </Text>
              <View style={[styles.countBadge, isSelected && styles.activeCountBadge]}>
                <Text style={[styles.countText, isSelected && styles.activeCountText]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  activeCountBadge: {
    backgroundColor: '#334155',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  activeCountText: {
    color: '#FFFFFF',
  },
});
