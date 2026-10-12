import { useEffect, useState } from 'react';
import { NetworkState } from '@/types/capture';
import { networkService } from '@/services/network';

export function useNetwork() {
  const [networkState, setNetworkState] = useState<NetworkState>(() =>
    networkService.getState()
  );

  useEffect(() => {
    const unsubscribe = networkService.subscribe((state) => {
      setNetworkState(state);
    });
    return unsubscribe;
  }, []);

  const toggleSimulateOffline = async (enabled: boolean) => {
    await networkService.setSimulateOffline(enabled);
  };

  const refreshNetwork = async () => {
    return await networkService.refresh();
  };

  return {
    ...networkState,
    toggleSimulateOffline,
    refreshNetwork,
  };
}
