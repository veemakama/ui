/**
 * sorokit-core client singleton
 *
 * All UI components must use this module to access blockchain functionality.
 * No direct blockchain logic lives in the UI — everything goes through sorokit-core.
 *
 * Usage:
 *   import { getClient } from '@/lib/client'
 *   const client = getClient()
 *   await client.wallet.connect()
 */

// Type-only import so the UI compiles even before sorokit-core is published.
// Replace with the real import once sorokit-core is available on npm.
export type SorokitClient = {
  wallet: {
    connect: () => Promise<{
      data: { address: string } | null;
      error: string | null;
      status: "idle" | "loading" | "success" | "error";
    }>;
    disconnect: () => Promise<void>;
    getAddress: () => Promise<{ data: string | null; error: string | null }>;
  };
  account: {
    getAccount: (
      address: string,
    ) => Promise<{
      data: AccountData | null;
      error: string | null;
      status: string;
    }>;
    getBalances: (
      address: string,
    ) => Promise<{ data: Balance[] | null; error: string | null }>;
  };
  transaction: {
    submit: (
      tx: unknown,
    ) => Promise<{
      data: TxResult | null;
      error: string | null;
      status: string;
    }>;
    getStatus: (
      txHash: string,
    ) => Promise<{ data: TxStatus | null; error: string | null }>;
  };
  soroban: {
    invokeContract: (
      params: InvokeParams,
    ) => Promise<{ data: unknown; error: string | null; status: string }>;
  };
  network: {
    getNetwork: () => Promise<{
      data: NetworkInfo | null;
      error: string | null;
    }>;
    switchNetwork: (
      network: NetworkName,
    ) => Promise<{ data: NetworkInfo | null; error: string | null }>;
  };
};

export type AccountData = {
  address: string;
  sequence: string;
  subentryCount: number;
};

export type Balance = {
  asset: string;
  balance: string;
  assetType:
    | "native"
    | "credit_alphanum4"
    | "credit_alphanum12"
    | "liquidity_pool_shares";
  assetCode?: string;
  assetIssuer?: string;
};

export type TxResult = {
  hash: string;
  ledger: number;
  successful: boolean;
};

export type TxStatus = "pending" | "success" | "failed" | "not_found";

export type InvokeParams = {
  contractId: string;
  method: string;
  args?: unknown[];
  sourceAccount?: string;
};

export type NetworkName = "mainnet" | "testnet" | "futurenet" | "localnet";

export type NetworkInfo = {
  name: NetworkName;
  passphrase: string;
  rpcUrl: string;
  horizonUrl: string;
};

let _client: SorokitClient | null = null;

/**
 * Initialize the sorokit client.
 * Call this once at app startup before using getClient().
 */
export function initClient(client: SorokitClient): void {
  _client = client;
}

/**
 * Get the initialized sorokit client.
 * Throws if initClient() has not been called.
 */
export function getClient(): SorokitClient {
  if (!_client) {
    throw new Error(
      "[sorokit-ui] Client not initialized. Call initClient(createSorokitClient()) before rendering UI components.",
    );
  }
  return _client;
}
