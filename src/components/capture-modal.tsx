import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaptureCategory, MediaType } from '@/types/capture';
import { useMediaPermissions } from '@/hooks/use-media-permissions';
import { PermissionModal } from '@/components/permission-modal';
import { persistMediaLocally } from '@/services/storage';
import { useCaptureStore } from '@/store/capture-store';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: CaptureCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'safety', label: 'Safety', icon: 'shield-checkmark-outline' },
  { id: 'structural', label: 'Structural', icon: 'construct-outline' },
  { id: 'electrical', label: 'Electrical', icon: 'flash-outline' },
  { id: 'environmental', label: 'Environment', icon: 'leaf-outline' },
  { id: 'general', label: 'General', icon: 'document-text-outline' },
];

const SAMPLE_FIELD_PHOTO =
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

export function CaptureModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const addCapture = useCaptureStore((s) => s.addCapture);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<CaptureCategory>('safety');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const {
    showDeniedModal,
    deniedKind,
    closeDeniedModal,
    capturePhotoWithCamera,
    captureVideoWithCamera,
    pickFromGallery,
  } = useMediaPermissions();

  const handleCapturePhoto = async () => {
    const result = await capturePhotoWithCamera();
    if (result) {
      setMediaUri(result.uri);
      setMediaType(result.mediaType);
      setValidationError(null);
    }
  };

  const handleCaptureVideo = async () => {
    const result = await captureVideoWithCamera();
    if (result) {
      setMediaUri(result.uri);
      setMediaType(result.mediaType);
      setValidationError(null);
    }
  };

  const handlePickGallery = async () => {
    const result = await pickFromGallery();
    if (result) {
      setMediaUri(result.uri);
      setMediaType(result.mediaType);
      setValidationError(null);
    }
  };

  const handleUseSampleAsset = () => {
    setMediaUri(SAMPLE_FIELD_PHOTO);
    setMediaType('photo');
    setValidationError(null);
    if (!title) {
      setTitle('Transformer Unit 4 Thermal Check');
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setNotes('');
    setCategory('safety');
    setMediaUri(null);
    setMediaType('photo');
    setValidationError(null);
    setIsSaving(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setValidationError('Please enter an inspection title');
      return;
    }

    if (!mediaUri) {
      setValidationError('Please capture a photo/video or select media');
      return;
    }

    setIsSaving(true);
    try {
      const tempId = `capture_${Date.now()}`;
      const extension = mediaType === 'video' ? 'mp4' : 'jpg';
      const permanentUri = await persistMediaLocally(mediaUri, tempId, extension);

      await addCapture({
        title: title.trim(),
        notes,
        category,
        mediaUri: permanentUri,
        mediaType,
        location: {
          latitude: 34.0522,
          longitude: -118.2437,
          name: 'Site Sector 3B (Substation)',
        },
      });

      handleResetForm();
      onClose();
    } catch (e) {
      console.error('[CaptureModal] Save failed:', e);
      setValidationError('Failed to save inspection record locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    handleResetForm();
    onClose();
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleDismiss}>
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Field Capture</Text>
            <TouchableOpacity style={styles.closeHeaderButton} activeOpacity={0.7} onPress={handleDismiss}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={[
                styles.scrollInner,
                {
                  paddingBottom:
                    keyboardHeight > 0
                      ? keyboardHeight + 36
                      : Math.max(insets.bottom + 24, 32),
                },
              ]}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Media Capture</Text>

                {mediaUri ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: mediaUri }} style={styles.mediaPreview} contentFit="cover" />
                    <View style={styles.previewOverlayBadge}>
                      <Ionicons
                        name={mediaType === 'video' ? 'videocam' : 'camera'}
                        size={14}
                        color="#FFFFFF"
                      />
                      <Text style={styles.previewBadgeText}>
                        {mediaType === 'video' ? 'Video Recorded' : 'Photo Captured'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.retakeButton}
                      activeOpacity={0.8}
                      onPress={() => setMediaUri(null)}>
                      <Ionicons name="reload" size={14} color="#FFFFFF" />
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.mediaActionGrid}>
                    <TouchableOpacity
                      style={styles.mediaActionButton}
                      activeOpacity={0.8}
                      onPress={handleCapturePhoto}>
                      <View style={[styles.actionIconCircle, { backgroundColor: '#E0F2FE' }]}>
                        <Ionicons name="camera" size={24} color="#0284C7" />
                      </View>
                      <Text style={styles.mediaActionTitle}>Take Photo</Text>
                      <Text style={styles.mediaActionSubtitle}>Launch Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mediaActionButton}
                      activeOpacity={0.8}
                      onPress={handleCaptureVideo}>
                      <View style={[styles.actionIconCircle, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="videocam" size={24} color="#DC2626" />
                      </View>
                      <Text style={styles.mediaActionTitle}>Record Video</Text>
                      <Text style={styles.mediaActionSubtitle}>Field Clip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mediaActionButton}
                      activeOpacity={0.8}
                      onPress={handlePickGallery}>
                      <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="images" size={24} color="#D97706" />
                      </View>
                      <Text style={styles.mediaActionTitle}>Library</Text>
                      <Text style={styles.mediaActionSubtitle}>Select File</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!mediaUri && (
                  <TouchableOpacity
                    style={styles.sampleAssetTrigger}
                    activeOpacity={0.7}
                    onPress={handleUseSampleAsset}>
                    <Ionicons name="sparkles-outline" size={14} color="#64748B" />
                    <Text style={styles.sampleAssetText}>Quick test: Attach demo field sample</Text>
                  </TouchableOpacity>
                )}
              </View>

              {validationError && (
                <View style={styles.validationBanner}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.validationText}>{validationError}</Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Inspection Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.75}
                        onPress={() => setCategory(cat.id)}
                        style={[styles.categoryCard, isSelected && styles.activeCategoryCard]}>
                        <Ionicons
                          name={cat.icon}
                          size={16}
                          color={isSelected ? '#0284C7' : '#64748B'}
                        />
                        <Text
                          style={[
                            styles.categoryCardText,
                            isSelected && styles.activeCategoryCardText,
                          ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Pump Station 3 Valve Leakage"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (validationError) setValidationError(null);
                  }}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Field Observation Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Describe observed conditions, equipment tag numbers, or safety flags..."
                  placeholderTextColor="#94A3B8"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.disabledSaveButton]}
                activeOpacity={0.85}
                disabled={isSaving}
                onPress={handleSave}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save & Queue Record</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <PermissionModal
        visible={showDeniedModal}
        kind={deniedKind}
        onClose={closeDeniedModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeHeaderButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mediaActionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  mediaActionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  previewContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  previewOverlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  retakeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sampleAssetTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
  },
  sampleAssetText: {
    fontSize: 12,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  validationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  validationText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeCategoryCard: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  activeCategoryCardText: {
    color: '#0284C7',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  notesInput: {
    minHeight: 90,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledSaveButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
