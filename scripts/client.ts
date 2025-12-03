import {
  airdropFactory,
  appendTransactionMessageInstruction,
  sendAndConfirmTransactionFactory,
  generateKeyPairSigner,
  lamports,
} from "@solana/kit";

import { loadLocalWallet } from "@/wallet";
import { RPC_URL, RPC_WEBSOCKET_URL } from "./constants";

import type {
  BaseTransactionMessage,
  MessageSigner,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
  TransactionMessageWithFeePayer,
  TransactionSigner,
} from "@solana/kit";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import {
  estimateComputeUnitLimitFactory,
  getSetComputeUnitLimitInstruction,
} from "@solana-program/compute-budget";

function estimateAndSetComputeUnitLimitFactory(
  ...params: Parameters<typeof estimateComputeUnitLimitFactory>
) {
  const estimateComputeUnitLimit = estimateComputeUnitLimitFactory(...params);
  return async <
    T extends BaseTransactionMessage & TransactionMessageWithFeePayer,
  >(
    transactionMessage: T,
  ) => {
    const computeUnitsEstimate =
      await estimateComputeUnitLimit(transactionMessage);
    return appendTransactionMessageInstruction(
      getSetComputeUnitLimitInstruction({ units: computeUnitsEstimate }),
      transactionMessage,
    );
  };
}

export type Client = {
  estimateAndSetComputeUnitLimit: ReturnType<
    typeof estimateAndSetComputeUnitLimitFactory
  >;
  sendAndConfirmTransaction: ReturnType<
    typeof sendAndConfirmTransactionFactory
  >;
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  wallet: TransactionSigner & MessageSigner;
};

let client: Client | undefined;
export async function createClient(): Promise<Client> {
  if (!client) {
    const signer = await loadLocalWallet();
    const rpc = createSolanaRpc(RPC_URL);
    const rpcSubscriptions = createSolanaRpcSubscriptions(RPC_WEBSOCKET_URL);

    const airdrop = airdropFactory({ rpc, rpcSubscriptions });
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    await airdrop({
      recipientAddress: signer.address,
      lamports: lamports(100_000_000_000n),
      commitment: "confirmed",
    });

    const estimateAndSetComputeUnitLimit =
      estimateAndSetComputeUnitLimitFactory({
        rpc,
      });

    client = {
      estimateAndSetComputeUnitLimit,
      sendAndConfirmTransaction,
      rpc,
      rpcSubscriptions,
      wallet: signer,
    };
  }
  return client;
}
