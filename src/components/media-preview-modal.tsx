import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { FieldCaptureItem } from '@/types/capture';

interface Props {
  visible: boolean;
  item: FieldCaptureItem | null;
  onClose: () => void;
}

export function MediaPreviewModal({ visible, item, onClose }: Props) {
  if (!visible || !item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.subtitle}>
                {item.location.name} • {item.category.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} activeOpacity={0.8} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.mediaUri }}
              style={styles.image}
              contentFit="contain"
            />
            {item.mediaType === 'video' && (
              <View style={styles.videoBadge}>
                <Ionicons name="videocam" size={16} color="#FFFFFF" />
                <Text style={styles.videoBadgeText}>Video Clip</Text>
              </View>
            )}
          </View>

          {item.notes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#334155',
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notesContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
});
