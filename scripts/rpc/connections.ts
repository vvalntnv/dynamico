import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  type Rpc,
  type RpcSubscriptions,
  type SolanaRpcApi,
  type SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { RPC_URL, RPC_WEBSOCKET_URL } from "../config/constants";

/**
 * Creates an RPC connection to the Solana network
 */
export function createRpcConnection(): Rpc<SolanaRpcApi> {
  return createSolanaRpc(RPC_URL);
}

/**
 * Creates a WebSocket RPC subscription connection
 */
export function createRpcSubscriptionConnection(): RpcSubscriptions<SolanaRpcSubscriptionsApi> {
  return createSolanaRpcSubscriptions(RPC_WEBSOCKET_URL);
}

/**
 * Creates both RPC and subscription connections
 */
export function createConnections() {
  const rpc = createRpcConnection();
  const rpcSubscriptions = createRpcSubscriptionConnection();

  return { rpc, rpcSubscriptions };
}
