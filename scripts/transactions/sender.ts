import {
  sendAndConfirmTransactionFactory,
  signTransactionMessageWithSigners,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  type Rpc,
  type RpcSubscriptions,
  type SolanaRpcApi,
  type SolanaRpcSubscriptionsApi,
} from "@solana/kit";

/**
 * Creates a transaction sender function
 */
export function createTransactionSender(
  rpc: Rpc<SolanaRpcApi>,
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
) {
  return sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });
}

/**
 * Signs and sends a transaction
 */
export async function signAndSendTransaction(
  transactionMessage: any,
  rpc: Rpc<SolanaRpcApi>,
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
) {
  const transaction =
    await signTransactionMessageWithSigners(transactionMessage);

  assertIsSendableTransaction(transaction);
  assertIsTransactionWithBlockhashLifetime(transaction);

  const sendAndConfirmTransaction = createTransactionSender(
    rpc,
    rpcSubscriptions,
  );

  await sendAndConfirmTransaction(transaction, {
    commitment: "confirmed",
  });
}
