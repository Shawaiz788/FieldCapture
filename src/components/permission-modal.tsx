import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PermissionKind } from '@/types/capture';
import { PERMISSION_EXPLANATIONS, openDeviceSettings } from '@/services/permissions';

interface Props {
  visible: boolean;
  kind: PermissionKind | null;
  onClose: () => void;
  onRetryCheck?: () => void;
}

export function PermissionModal({ visible, kind, onClose, onRetryCheck }: Props) {
  if (!visible || !kind) {
    return null;
  }

  const explanation = PERMISSION_EXPLANATIONS[kind];
  const iconName = kind === 'camera' ? 'camera-outline' : 'images-outline';

  const handleOpenSettings = async () => {
    await openDeviceSettings();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconName} size={32} color="#EF4444" />
          </View>

          <Text style={styles.title}>{explanation.title}</Text>
          <Text style={styles.description}>{explanation.description}</Text>

          <View style={styles.instructionBox}>
            <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
            <Text style={styles.instructionText}>
              {Platform.OS === 'web'
                ? 'Please check your browser address bar permissions and allow camera or file access.'
                : explanation.settingsInstruction}
            </Text>
          </View>

          <View style={styles.actionContainer}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={handleOpenSettings}>
                <Ionicons name="settings-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Open Settings</Text>
              </TouchableOpacity>
            )}

            {onRetryCheck && (
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={onRetryCheck}>
                <Text style={styles.secondaryButtonText}>I Enabled It, Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  actionContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
});
