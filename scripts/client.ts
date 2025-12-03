import {
  type Rpc,
  type RpcSubscriptions,
  type SolanaRpcApi,
  type SolanaRpcSubscriptionsApi,
  type TransactionSigner,
  type MessageSigner,
  sendAndConfirmTransactionFactory,
} from "@solana/kit";
import { createConnections } from "./rpc/connections";
import { createAndFundWallet } from "./wallet/createWallet";
import { createComputeUnitEstimator } from "./transactions/computeUnits";
import { createTransactionSender } from "./transactions/sender";

/**
 * The client holds all the tools needed to interact with Solana
 */
export type Client = {
  estimateAndSetComputeUnitLimit: ReturnType<typeof createComputeUnitEstimator>;
  sendAndConfirmTransaction: ReturnType<typeof createTransactionSender>;
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  wallet: TransactionSigner & MessageSigner;
};

let client: Client | undefined;

/**
 * Creates a Solana client with wallet, RPC connections, and utilities
 */
export async function createClient(): Promise<Client> {
  if (client) {
    return client;
  }

  const { rpc, rpcSubscriptions } = createConnections();

  const wallet = await createAndFundWallet(rpc, rpcSubscriptions);

  const estimateAndSetComputeUnitLimit = createComputeUnitEstimator(rpc);
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  client = {
    estimateAndSetComputeUnitLimit,
    sendAndConfirmTransaction,
    rpc,
    rpcSubscriptions,
    wallet,
  };

  return client;
}
