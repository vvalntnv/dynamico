import {
  airdropFactory,
  appendTransactionMessageInstruction,
  BaseTransactionMessage,
  sendAndConfirmTransactionFactory,
  generateKeyPairSigner,
  lamports,
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
    const signer = await generateKeyPairSigner();
    const rpc = createSolanaRpc("http://127.0.0.1:8899");
    const rpcSubscriptions = createSolanaRpcSubscriptions(
      "ws://127.0.0.1:8900",
    );

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
