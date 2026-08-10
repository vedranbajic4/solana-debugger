export type NetworkId = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

export interface NetworkOption {
  id: NetworkId;
  label: string;
  rpcUrl: string;
  /** Cluster query param used by Solscan; mainnet needs none. */
  explorerCluster?: string;
  dotClass: string;
}

export const NETWORKS: NetworkOption[] = [
  {
    id: 'mainnet-beta',
    label: 'Mainnet',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    dotClass: 'bg-solana-green',
  },
  {
    id: 'devnet',
    label: 'Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    explorerCluster: 'devnet',
    dotClass: 'bg-solana-purple',
  },
  {
    id: 'testnet',
    label: 'Testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    explorerCluster: 'testnet',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'localnet',
    label: 'Localnet',
    rpcUrl: 'http://127.0.0.1:8899',
    explorerCluster: 'custom',
    dotClass: 'bg-sky-400',
  },
];

export const DEFAULT_NETWORK: NetworkId = 'mainnet-beta';

const STORAGE_KEY = 'solana-debugger:network';

export function getNetwork(id: NetworkId): NetworkOption {
  return NETWORKS.find((n) => n.id === id) ?? NETWORKS[0];
}

export function loadStoredNetwork(): NetworkId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as NetworkId | null;
    if (stored && NETWORKS.some((n) => n.id === stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable (private mode / SSR) — fall through to default
  }
  return DEFAULT_NETWORK;
}

export function storeNetwork(id: NetworkId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Persisting the choice is best-effort only
  }
}

export function explorerUrl(id: NetworkId): string {
  const cluster = getNetwork(id).explorerCluster;
  return cluster ? `https://solscan.io?cluster=${cluster}` : 'https://solscan.io';
}
