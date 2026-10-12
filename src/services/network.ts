import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkState } from '@/types/capture';

const SIMULATE_OFFLINE_KEY = '@field_capture_sim_offline';

type NetworkListener = (state: NetworkState) => void;
type ReconnectListener = () => void;

class NetworkService {
  private listeners: Set<NetworkListener> = new Set();
  private reconnectListeners: Set<ReconnectListener> = new Set();
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isSimulatedOffline: false,
    effectiveOnline: true,
  };
  private unsubscribeNetInfo: (() => void) | null = null;
  private wasPreviouslyOffline: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const savedSimOffline = await AsyncStorage.getItem(SIMULATE_OFFLINE_KEY);
      if (savedSimOffline !== null) {
        this.currentState.isSimulatedOffline = savedSimOffline === 'true';
      }
    } catch {
      // Ignore storage errors on init
    }

    // Subscribe to native NetInfo
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      this.handleNetInfoChange(state);
    });

    // Initial fetch
    try {
      const state = await NetInfo.fetch();
      this.handleNetInfoChange(state);
    } catch (e) {
      console.warn('[NetworkService] Initial fetch error:', e);
    }
  }

  private handleNetInfoChange(state: NetInfoState) {
    const isConnected = state.isConnected ?? false;
    // On web or some devices isInternetReachable can be null initially, fallback to isConnected
    const isInternetReachable = state.isInternetReachable ?? isConnected;
    const type = state.type || 'unknown';

    const effectiveOnline =
      !this.currentState.isSimulatedOffline && isConnected && isInternetReachable;

    const hadOffline = this.wasPreviouslyOffline;
    this.wasPreviouslyOffline = !effectiveOnline;

    this.currentState = {
      isConnected,
      isInternetReachable,
      type,
      isSimulatedOffline: this.currentState.isSimulatedOffline,
      effectiveOnline,
    };

    this.notifyListeners();

    // Trigger auto-sync reconnect listeners if we just came online
    if (hadOffline && effectiveOnline) {
      this.notifyReconnect();
    }
  }

  public getState(): NetworkState {
    return { ...this.currentState };
  }

  public async setSimulateOffline(simulate: boolean) {
    this.currentState.isSimulatedOffline = simulate;
    const effectiveOnline =
      !simulate &&
      this.currentState.isConnected &&
      this.currentState.isInternetReachable;

    const hadOffline = this.wasPreviouslyOffline;
    this.wasPreviouslyOffline = !effectiveOnline;

    this.currentState.effectiveOnline = effectiveOnline;

    try {
      await AsyncStorage.setItem(SIMULATE_OFFLINE_KEY, simulate ? 'true' : 'false');
    } catch {
      // Ignore storage errors
    }

    this.notifyListeners();

    if (hadOffline && effectiveOnline) {
      this.notifyReconnect();
    }
  }

  public async refresh(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      this.handleNetInfoChange(state);
    } catch (e) {
      console.warn('[NetworkService] Refresh error:', e);
    }
    return this.getState();
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onReconnect(listener: ReconnectListener): () => void {
    this.reconnectListeners.add(listener);
    return () => {
      this.reconnectListeners.delete(listener);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  private notifyReconnect() {
    this.reconnectListeners.forEach((l) => l());
  }

  public destroy() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
    this.listeners.clear();
    this.reconnectListeners.clear();
  }
}

export const networkService = new NetworkService();
