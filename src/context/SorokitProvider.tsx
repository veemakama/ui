import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  type SorokitClient,
  type NetworkInfo,
  type Balance,
  type AccountData,
} from "@/lib/client";

/* ─── Context shape ──────────────────────────────────────── */
interface SorokitState {
  // Wallet
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;

  // Account
  account: AccountData | null;
  balances: Balance[];
  isLoadingAccount: boolean;

  // Network
  network: NetworkInfo | null;
  switchNetwork: (name: import("@/lib/client").NetworkName) => Promise<void>;

  // Errors
  error: string | null;
  clearError: () => void;
}

const SorokitContext = createContext<SorokitState | null>(null);

/* ─── Provider ───────────────────────────────────────────── */
interface SorokitProviderProps {
  client: SorokitClient;
  children: React.ReactNode;
}

export function SorokitProvider({ client, children }: SorokitProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load network on mount
  useEffect(() => {
    client.network.getNetwork().then(({ data, error }) => {
      if (data) setNetwork(data);
      if (error) setError(error);
    });
  }, [client]);

  // Load account when address changes
  useEffect(() => {
    if (!address) {
      setAccount(null);
      setBalances([]);
      return;
    }
    setIsLoadingAccount(true);
    Promise.all([
      client.account.getAccount(address),
      client.account.getBalances(address),
    ])
      .then(([accountRes, balancesRes]) => {
        if (accountRes.data) setAccount(accountRes.data);
        if (accountRes.error) setError(accountRes.error);
        if (balancesRes.data) setBalances(balancesRes.data);
        if (balancesRes.error) setError(balancesRes.error);
      })
      .finally(() => setIsLoadingAccount(false));
  }, [address, client]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { data, error } = await client.wallet.connect();
      if (error) {
        setError(error);
        return;
      }
      if (data?.address) setAddress(data.address);
    } finally {
      setIsConnecting(false);
    }
  }, [client]);

  const disconnectWallet = useCallback(async () => {
    await client.wallet.disconnect();
    setAddress(null);
    setAccount(null);
    setBalances([]);
  }, [client]);

  const switchNetwork = useCallback(
    async (name: import("@/lib/client").NetworkName) => {
      const { data, error } = await client.network.switchNetwork(name);
      if (data) setNetwork(data);
      if (error) setError(error);
    },
    [client],
  );

  const clearError = useCallback(() => setError(null), []);

  return (
    <SorokitContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        connectWallet,
        disconnectWallet,
        account,
        balances,
        isLoadingAccount,
        network,
        switchNetwork,
        error,
        clearError,
      }}
    >
      {children}
    </SorokitContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────── */
export function useSorokit(): SorokitState {
  const ctx = useContext(SorokitContext);
  if (!ctx)
    throw new Error(
      "[sorokit-ui] useSorokit must be used inside <SorokitProvider>",
    );
  return ctx;
}
